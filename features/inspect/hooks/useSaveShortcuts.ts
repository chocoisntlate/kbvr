import { useCallback } from "react";
import { Diagram, Shortcut } from "../../spec/diagramSchema";
import { useKeyboardContent } from "../../keyboard/KeyboardContext";
import {
  EditableShortcut,
  FieldErrors,
  getDisplayKey,
  validateShortcut,
} from "../../diagram/shortcut";

type ValidationResult = {
  errors: Record<number, FieldErrors>;
  valid: Shortcut[];
  hasErrors: boolean;
};

export function useSaveShortcuts(
  draft: EditableShortcut[],
  validKeyIds: string[],
  keyId: string,
  activeMode: string | null,
) {
  const { setKeyDiagram } = useKeyboardContent();

  const validate = useCallback((): ValidationResult => {
    const errors: Record<number, FieldErrors> = {};
    const valid: Shortcut[] = [];

    draft.forEach((s, index) => {
      const res = validateShortcut(s, {
        index,
        draft,
        validKeyIds: new Set(validKeyIds),
      });

      if (!res.success) {
        errors[index] = res.errors;
      } else {
        valid.push(res.data);
      }
    });

    return {
      errors,
      valid,
      hasErrors: Object.keys(errors).length > 0,
    };
  }, [draft, validKeyIds]);

  const save = useCallback(
    (validShortcuts: Shortcut[]) => {
      setKeyDiagram((d: Diagram) => ({
        ...d,
        shortcuts: [
          ...d.shortcuts.filter(
            (s) =>
              getDisplayKey(s) !== keyId ||
              (activeMode !== null && s.mode !== activeMode),
          ),
          ...validShortcuts,
        ],
      }));
    },
    [setKeyDiagram, keyId, activeMode],
  );

  return { validate, save };
}
