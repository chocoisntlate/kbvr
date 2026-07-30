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
      details={<div className="text-xs text-gray-600">{details}</div>}
    >
      <div className="flex flex-col gap-2">
        {description && <p className="text-xs text-gray-600">{description}</p>}
        <p className="text-xs text-gray-500">
          By{" "}
          {ownerDisplayName ? (
            <Link
              href={`/u/${encodeURIComponent(ownerDisplayName)}`}
              className="hover:text-gray-900 hover:underline"
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
