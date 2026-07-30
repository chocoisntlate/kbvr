import { Shortcut } from "../spec/diagramSchema";
import { getDisplayKey } from "../diagram/shortcut";

function isMatch(candidate: Shortcut, pressedKeys: Set<string>): boolean {
  const matches = [...pressedKeys].filter((k) => candidate.keys.includes(k));

  if (
    pressedKeys.size === candidate.keys.length &&
    matches.length === candidate.keys.length
  ) {
    return true;
  }

  return (
    matches.length === candidate.keys.length - 1 &&
    pressedKeys.size === matches.length &&
    !matches.includes(getDisplayKey(candidate))
  );
}

export function getKeyDescription(
  candidates: Shortcut[] | undefined,
  pressedKeys: Set<string>,
): string[] | undefined {
  if (!candidates) return;

  // `candidates` is already scoped to the active mode by Keyboard.tsx (or
  // contains every mode's shortcuts when "All modes" is selected), so every
  // matching candidate here is a genuine conflict for the current view —
  // combine all of them rather than only the first one found.
  const matched = candidates.filter((candidate) =>
    isMatch(candidate, pressedKeys),
  );
  if (matched.length > 0) {
    return matched.flatMap((candidate) => candidate.description);
  }
}
