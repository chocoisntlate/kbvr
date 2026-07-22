"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const { user } = useAuth();

  const signOut = () => {
    try {
      createClient().auth.signOut().catch((err) => {
        console.warn("Sign-out failed:", err);
      });
    } catch (err) {
      console.warn("Sign-out failed:", err);
    }
  };

  return (
    <div className="p-4 bg-gray-100 shadow-md flex items-center justify-between">
      <Link className="font-mono" href="/">
        key-diagram
      </Link>

      {user ? (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-600">
            {user.user_metadata?.full_name ?? user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50 transition-colors"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
