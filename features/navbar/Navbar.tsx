"use client";

import Link from "next/link";
import { KeySquare } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
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
    <div className="p-4 bg-neutral-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-800">
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
            My Library
          </Link>
        </nav>
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/account"
            className="truncate max-w-[10rem] text-neutral-600 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {displayName ?? user.user_metadata?.full_name ?? user.email}
          </Link>
          <Button onClick={signOut}>Sign out</Button>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
          >
            Sign in
          </Link>
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
