"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getServerAuthContext } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { DisplayNameSchema } from "./validation";

async function requireUser() {
  const { supabase, user } = await getServerAuthContext();
  if (!supabase || !user) throw new Error("You must be signed in to do this.");
  return { supabase, user };
}

function revalidateAccountPages() {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/library");
  revalidatePath("/account");
}

export async function updateDisplayName(name: string): Promise<void> {
  const { supabase, user } = await requireUser();

  let displayName: string;
  try {
    displayName = DisplayNameSchema.parse(name);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.issues[0]?.message ?? "Invalid display name.");
    }
    throw err;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName });
  if (error) {
    if (error.code === "23505") {
      throw new Error("That display name is already taken.");
    }
    throw error;
  }

  // Keep existing posts' attribution in sync immediately, rather than only
  // on next save.
  await Promise.all([
    supabase
      .from("diagrams")
      .update({ owner_display_name: displayName })
      .eq("owner_id", user.id),
    supabase
      .from("layouts")
      .update({ owner_display_name: displayName })
      .eq("owner_id", user.id),
  ]);

  revalidateAccountPages();
}

/*
 * Deletes the signed-in user's account entirely: their auth user, profile,
 * owned diagrams/layouts, and saved bookmarks (the last three via existing
 * `on delete cascade` foreign keys — see supabase/migrations/0001_posts_schema.sql).
 * Identity is confirmed via the caller's own session before the privileged
 * admin call, so a user can only ever delete themselves.
 */
export async function deleteAccount(): Promise<void> {
  const { user } = await requireUser();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw error;

  revalidateAccountPages();
}
