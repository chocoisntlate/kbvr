"use client";

import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { Button } from "@/features/ui/Button";

export function SignInPrompt({
  message = "Sign in to continue.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
      <Button size="md" onClick={() => signInWithGoogle()}>
        Sign in with Google
      </Button>
    </div>
  );
}
