import { Shortcut } from "../spec/diagramSchema";
import { getDisplayKey } from "../diagram/shortcut";

export function getKeyDescription(
  candidates: Shortcut[] | undefined,
  pressedKeys: Set<string>,
): string[] | undefined {
  if (!candidates) return;

  for (const candidate of candidates) {
    const matches = [...pressedKeys].filter((k) => candidate.keys.includes(k));

    if (
      pressedKeys.size === candidate.keys.length &&
      matches.length === candidate.keys.length
    ) {
      return candidate.description;
    }

    if (
      matches.length === candidate.keys.length - 1 &&
      pressedKeys.size === matches.length &&
      !matches.includes(getDisplayKey(candidate))
    ) {
      return candidate.description;
    }
  }
}
