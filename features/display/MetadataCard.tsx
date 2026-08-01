"use client";

import { ReactNode } from "react";
import { Button } from "@/features/ui/Button";

type MetadataCardProps = {
  title: string;
  children: ReactNode;
  details?: ReactNode;
  expanded: boolean;
  onToggle: () => void;
};

export function MetadataCard({
  title,
  children,
  details,
  expanded,
  onToggle,
}: MetadataCardProps) {
  return (
    <div className="rounded-lg border border-neutral-300 p-4 space-y-3 text-sm dark:border-neutral-700">
      <div className="space-y-1">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {title}
        </h1>
        {children}
      </div>

      {expanded && details}

      {details && (
        <Button variant="ghost" onClick={onToggle}>
          {expanded ? "Hide details" : "Show more"}
        </Button>
      )}
    </div>
  );
}
