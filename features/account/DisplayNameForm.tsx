"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/features/ui/Button";
import { updateDisplayName } from "./actions";

export function DisplayNameForm({ initialName }: { initialName: string }) {
  const { refreshDisplayName } = useAuth();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateDisplayName(name);
      await refreshDisplayName();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Display name
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          maxLength={30}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <Button
          type="submit"
          size="md"
          disabled={busy || name.trim().length === 0}
        >
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {saved && !error && (
        <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>
      )}
    </form>
  );
}
