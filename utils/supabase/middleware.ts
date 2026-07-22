import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "./config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      },
    );

    // Refreshing the auth token must happen here (do not remove): this is what
    // actually triggers the cookie getAll/setAll calls above. Supabase's SDK
    // only reads/writes session cookies lazily, when an auth method is called.
    await supabase.auth.getUser();
  } catch (err) {
    console.warn("Supabase unavailable, passing request through:", err);
  }

  return supabaseResponse
};