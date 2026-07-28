import { useCallback, useState } from "react";
import { Shortcut } from "../../spec/diagramSchema";
import { EditableShortcut, getDisplayKey } from "../../diagram/shortcut";

function normalizeShortcut(s: Shortcut): EditableShortcut {
  return {
    modifierKeys: s.keys.slice(0, -1).join(" + "),
    triggerKey: getDisplayKey(s),
    description: s.description.join("\n"),
    tags: s.tags?.join(" "),
    mode: s.mode,
  };
}

export function useShortcutDraft(initialShortcuts: Shortcut[]) {
  const [draft, setDraft] = useState<EditableShortcut[]>(() =>
    initialShortcuts.map(normalizeShortcut),
  );

  const update = useCallback(
    (index: number, patch: Partial<EditableShortcut>) => {
      setDraft((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const remove = useCallback((index: number) => {
    setDraft((d) => d.filter((_, i) => i !== index));
  }, []);

  const add = useCallback((newShortcut: EditableShortcut) => {
    setDraft((d) => [...d, newShortcut]);
  }, []);

  return { draft, update, remove, add };
}
