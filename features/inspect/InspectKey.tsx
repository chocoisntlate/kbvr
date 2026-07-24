"use client";

import { useCallback, useMemo, useEffect } from "react";
import { ShortcutRow } from "./ShortcutRow";
import { getValidKeyIds } from "../diagram/shortcut";
import { useKeyboard } from "../keyboard/KeyboardContext";
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
  onClose: () => void;
};

/* ---------- Component ---------- */

export default function InspectModal({
  keyId,
  shortcuts,
  onClose,
}: InspectModalProps) {
  const { keyLayout } = useKeyboard();

  /* ---------- Derived ---------- */

  const validKeyIds = useMemo(
    () => Array.from(getValidKeyIds(keyLayout)),
    [keyLayout],
  );

  /* ---------- Hooks ---------- */

  const { draft, update, remove, add } = useShortcutDraft(shortcuts);
  const {
    errors,
    setErrors,
    clearError,
    clearAllErrors,
    shiftErrorsAfterDelete,
  } = useShortcutErrors();
  const { isEditMode, editingIndex, enterEditMode, setEditing, collapseEdit } =
    useEditMode();
  const { scrollToRow, setRowRef } = useScrollToRow();
  const { validate, save } = useSaveShortcuts(draft, validKeyIds, keyId);

  /* ---------- Actions ---------- */

  const handleSaveAll = useCallback(() => {
    const { errors: nextErrors, valid, hasErrors } = validate();

    if (hasErrors) {
      setErrors(nextErrors);
      enterEditMode();
      const firstErrorIndex = Number(Object.keys(nextErrors)[0]);
      setEditing(firstErrorIndex);
      scrollToRow(firstErrorIndex);
      return;
    }

    save(valid);
    onClose();
  }, [
    validate,
    setErrors,
    enterEditMode,
    setEditing,
    scrollToRow,
    save,
    onClose,
  ]);

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
      displayKey: keyId,
      keys: "",
      description: "",
      tags: "",
    });

    setEditing(index);
    scrollToRow(index, true);
  }, [draft.length, keyId, add, setEditing, scrollToRow]);

  const handleEnterEditMode = useCallback(() => {
    enterEditMode();
    clearAllErrors();
  }, [enterEditMode, clearAllErrors]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md max-h-[90vh] rounded-lg bg-white p-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Keybinds for "{keyId}"</h3>

          <div className="flex gap-2">
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={handleEnterEditMode}
            >
              Edit keybinds
            </button>
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-4 flex flex-col gap-2">
          {draft.map((s, i) => (
            <ShortcutRow
              key={i}
              shortcut={s}
              index={i}
              isEditMode={isEditMode}
              isEditing={isEditMode && editingIndex === i}
              error={errors[i]}
              onEdit={setEditing}
              onDelete={handleDelete}
              onUpdate={update}
              onCollapse={handleCollapse}
              rowRef={(el) => setRowRef(i, el)}
            />
          ))}

          {isEditMode && (
            <button
              className="mt-2 text-xs text-green-600 hover:underline"
              onClick={handleAddKeybind}
            >
              + Add keybind
            </button>
          )}
        </div>

        {isEditMode && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="text-xs text-gray-600 hover:underline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="text-xs text-blue-600 hover:underline font-medium"
              onClick={handleSaveAll}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
