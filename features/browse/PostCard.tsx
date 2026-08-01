"use client";

import { useState } from "react";
import Link from "next/link";
import { MetadataCard } from "@/features/display/MetadataCard";

type PostCardProps = {
  name: string;
  description?: string;
  ownerDisplayName: string | null;
  createdAt: string;
  details?: React.ReactNode;
  actions: React.ReactNode;
};

export function PostCard({
  name,
  description,
  ownerDisplayName,
  createdAt,
  details,
  actions,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <MetadataCard
      title={name}
      expanded={expanded}
      onToggle={() => setExpanded((e) => !e)}
      details={
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          {details}
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          By{" "}
          {ownerDisplayName ? (
            <Link
              href={`/u/${encodeURIComponent(ownerDisplayName)}`}
              className="hover:text-neutral-900 hover:underline dark:hover:text-neutral-100"
            >
              {ownerDisplayName}
            </Link>
          ) : (
            "Unknown"
          )}{" "}
          · {new Date(createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-2">{actions}</div>
      </div>
    </MetadataCard>
  );
}
