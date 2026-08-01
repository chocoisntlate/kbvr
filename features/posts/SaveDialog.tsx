"use client";

import { useState } from "react";
import { Button } from "@/features/ui/Button";
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
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="ghost" tone="primary" onClick={() => onConfirm(isPublic)}>
          Save
        </Button>
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
      <p className="mb-4 text-xs text-neutral-600 dark:text-neutral-400">
        Save the original to keep it in sync with the author&apos;s future
        changes, or save a duplicate to make your own independent copy.
      </p>
      <div className="flex flex-col gap-2">
        <Button size="md" onClick={onChooseOriginal}>
          Save the original
        </Button>
        <Button size="md" onClick={onChooseDuplicate}>
          Save as duplicate
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </ModalShell>
  );
}
