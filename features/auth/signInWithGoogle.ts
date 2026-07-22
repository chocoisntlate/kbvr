import { createClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured; cannot sign in.");
    return;
  }

  try {
    return await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  } catch (err) {
    console.warn("Sign-in failed:", err);
  }
}
