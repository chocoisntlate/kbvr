"use client";

import { useState } from "react";
import { ModalShell } from "@/features/ui/Modal";

export function VisibilityDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: (isPublic: boolean) => void;
}) {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <ModalShell>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="mb-4 flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={isPublic}
            onChange={() => setIsPublic(true)}
          />
          Public — anyone can find and view this
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!isPublic}
            onChange={() => setIsPublic(false)}
          />
          Private — only visible to you
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="text-xs text-gray-600 hover:underline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="text-xs font-medium text-blue-600 hover:underline"
          onClick={() => onConfirm(isPublic)}
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

export function ForkChoiceDialog({
  kind,
  onCancel,
  onChooseDuplicate,
  onChooseOriginal,
}: {
  kind: "diagram" | "layout";
  onCancel: () => void;
  onChooseDuplicate: () => void;
  onChooseOriginal: () => void;
}) {
  return (
    <ModalShell>
      <h3 className="mb-3 text-sm font-semibold">
        This {kind} was created by someone else
      </h3>
      <p className="mb-4 text-xs text-gray-600">
        Save the original to keep it in sync with the author&apos;s future
        changes, or save a duplicate to make your own independent copy.
      </p>
      <div className="flex flex-col gap-2">
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
          onClick={onChooseOriginal}
        >
          Save the original
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
          onClick={onChooseDuplicate}
        >
          Save as duplicate
        </button>
        <button
          className="text-xs text-gray-600 hover:underline"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}
