import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// Only what callers actually read. Sourced from verified JWT claims rather
// than a full auth.users row, so resolving it costs no network round trip.
export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

export type ServerAuthContext = {
  supabase: SupabaseClient | null;
  user: AuthUser | null;
};

// Memoized per request/render pass: every caller within the same navigation
// (layout, page, nested query functions) shares one identity resolution
// instead of each re-deriving it.
//
// getClaims() verifies the access token locally against a cached JWKS, so
// unlike getUser() this does not hit the Auth server on every render. The
// tradeoff is that a revoked session stays valid until its token expires.
export const getServerAuthContext = cache(
  async (): Promise<ServerAuthContext> => {
    if (!isSupabaseConfigured()) {
      return { supabase: null, user: null };
    }
    const supabase = createClient(await cookies());
    try {
      const { data } = await supabase.auth.getClaims();
      const claims = data?.claims;
      if (!claims?.sub) return { supabase, user: null };
      const fullName = claims.user_metadata?.full_name;
      return {
        supabase,
        user: {
          id: claims.sub,
          email: claims.email ?? null,
          fullName: typeof fullName === "string" ? fullName : null,
        },
      };
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
      return { supabase, user: null };
    }
  },
);
