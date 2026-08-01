"use client";

import { Button } from "./Button";

export function RefreshButton({
  onRefresh,
  isValidating,
}: {
  onRefresh: () => void;
  isValidating: boolean;
}) {
  return (
    <Button onClick={onRefresh} disabled={isValidating} title="Refresh">
      {isValidating ? "Refreshing…" : "Refresh"}
    </Button>
  );
}
