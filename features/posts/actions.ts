"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import {
  createClient,
  getServerAuthContext,
  type AuthUser,
} from "@/utils/supabase/server";
import { DiagramSchema, type Diagram } from "@/features/spec/diagramSchema";
import { LayoutSchema, type Layout } from "@/features/spec/layoutSchema";
import { PostMeta } from "./types";
import { OFFICIAL_ACCOUNT_EMAILS } from "./officialAccounts";

type PostTable = "diagrams" | "layouts";
type SavedTable = "saved_diagrams" | "saved_layouts";

async function requireUser() {
  const { supabase, user } = await getServerAuthContext();
  if (!supabase || !user) throw new Error("You must be signed in to do this.");
  return { supabase, user };
}

function isOfficialAccount(user: AuthUser): boolean {
  return !!user.email && OFFICIAL_ACCOUNT_EMAILS.includes(user.email);
}

async function ownerDisplayName(
  supabase: ReturnType<typeof createClient>,
  user: AuthUser,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.display_name ?? user.fullName ?? user.email ?? null;
}

function revalidatePostPages() {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/library");
}

/* ---------- Shared helpers ---------- */

async function insertPost<T>(
  table: PostTable,
  schema: z.ZodType<T>,
  data: T,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();
  const parsed = schema.parse(data);
  const displayName = await ownerDisplayName(supabase, user);
  const isOfficial = isOfficialAccount(user);

  const { data: row, error } = await supabase
    .from(table)
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: parsed,
      is_public: isPublic,
      is_official: isOfficial,
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
    isOfficial,
  };
}

async function updatePost<T>(
  table: PostTable,
  schema: z.ZodType<T>,
  id: string,
  data: T,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const parsed = schema.parse(data);

  const { error } = await supabase
    .from(table)
    .update({ data: parsed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;

  revalidatePostPages();
}

async function duplicatePost<T>(
  table: PostTable,
  schema: z.ZodType<T>,
  sourceId: string,
  isPublic: boolean,
): Promise<PostMeta> {
  const { supabase, user } = await requireUser();

  const { data: source, error: sourceError } = await supabase
    .from(table)
    .select("data")
    .eq("id", sourceId)
    .single();
  if (sourceError) throw sourceError;

  // re-validate rather than trusting the stored row is still well-formed
  const parsed = schema.parse(source.data);
  const displayName = await ownerDisplayName(supabase, user);
  const isOfficial = isOfficialAccount(user);

  const { data: row, error } = await supabase
    .from(table)
    .insert({
      owner_id: user.id,
      owner_display_name: displayName,
      data: parsed,
      is_public: isPublic,
      is_official: isOfficial,
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
    isOfficial,
    isSavedByMe: false,
  };
}

async function toggleVisibility(
  table: PostTable,
  id: string,
  isPublic: boolean,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(table)
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

async function deletePost(table: PostTable, id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
  revalidatePostPages();
}

async function saveReference(
  sourceTable: PostTable,
  savedTable: SavedTable,
  idColumn: string,
  id: string,
): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: source, error: sourceError } = await supabase
    .from(sourceTable)
    .select("owner_id")
    .eq("id", id)
    .single();
  if (sourceError) throw sourceError;
  if (source.owner_id === user.id) {
    throw new Error("You already own this.");
  }

  const { error } = await supabase
    .from(savedTable)
    .upsert({ user_id: user.id, [idColumn]: id });
  if (error) throw error;
  revalidatePostPages();
}

async function removeSavedReference(
  savedTable: SavedTable,
  idColumn: string,
  id: string,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(savedTable)
    .delete()
    .eq("user_id", user.id)
    .eq(idColumn, id);
  if (error) throw error;
  revalidatePostPages();
}

/* ---------- Diagrams ---------- */

export async function saveNewDiagram(
  data: Diagram,
  isPublic: boolean,
): Promise<PostMeta> {
  return insertPost("diagrams", DiagramSchema, data, isPublic);
}

export async function updateDiagram(id: string, data: Diagram): Promise<void> {
  return updatePost("diagrams", DiagramSchema, id, data);
}

export async function duplicateDiagram(
  sourceId: string,
  isPublic: boolean,
): Promise<PostMeta> {
  return duplicatePost("diagrams", DiagramSchema, sourceId, isPublic);
}

export async function saveDiagramReference(diagramId: string): Promise<void> {
  return saveReference("diagrams", "saved_diagrams", "diagram_id", diagramId);
}

export async function removeSavedDiagram(diagramId: string): Promise<void> {
  return removeSavedReference("saved_diagrams", "diagram_id", diagramId);
}

export async function toggleDiagramVisibility(
  id: string,
  isPublic: boolean,
): Promise<void> {
  return toggleVisibility("diagrams", id, isPublic);
}

export async function deleteDiagram(id: string): Promise<void> {
  return deletePost("diagrams", id);
}

/* ---------- Layouts ---------- */

export async function saveNewLayout(
  data: Layout,
  isPublic: boolean,
): Promise<PostMeta> {
  return insertPost("layouts", LayoutSchema, data, isPublic);
}

export async function updateLayout(id: string, data: Layout): Promise<void> {
  return updatePost("layouts", LayoutSchema, id, data);
}

export async function duplicateLayout(
  sourceId: string,
  isPublic: boolean,
): Promise<PostMeta> {
  return duplicatePost("layouts", LayoutSchema, sourceId, isPublic);
}

export async function saveLayoutReference(layoutId: string): Promise<void> {
  return saveReference("layouts", "saved_layouts", "layout_id", layoutId);
}

export async function removeSavedLayout(layoutId: string): Promise<void> {
  return removeSavedReference("saved_layouts", "layout_id", layoutId);
}

export async function toggleLayoutVisibility(
  id: string,
  isPublic: boolean,
): Promise<void> {
  return toggleVisibility("layouts", id, isPublic);
}

export async function setDefaultLayout(layoutId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const [{ error: saveError }, { error: profileError }] = await Promise.all([
    supabase
      .from("saved_layouts")
      .upsert({ user_id: user.id, layout_id: layoutId }),
    supabase
      .from("profiles")
      .upsert({ id: user.id, default_layout_id: layoutId }),
  ]);
  if (saveError) throw saveError;
  if (profileError) throw profileError;

  revalidatePostPages();
}

export async function deleteLayout(id: string): Promise<void> {
  return deletePost("layouts", id);
}
