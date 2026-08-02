"use server";

import { cookies } from "next/headers";
import * as z from "zod";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { DisplayNameSchema, PasswordSchema } from "@/features/account/validation";

const SYNTHETIC_EMAIL_DOMAIN = "users.kbvr.local";
const GENERIC_SIGN_IN_ERROR = "Incorrect username or password.";

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
}): Promise<void> {
  let displayName: string;
  try {
    displayName = DisplayNameSchema.parse(username);
    PasswordSchema.parse(password);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.issues[0]?.message ?? "Invalid username or password.");
    }
    throw err;
  }

  const authEmail =
    email?.trim() || `${slugifyUsername(displayName)}@${SYNTHETIC_EMAIL_DOMAIN}`;

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { username: displayName },
  });
  if (createError) {
    throw new Error(
      /registered/i.test(createError.message)
        ? "That username is already taken."
        : createError.message,
    );
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    display_name: displayName,
    login_email: authEmail,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(
      profileError.code === "23505"
        ? "That username is already taken."
        : profileError.message,
    );
  }

  const supabase = createClient(await cookies());
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });
  if (signInError) throw signInError;
}

export async function signInWithUsername(
  username: string,
  password: string,
): Promise<void> {
  const loginEmail = await resolveLoginEmail(username);
  if (!loginEmail) throw new Error(GENERIC_SIGN_IN_ERROR);

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });
  if (error) throw new Error(GENERIC_SIGN_IN_ERROR);
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
