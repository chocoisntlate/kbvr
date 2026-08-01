"use client";

import { useEffect } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  searchPostsAction,
  getBrowseLayoutFlagsAction,
} from "@/features/posts/readActions";
import type { SearchPostsResult } from "@/features/posts/queries";
import { DiagramPostCard } from "./DiagramPostCard";
import { LayoutPostCard } from "./LayoutPostCard";
import { Button } from "@/features/ui/Button";
import { RefreshButton } from "@/features/ui/RefreshButton";
import { DiagramPost, LayoutPost } from "@/features/posts/types";

type LayoutFlags = { savedLayoutIds: string[]; defaultLayoutId: string | null };

export function BrowseResultsList({
  activeType,
  q,
  initialPage,
  initialLayoutFlags,
}: {
  activeType: "diagram" | "layout";
  q: string;
  initialPage: SearchPostsResult;
  initialLayoutFlags?: LayoutFlags;
}) {
  type BrowseKey = readonly ["browse", "diagram" | "layout", string, number];

  const { data, size, setSize, isValidating, mutate } =
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
      { fallbackData: [initialPage] },
    );

  // useSWRInfinite doesn't reset `size` when the key deps change, so a
  // stale `size` would try to refetch several pages for a new search term.
  useEffect(() => {
    setSize(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, q]);

  const { data: layoutFlags, mutate: mutateLayoutFlags } = useSWR<LayoutFlags>(
    activeType === "layout" ? ["browse-layout-flags"] : null,
    () => getBrowseLayoutFlagsAction(),
    initialLayoutFlags ? { fallbackData: initialLayoutFlags } : undefined,
  );

  const posts = (data ?? []).flatMap((p) => p.posts);
  const hasMore = data?.at(-1)?.hasMore ?? false;
  const savedLayoutIds = new Set(layoutFlags?.savedLayoutIds ?? []);
  const defaultLayoutId = layoutFlags?.defaultLayoutId ?? null;

  const handleRefresh = () => {
    mutate();
    if (activeType === "layout") mutateLayoutFlags();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <RefreshButton onRefresh={handleRefresh} isValidating={isValidating} />
      </div>

      {posts.length === 0 && !isValidating && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No public {activeType}s found.
        </p>
      )}
      {activeType === "diagram"
        ? (posts as DiagramPost[]).map((post) => (
            <DiagramPostCard key={post.id} post={post} />
          ))
        : (posts as LayoutPost[]).map((post) => (
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
