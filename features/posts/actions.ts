"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { DiagramSchema, type Diagram } from "@/features/spec/diagramSchema";
import { LayoutSchema, type Layout } from "@/features/spec/layoutSchema";
import { PostMeta } from "./types";

async function requireUser() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to do this.");
  return { supabase, user };
}

async function ownerDisplayName(
  supabase: ReturnType<typeof createClient>,
  user: User,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return (
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    null
  );
}

function revalidatePostPages() {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/library");
}

/* ---------- Diagrams ---------- */

export async function saveNewDiagram(
  data: Diagram,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();
  const parsed = DiagramSchema.parse(data);
  const displayName = await ownerDisplayName(supabase, user);

  const { data: row, error } = await supabase
    .from("diagrams")
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: parsed,
      is_public: isPublic,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePostPages();
  return {
    id: row.id,
    ownerId: user.id,
    ownerDisplayName: displayName,
    isPublic,
    isSavedByMe: false,
  };
}

export async function updateDiagram(id: string, data: Diagram): Promise<void> {
  const { supabase, user } = await requireUser();
  const parsed = DiagramSchema.parse(data);

  const { error } = await supabase
    .from("diagrams")
    .update({ data: parsed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;

  revalidatePostPages();
}

export async function duplicateDiagram(
  sourceId: string,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();

  const { data: source, error: sourceError } = await supabase
    .from("diagrams")
    .select("data")
    .eq("id", sourceId)
    .single();
  if (sourceError) throw sourceError;

  const displayName = await ownerDisplayName(supabase, user);
  const { data: row, error } = await supabase
    .from("diagrams")
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: source.data,
      is_public: isPublic,
      forked_from_id: sourceId,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePostPages();
  return {
    id: row.id,
    ownerId: user.id,
    ownerDisplayName: displayName,
    isPublic,
    isSavedByMe: false,
  };
}

export async function saveDiagramReference(diagramId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_diagrams")
    .upsert({ user_id: user.id, diagram_id: diagramId });
  if (error) throw error;
  revalidatePostPages();
}

export async function removeSavedDiagram(diagramId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_diagrams")
    .delete()
    .eq("user_id", user.id)
    .eq("diagram_id", diagramId);
  if (error) throw error;
  revalidatePostPages();
}

export async function toggleDiagramVisibility(
  id: string,
  isPublic: boolean,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("diagrams")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

export async function deleteDiagram(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("diagrams")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

/* ---------- Layouts ---------- */

export async function saveNewLayout(
  data: Layout,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();
  const parsed = LayoutSchema.parse(data);
  const displayName = await ownerDisplayName(supabase, user);

  const { data: row, error } = await supabase
    .from("layouts")
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: parsed,
      is_public: isPublic,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePostPages();
  return {
    id: row.id,
    ownerId: user.id,
    ownerDisplayName: displayName,
    isPublic,
    isSavedByMe: false,
  };
}

export async function updateLayout(id: string, data: Layout): Promise<void> {
  const { supabase, user } = await requireUser();
  const parsed = LayoutSchema.parse(data);

  const { error } = await supabase
    .from("layouts")
    .update({ data: parsed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;

  revalidatePostPages();
}

export async function duplicateLayout(
  sourceId: string,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();

  const { data: source, error: sourceError } = await supabase
    .from("layouts")
    .select("data")
    .eq("id", sourceId)
    .single();
  if (sourceError) throw sourceError;

  const displayName = await ownerDisplayName(supabase, user);
  const { data: row, error } = await supabase
    .from("layouts")
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: source.data,
      is_public: isPublic,
      forked_from_id: sourceId,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePostPages();
  return {
    id: row.id,
    ownerId: user.id,
    ownerDisplayName: displayName,
    isPublic,
    isSavedByMe: false,
  };
}

export async function saveLayoutReference(layoutId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_layouts")
    .upsert({ user_id: user.id, layout_id: layoutId });
  if (error) throw error;
  revalidatePostPages();
}

export async function removeSavedLayout(layoutId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_layouts")
    .delete()
    .eq("user_id", user.id)
    .eq("layout_id", layoutId);
  if (error) throw error;
  revalidatePostPages();
}

export async function toggleLayoutVisibility(
  id: string,
  isPublic: boolean,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("layouts")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

export async function setDefaultLayout(layoutId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error: saveError } = await supabase
    .from("saved_layouts")
    .upsert({ user_id: user.id, layout_id: layoutId });
  if (saveError) throw saveError;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, default_layout_id: layoutId });
  if (profileError) throw profileError;

  revalidatePostPages();
}

export async function deleteLayout(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("layouts")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

/*
 * Best-effort: give every signed-in user a default layout without requiring
 * them to click anything, by bookmarking the canonical seed layout (see
 * scripts/seedDefaults.ts) the first time they don't already have one.
 * Silently no-ops if the seed hasn't been run yet or on any failure — this
 * runs on every page load for signed-in users, not from a user click, so it
 * must never break rendering.
 */
export async function ensureDefaultLayoutSeeded(): Promise<void> {
  try {
    const supabase = createClient(await cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("default_layout_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.default_layout_id) return;

    const { data: seedLayout } = await supabase
      .from("layouts")
      .select("id")
      .eq("is_seed_default", true)
      .maybeSingle();
    if (!seedLayout) return;

    await supabase
      .from("saved_layouts")
      .upsert({ user_id: user.id, layout_id: seedLayout.id });
    await supabase
      .from("profiles")
      .upsert({ id: user.id, default_layout_id: seedLayout.id });
  } catch (err) {
    console.warn("Could not seed default layout:", err);
  }
}
