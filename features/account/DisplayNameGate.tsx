"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
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
        <p className="mb-3 text-xs text-gray-600">
          This is how you&apos;ll appear to others on key-diagram — on saved
          diagrams, layouts, and your profile. It must be unique.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
          placeholder="Display name"
          className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy || name.trim().length === 0}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Saving…" : "Continue"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
