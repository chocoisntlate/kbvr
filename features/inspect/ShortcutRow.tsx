import { EditableShortcut, FieldErrors, parseKeys } from "../diagram/shortcut";
import { Field, Input } from "./ShortcutFormFields";

type ShortcutRowProps = {
  shortcut: EditableShortcut;
  index: number;
  isEditMode: boolean;
  isEditing: boolean;
  error?: FieldErrors;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, patch: Partial<EditableShortcut>) => void;
  onCollapse: (index: number) => void;
  rowRef: (el: HTMLDivElement | null) => void;
};

export function ShortcutRow({
  shortcut,
  index,
  isEditMode,
  isEditing,
  error = {},
  onEdit,
  onDelete,
  onUpdate,
  onCollapse,
  rowRef,
}: ShortcutRowProps) {
  const hasError = Object.keys(error).length > 0;

  return (
    <div
      ref={rowRef}
      className={`rounded-md border p-3 text-xs ${
        hasError ? "border-red-500 bg-red-50" : "border-gray-200"
      }`}
    >
      {!isEditing ? (
        <ShortcutRowCollapsed
          shortcut={shortcut}
          hasError={hasError}
          isEditMode={isEditMode}
          onEdit={() => onEdit(index)}
          onDelete={() => onDelete(index)}
        />
      ) : (
        <ShortcutRowExpanded
          shortcut={shortcut}
          error={error}
          onUpdate={(patch) => onUpdate(index, patch)}
          onCollapse={() => onCollapse(index)}
        />
      )}
    </div>
  );
}

function ShortcutRowCollapsed({
  shortcut,
  hasError,
  isEditMode,
  onEdit,
  onDelete,
}: {
  shortcut: EditableShortcut;
  hasError: boolean;
  isEditMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="font-medium">
        {[shortcut.modifierKeys, shortcut.triggerKey]
          .filter(Boolean)
          .join(" + ") || "(No keys)"}
      </div>

      {shortcut.description && (
        <ul className="mt-1 list-disc pl-4 text-gray-500">
          {shortcut.description.split("\n").map((d, idx) => (
            <li key={idx}>{d}</li>
          ))}
        </ul>
      )}

      {shortcut.tags && (
        <div className="mt-1 flex flex-wrap gap-1">
          {shortcut.tags.split(/[,\s]+/).map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {shortcut.mode && (
        <div className="mt-1 text-[11px] text-gray-500">
          Mode: {shortcut.mode}
        </div>
      )}

      {hasError && (
        <div className="mt-1 text-[11px] text-red-600">
          Invalid fields — expand to fix
        </div>
      )}

      {isEditMode && (
        <div className="mt-2 flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={onEdit}>
            Edit
          </button>
          <button className="text-red-600 hover:underline" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </>
  );
}

function ShortcutRowExpanded({
  shortcut,
  error,
  onUpdate,
  onCollapse,
}: {
  shortcut: EditableShortcut;
  error: FieldErrors;
  onUpdate: (patch: Partial<EditableShortcut>) => void;
  onCollapse: () => void;
}) {
  const keys = parseKeys(shortcut.modifierKeys, shortcut.triggerKey);

  return (
    <div className="flex flex-col gap-3">
      <Field label="Modifier keys" error={error.modifierKeys}>
        <Input
          value={shortcut.modifierKeys}
          onChange={(v) => onUpdate({ modifierKeys: v })}
          error={!!error.modifierKeys}
        />
      </Field>
      <p className="-mt-2 text-[11px] text-gray-500">
        Space separated combination of keys held down with the trigger key
      </p>

      <Field label="Trigger key" error={error.triggerKey}>
        <Input value={shortcut.triggerKey} error={!!error.triggerKey} disabled />
      </Field>
      <p className="-mt-2 text-[11px] text-gray-500">
        The key that completes the shortcut. The description will display on this key.
      </p>

      <p className="text-[11px] text-gray-500">
        Combination: <span className="font-medium">{keys.join(" + ") || "—"}</span>
      </p>

      <Field label="*Descriptions" error={error.description}>
        <textarea
          rows={3}
          className={`rounded-md border px-2 py-1 text-xs resize-none ${
            error.description ? "border-red-500" : "border-gray-300"
          }`}
          value={shortcut.description}
          onChange={(ev) => onUpdate({ description: ev.target.value })}
        />
      </Field>

      <Field label="Tags" error={error.tags}>
        <Input
          value={shortcut.tags ?? ""}
          onChange={(v) => onUpdate({ tags: v })}
          error={!!error.tags}
        />
      </Field>

      <Field label="Mode" error={error.mode}>
        <Input
          value={shortcut.mode ?? ""}
          onChange={(v) => onUpdate({ mode: v })}
          error={!!error.mode}
        />
      </Field>

      <button
        className="self-start text-blue-600 hover:underline"
        onClick={onCollapse}
      >
        Collapse
      </button>
    </div>
  );
}
