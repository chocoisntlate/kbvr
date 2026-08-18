import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/*
 * Anonymous, cookie-free client for content that is identical for every
 * visitor (the landing page's featured diagrams, the sitemap). Because it
 * never touches cookies(), callers using it stay statically renderable
 * instead of being forced dynamic the way getServerAuthContext() forces them.
 *
 * It runs as the `anon` Postgres role, so RLS limits it to `is_public` rows —
 * which is exactly the visibility these callers want.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
