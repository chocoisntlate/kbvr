import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

export type ServerAuthContext = {
  supabase: SupabaseClient | null;
  user: User | null;
};

// Memoized per request/render pass: every caller within the same navigation
// (layout, page, nested query functions) shares one auth.getUser() call
// instead of each re-hitting Supabase's Auth API.
export const getServerAuthContext = cache(async (): Promise<ServerAuthContext> => {
  if (!isSupabaseConfigured()) {
    return { supabase: null, user: null };
  }
  const supabase = createClient(await cookies());
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch (err) {
    console.warn("Supabase unavailable, continuing signed out:", err);
    return { supabase, user: null };
  }
});