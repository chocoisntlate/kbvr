"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  searchPostsAction,
  getBrowseLayoutFlagsAction,
  getBrowseDiagramFlagsAction,
} from "@/features/posts/readActions";
import type { SearchPostsResult } from "@/features/posts/queries";
import { DiagramPostCard } from "./DiagramPostCard";
import { LayoutPostCard } from "./LayoutPostCard";
import { Button } from "@/features/ui/Button";
import { DiagramPostSummary, LayoutPostSummary } from "@/features/posts/types";

type LayoutFlags = { savedLayoutIds: string[]; defaultLayoutId: string | null };
type DiagramFlags = { savedDiagramIds: string[] };

export function BrowseResultsList({
  activeType,
  q,
  initialPage,
  initialLayoutFlags,
  initialDiagramFlags,
}: {
  activeType: "diagram" | "layout";
  q: string;
  initialPage: SearchPostsResult;
  initialLayoutFlags?: LayoutFlags;
  initialDiagramFlags?: DiagramFlags;
}) {
  type BrowseKey = readonly ["browse", "diagram" | "layout", string, number];

  const { data, size, setSize, isValidating } =
    useSWRInfinite<SearchPostsResult>(
      (
        pageIndex,
        previousPageData: SearchPostsResult | null,
      ): BrowseKey | null => {
        if (previousPageData && !previousPageData.hasMore) return null;
        return ["browse", activeType, q, pageIndex];
      },
      ([, type, query, page]: BrowseKey) =>
        searchPostsAction(type, query, page),
      { fallbackData: [initialPage], revalidateFirstPage: false },
    );

  // useSWRInfinite doesn't reset `size` when the key deps change, so a
  // stale `size` would try to refetch several pages for a new search term.
  // Compare against the previous activeType/q (rather than a one-shot
  // "first render" flag) so it only resets on an actual change, and is
  // immune to React Strict Mode's dev-only double-invoking of mount
  // effects, which would otherwise still fire this on every remount.
  const prevKeyRef = useRef({ activeType, q });
  useEffect(() => {
    if (
      prevKeyRef.current.activeType === activeType &&
      prevKeyRef.current.q === q
    ) {
      return;
    }
    prevKeyRef.current = { activeType, q };
    setSize(1);
  }, [activeType, q, setSize]);

  const { data: layoutFlags } = useSWR<LayoutFlags>(
    activeType === "layout" ? ["browse-layout-flags"] : null,
    () => getBrowseLayoutFlagsAction(),
    initialLayoutFlags ? { fallbackData: initialLayoutFlags } : undefined,
  );

  const { data: diagramFlags } = useSWR<DiagramFlags>(
    activeType === "diagram" ? ["browse-diagram-flags"] : null,
    () => getBrowseDiagramFlagsAction(),
    initialDiagramFlags ? { fallbackData: initialDiagramFlags } : undefined,
  );

  const posts = (data ?? []).flatMap((p) => p.posts);
  const hasMore = data?.at(-1)?.hasMore ?? false;
  const savedLayoutIds = new Set(layoutFlags?.savedLayoutIds ?? []);
  const defaultLayoutId = layoutFlags?.defaultLayoutId ?? null;
  const savedDiagramIds = new Set(diagramFlags?.savedDiagramIds ?? []);

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 && !isValidating && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No public {activeType}s found.
        </p>
      )}
      {activeType === "diagram"
        ? (posts as DiagramPostSummary[]).map((post) => (
            <DiagramPostCard
              key={post.id}
              post={post}
              isSaved={savedDiagramIds.has(post.id)}
            />
          ))
        : (posts as LayoutPostSummary[]).map((post) => (
            <LayoutPostCard
              key={post.id}
              post={post}
              isSaved={savedLayoutIds.has(post.id)}
              isDefault={defaultLayoutId === post.id}
            />
          ))}

      {hasMore && (
        <Button
          className="self-center"
          onClick={() => setSize(size + 1)}
          disabled={isValidating}
        >
          {isValidating ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
