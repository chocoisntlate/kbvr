/*
 * One-time seed: creates a "key-diagram" system account and publishes the
 * canonical starter diagram/layout owned by it, so they're browsable by
 * everyone and new users can be auto-seeded with the layout as their
 * default (see ensureDefaultLayoutSeeded in features/posts/actions.ts).
 *
 * Run manually: npm run seed:defaults
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never expose this to
 * the client — it bypasses RLS).
 */

import { createClient } from "@supabase/supabase-js";
import { DiagramSchema } from "../features/spec/diagramSchema";
import { LayoutSchema } from "../features/spec/layoutSchema";
import { INTRODUCTION_DIAGRAM } from "../examples/default.diagram";
import { QWERTY_US_80 } from "../examples/default.layout";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const SYSTEM_EMAIL = "system@key-diagram.local";
const SYSTEM_DISPLAY_NAME = "key-diagram";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function findOrCreateSystemUser(): Promise<string> {
  const { data: existing, error: listError } =
    await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const found = existing.users.find((u) => u.email === SYSTEM_EMAIL);
  if (found) return found.id;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: SYSTEM_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: SYSTEM_DISPLAY_NAME },
    });
  if (createError) throw createError;
  return created.user.id;
}

async function upsertSeedLayout(ownerId: string): Promise<string> {
  const data = LayoutSchema.parse(QWERTY_US_80);

  const { data: existing, error: findError } = await supabase
    .from("layouts")
    .select("id")
    .eq("is_seed_default", true)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from("layouts")
      .update({ owner_id: ownerId, owner_display_name: SYSTEM_DISPLAY_NAME, data })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("layouts")
    .insert({
      owner_id: ownerId,
      owner_display_name: SYSTEM_DISPLAY_NAME,
      data,
      is_public: true,
      is_seed_default: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
}

async function upsertSeedDiagram(ownerId: string): Promise<string> {
  const data = DiagramSchema.parse(INTRODUCTION_DIAGRAM);

  const { data: existing, error: findError } = await supabase
    .from("diagrams")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("name", data.name)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from("diagrams")
      .update({ owner_display_name: SYSTEM_DISPLAY_NAME, data })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("diagrams")
    .insert({
      owner_id: ownerId,
      owner_display_name: SYSTEM_DISPLAY_NAME,
      data,
      is_public: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
}

async function main() {
  const ownerId = await findOrCreateSystemUser();
  console.log(`System user: ${ownerId}`);

  const layoutId = await upsertSeedLayout(ownerId);
  console.log(`Seeded default layout: ${layoutId}`);

  const diagramId = await upsertSeedDiagram(ownerId);
  console.log(`Seeded default diagram: ${diagramId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
