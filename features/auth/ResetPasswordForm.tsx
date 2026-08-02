"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/features/ui/Button";
import { PasswordSchema } from "@/features/account/validation";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = PasswordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Your password has been updated.{" "}
        <Link href="/" className="text-teal-600 hover:underline dark:text-teal-400">
          Return home
        </Link>
        .
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        autoComplete="new-password"
        autoFocus
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" tone="primary" disabled={busy || !password}>
          {busy ? "Saving…" : "Set new password"}
        </Button>
      </div>
    </form>
  );
}
