"use client";

import { signInWithGoogle } from "@/features/auth/signInWithGoogle";

export function SignInPrompt({
  message = "Sign in to continue.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-8 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      <button
        onClick={() => signInWithGoogle()}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium shadow-sm hover:bg-gray-50 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  );
}
