import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/*
 * Service-role client — bypasses RLS entirely. Only ever import this from
 * "use server" action files, never from anything that could be bundled for
 * the client; leaking SUPABASE_SERVICE_ROLE_KEY would let anyone read/write
 * every row in the database.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) is not configured.",
    );
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}
