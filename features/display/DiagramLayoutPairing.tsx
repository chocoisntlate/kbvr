"use client";

import { useLayoutPairing } from "./useLayoutPairing";

export function DiagramLayoutPairing() {
  const { intendedLayout, isMatched, mismatch } = useLayoutPairing();

  return (
    <div className="flex flex-col gap-2">
      {mismatch.count > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Key IDs without a match:{" "}
          {mismatch.missingKeyIds.map((id) => `'${id}'`).join(", ")}
        </div>
      )}

      {intendedLayout && !isMatched && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Loaded diagram is intended for layout &quot;{intendedLayout.name}
          &quot; - Fingerprint of current layout key set does not match.
        </div>
      )}
    </div>
  );
}
