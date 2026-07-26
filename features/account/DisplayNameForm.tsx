"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
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
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <button
          type="submit"
          disabled={busy || name.trim().length === 0}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && !error && <p className="text-xs text-green-600">Saved.</p>}
    </form>
  );
}
