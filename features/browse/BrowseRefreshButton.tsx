"use client";

import { useState } from "react";
import { mutate } from "swr";
import { RefreshButton } from "@/features/ui/RefreshButton";

export function BrowseRefreshButton({
  activeType,
  q,
}: {
  activeType: "diagram" | "layout";
  q: string;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        mutate(
          (key) =>
            Array.isArray(key) &&
            key[0] === "browse" &&
            key[1] === activeType &&
            key[2] === q,
        ),
        mutate(
          activeType === "layout"
            ? ["browse-layout-flags"]
            : ["browse-diagram-flags"],
        ),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RefreshButton onRefresh={handleRefresh} isValidating={isRefreshing} />
  );
}
