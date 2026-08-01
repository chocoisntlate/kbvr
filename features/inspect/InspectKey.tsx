"use client";

import { useCallback, useMemo, useEffect } from "react";
import { ShortcutRow } from "./ShortcutRow";
import { getValidKeyIds } from "../diagram/shortcut";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { Button } from "../ui/Button";
import { ModalShell } from "../ui/Modal";
import { useShortcutDraft } from "./hooks/useShortcutDraft";
import { useShortcutErrors } from "./hooks/useShortcutErrors";
import { useEditMode } from "./hooks/useEditMode";
import { useScrollToRow } from "./hooks/useScrollToRow";
import { useSaveShortcuts } from "./hooks/useSaveShortcuts";
import { Shortcut } from "../spec/diagramSchema";

/* ---------- Props ---------- */

export type InspectModalProps = {
  keyId: string;
  shortcuts: Shortcut[];
  activeMode: string | null;
  onClose: () => void;
};

/* ---------- Component ---------- */

export default function InspectModal({
  keyId,
  shortcuts,
  activeMode,
  onClose,
}: InspectModalProps) {
  const { keyLayout } = useKeyboardContent();

  /* ---------- Derived ---------- */

  const validKeyIds = useMemo(
    () => Array.from(getValidKeyIds(keyLayout)),
    [keyLayout],
  );

  /* ---------- Hooks ---------- */

  const { draft, update, remove, add } = useShortcutDraft(shortcuts);
  const { errors, setErrors, clearError, shiftErrorsAfterDelete } =
    useShortcutErrors();
  const { editingIndex, setEditing, collapseEdit } = useEditMode();
  const { scrollToRow, setRowRef } = useScrollToRow();
  const { validate, save } = useSaveShortcuts(
    draft,
    validKeyIds,
    keyId,
    activeMode,
  );

  /* ---------- Actions ---------- */

  const handleSaveAll = useCallback(() => {
    const { errors: nextErrors, valid, hasErrors } = validate();

    if (hasErrors) {
      setErrors(nextErrors);
      const firstErrorIndex = Number(Object.keys(nextErrors)[0]);
      setEditing(firstErrorIndex);
      scrollToRow(firstErrorIndex);
      return;
    }

    save(valid);
    onClose();
  }, [validate, setErrors, setEditing, scrollToRow, save, onClose]);

  const handleDelete = useCallback(
    (index: number) => {
      remove(index);
      shiftErrorsAfterDelete(index);
    },
    [remove, shiftErrorsAfterDelete],
  );

  const handleAddKeybind = useCallback(() => {
    const index = draft.length;

    add({
      modifierKeys: "",
      triggerKey: keyId,
      description: "",
      tags: "",
      mode: activeMode ?? undefined,
    });

    setEditing(index);
    scrollToRow(index, true);
  }, [draft.length, keyId, activeMode, add, setEditing, scrollToRow]);

  const handleCollapse = useCallback(
    (index: number) => {
      collapseEdit();
      clearError(index);
    },
    [collapseEdit, clearError],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* ---------- Render ---------- */

  return (
    <ModalShell size="md" scroll>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Keybinds for &quot;{keyId}&quot;
        </h3>

        <Button tone="neutral" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-4 flex flex-col gap-2">
        {draft.map((s, i) => (
          <ShortcutRow
            key={i}
            shortcut={s}
            index={i}
            isEditing={editingIndex === i}
            error={errors[i]}
            onEdit={setEditing}
            onDelete={handleDelete}
            onUpdate={update}
            onCollapse={handleCollapse}
            rowRef={(el) => setRowRef(i, el)}
          />
        ))}

        <Button tone="primary" className="mt-2 self-start" onClick={handleAddKeybind}>
          + Add keybind
        </Button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button tone="primary" onClick={handleSaveAll}>
          Save
        </Button>
      </div>
    </ModalShell>
  );
}
