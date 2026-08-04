"use client";

import { Button } from "@/features/ui/Button";
import { useLayoutPairing } from "./useLayoutPairing";

export function MatchToLayoutButton() {
  const { isMatched, match } = useLayoutPairing();

  return (
    <Button size="md" onClick={match} disabled={isMatched}>
      Match to Layout
    </Button>
  );
}
