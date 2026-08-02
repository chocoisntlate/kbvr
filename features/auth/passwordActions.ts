"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  DisplayNameSchema,
  PasswordSchema,
} from "@/features/account/validation";

const SYNTHETIC_EMAIL_DOMAIN = "users.kbvr.local";
const GENERIC_SIGN_IN_ERROR = "Incorrect username or password.";

/*
 * Server Actions redact any *thrown* error's message in production (replaced
 * with a generic digest), even though the rejection still reaches the
 * caller's try/catch — so expected, user-facing failures (bad password,
 * taken username, invalid input) must come back as a normal return value
 * instead of a throw. Only truly unexpected errors should still throw.
 */
export type AuthResult = { ok: true } | { ok: false; error: string };

function slugifyUsername(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
}

/*
 * profiles RLS only permits owner reads, so resolving "username -> auth email"
 * has to go through the service-role admin client rather than a normal query.
 * Never expose the resolved email to the client — only use it to drive a
 * server-side sign-in/reset call.
 */
async function resolveLoginEmail(username: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("login_email")
    .ilike("display_name", username)
    .maybeSingle();
  return data?.login_email ?? null;
}

export async function signUpWithPassword({
  username,
  password,
  email,
}: {
  username: string;
  password: string;
  email?: string;
}): Promise<AuthResult> {
  const usernameResult = DisplayNameSchema.safeParse(username);
  if (!usernameResult.success) {
    return {
      ok: false,
      error: usernameResult.error.issues[0]?.message ?? "Invalid username.",
    };
  }
  const passwordResult = PasswordSchema.safeParse(password);
  if (!passwordResult.success) {
    return {
      ok: false,
      error: passwordResult.error.issues[0]?.message ?? "Invalid password.",
    };
  }
  const displayName = usernameResult.data;

  const authEmail =
    email?.trim() ||
    `${slugifyUsername(displayName)}@${SYNTHETIC_EMAIL_DOMAIN}`;

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: { username: displayName },
    });
  if (createError) {
    return {
      ok: false,
      error: /registered/i.test(createError.message)
        ? "That username is already taken."
        : createError.message,
    };
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    display_name: displayName,
    login_email: authEmail,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return {
      ok: false,
      error:
        profileError.code === "23505"
          ? "That username is already taken."
          : profileError.message,
    };
  }

  const supabase = createClient(await cookies());
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });
  if (signInError) return { ok: false, error: signInError.message };

  redirect("/");
}

export async function signInWithUsername(
  username: string,
  password: string,
): Promise<AuthResult> {
  const loginEmail = await resolveLoginEmail(username);
  if (!loginEmail) return { ok: false, error: GENERIC_SIGN_IN_ERROR };

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });
  if (error) return { ok: false, error: GENERIC_SIGN_IN_ERROR };

  redirect("/");
}

export async function requestPasswordReset(
  username: string,
  origin: string,
): Promise<void> {
  const loginEmail = await resolveLoginEmail(username);
  if (loginEmail) {
    const supabase = createClient(await cookies());
    await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  }
  // Always resolve the same way regardless of whether the username existed,
  // so this can't be used to enumerate accounts.
}
