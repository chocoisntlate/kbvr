"use client";

import Link from "next/link";
import { KeySquare } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { Button } from "@/features/ui/Button";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const { user, displayName } = useAuth();

  const signOut = () => {
    try {
      createClient()
        .auth.signOut()
        .catch((err) => {
          console.warn("Sign-out failed:", err);
        });
    } catch (err) {
      console.warn("Sign-out failed:", err);
    }
  };

  return (
    <div className="p-4 bg-neutral-100 shadow-md flex items-center justify-between dark:bg-neutral-800">
      <div className="flex items-center gap-4">
        <Link className="flex items-center gap-1.5 font-mono" href="/">
          <KeySquare
            className="h-4 w-4 text-teal-500 dark:text-teal-400"
            aria-hidden="true"
          />
          kbvr
        </Link>
        <nav className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <Link
            href="/browse"
            className="hover:text-neutral-900 transition-colors dark:hover:text-neutral-100"
          >
            Browse
          </Link>
          <Link
            href="/library"
            className="hover:text-neutral-900 transition-colors dark:hover:text-neutral-100"
          >
            Library
          </Link>
        </nav>
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/account"
            className="text-neutral-600 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {displayName ?? user.user_metadata?.full_name ?? user.email}
          </Link>
          <Button onClick={signOut}>Sign out</Button>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={() => signInWithGoogle()}>
            Sign in with Google
          </Button>
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
