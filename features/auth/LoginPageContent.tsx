"use client";

import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { PasswordAuthForm } from "@/features/auth/PasswordAuthForm";
import { Button } from "@/features/ui/Button";

export function LoginPageContent() {
  return (
    <div className="flex flex-col gap-4">
      <Button size="md" className="w-full" onClick={() => signInWithGoogle()}>
        Sign in with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        or
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <PasswordAuthForm />
    </div>
  );
}
