"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ModalShell } from "@/features/ui/Modal";
import { deleteAccount } from "./actions";

export function DeleteAccountDialog({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canConfirm = confirmText.trim() === displayName;

  const closeDialog = () => {
    setOpen(false);
    setConfirmText("");
    setError(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      await createClient()
        .auth.signOut()
        .catch(() => {});
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700">
        Danger zone
      </h2>
      <p className="mt-1 mb-3 text-xs text-red-700">
        Deleting your account permanently removes every diagram and layout
        you own, along with your saved items. This can&apos;t be undone.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
      >
        Delete account
      </button>

      {open && (
        <ModalShell>
          <h3 className="mb-2 text-sm font-semibold">Delete your account?</h3>
          <p className="mb-3 text-xs text-gray-600">
            Type your display name (<strong>{displayName}</strong>) to
            confirm. This can&apos;t be undone.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={displayName}
            autoFocus
            className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              className="text-xs text-gray-600 hover:underline"
              onClick={closeDialog}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleDelete}
              disabled={!canConfirm || busy}
            >
              {busy ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
