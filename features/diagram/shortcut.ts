// features/diagrams/shortcut.validate.ts

import { Shortcut, ShortcutSchema } from "../spec/diagramSchema";
import { Layout } from "../spec/layoutSchema";

/* ---------- Types ---------- */

export type EditableShortcut = {
  modifierKeys: string; // e.g. "ctrl shift" — held down with the trigger key, order doesn't matter
  triggerKey: string; // the key that completes the combo; also the key the description displays on
  description: string; // multiline text
  tags?: string; // space or comma separated
  mode?: string;
};

export type FieldErrors = {
  modifierKeys?: string;
  triggerKey?: string;
  description?: string;
  tags?: string;
  mode?: string;
};

export type ValidationResult =
  | { success: true; data: Shortcut }
  | { success: false; errors: FieldErrors };

/* ---------- Helpers ---------- */

export function getValidKeyIds(layout: Layout): Set<string> {
  return new Set(
    layout.rows
      .flat()
      .map((k) => k.id)
      .filter((id): id is string => Boolean(id)),
  );
}

export function getDisplayKey(shortcut: Shortcut): string {
  return shortcut.keys[shortcut.keys.length - 1];
}

export function parseKeys(modifierKeys: string, triggerKey: string): string[] {
  const modifiers = modifierKeys
    .split(/[+\s]+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 4);

  const trigger = triggerKey.trim();

  return trigger ? [...modifiers, trigger] : modifiers;
}

/* ---------- Normalization ---------- */

export function normalizeShortcut(input: EditableShortcut): Shortcut {
  const keys = parseKeys(input.modifierKeys, input.triggerKey);

  const tags = input.tags
    ?.split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    keys,
    description: input.description
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean),
    tags: tags && tags.length > 0 ? tags : undefined,
    mode: input.mode,
  };
}

/* ---------- Validation ---------- */

export function validateShortcut(
  input: EditableShortcut,
  ctx: {
    index: number;
    draft: EditableShortcut[];
    validKeyIds: Set<string>;
  },
): ValidationResult {
  const normalized = normalizeShortcut(input);
  const triggerKey = input.triggerKey.trim();

  /* key existence */
  const invalidKey = normalized.keys.find((k) => !ctx.validKeyIds.has(k));
  if (invalidKey) {
    const field = invalidKey === triggerKey ? "triggerKey" : "modifierKeys";
    return {
      success: false,
      errors: {
        [field]: `Unknown key ID: "${invalidKey}"`,
      },
    };
  }

  /* duplicates */
  const keysString = normalized.keys.slice().sort().join("+");
  const duplicateIndex = ctx.draft.findIndex((s, i) => {
    if (i === ctx.index) return false;
    const other = normalizeShortcut(s);
    return (
      other.keys.slice().sort().join("+") === keysString &&
      other.mode === normalized.mode
    );
  });

  if (duplicateIndex !== -1) {
    return {
      success: false,
      errors: {
        triggerKey: `Duplicate keybind (entry #${duplicateIndex + 1})`,
      },
    };
  }

  /* schema */
  const parsed = ShortcutSchema.safeParse(normalized);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field =
        issue.path[0] === "keys"
          ? "triggerKey"
          : (issue.path[0] as keyof FieldErrors);
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  return { success: true, data: normalized };
}
