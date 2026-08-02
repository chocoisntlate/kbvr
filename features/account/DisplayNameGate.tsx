"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/features/ui/Button";
import { ModalShell } from "@/features/ui/Modal";
import { updateDisplayName } from "./actions";

export function DisplayNameGate() {
  const { user, loading, displayName, refreshDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || !user || displayName !== null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateDisplayName(name);
      await refreshDisplayName();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell>
      <form onSubmit={handleSubmit}>
        <h3 className="mb-2 text-sm font-semibold">Choose a display name</h3>
        <p className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">
          This is how you&apos;ll appear to others on kbvr — on saved
          diagrams, layouts, and your profile. It must be unique.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
          placeholder="Display name"
          className="mb-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
        />
        {error && (
          <p className="mb-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || name.trim().length === 0}>
            {busy ? "Saving…" : "Continue"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
