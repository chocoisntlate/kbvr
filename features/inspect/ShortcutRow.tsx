import { EditableShortcut, FieldErrors, parseKeys } from "../diagram/shortcut";
import { Button } from "../ui/Button";
import { Field, Input } from "./ShortcutFormFields";

type ShortcutRowProps = {
  shortcut: EditableShortcut;
  index: number;
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
        hasError
          ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/40"
          : "border-neutral-200 dark:border-neutral-700"
      }`}
    >
      {!isEditing ? (
        <ShortcutRowCollapsed
          shortcut={shortcut}
          hasError={hasError}
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
  onEdit,
  onDelete,
}: {
  shortcut: EditableShortcut;
  hasError: boolean;
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
        <ul className="mt-1 list-disc pl-4 text-neutral-500 dark:text-neutral-400">
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
              className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[11px] dark:bg-neutral-700 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {shortcut.mode && (
        <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Mode: {shortcut.mode}
        </div>
      )}

      {hasError && (
        <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">
          Invalid fields — expand to fix
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <Button tone="primary" onClick={onEdit}>
          Edit
        </Button>
        <Button tone="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
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
      <p className="-mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        Space separated combination of keys held down with the trigger key
      </p>

      <Field label="Trigger key" error={error.triggerKey}>
        <Input
          value={shortcut.triggerKey}
          error={!!error.triggerKey}
          disabled
        />
      </Field>
      <p className="-mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        The key that completes the shortcut. The description will display on
        this key.
      </p>

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Combination:{" "}
        <span className="font-medium">{keys.join(" + ") || "—"}</span>
      </p>

      <Field label="*Descriptions" error={error.description}>
        <textarea
          rows={3}
          className={`rounded-md border px-2 py-1 text-xs resize-none dark:bg-neutral-800 dark:text-neutral-100 ${
            error.description
              ? "border-red-500 dark:border-red-500"
              : "border-neutral-300 dark:border-neutral-700"
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

      <Button tone="primary" className="self-start" onClick={onCollapse}>
        Collapse
      </Button>
    </div>
  );
}
