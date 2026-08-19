"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getLibraryDataAction,
  type LibraryData,
} from "@/features/posts/readActions";
import { DiagramLibraryItem } from "./DiagramLibraryItem";
import { LayoutLibraryItem } from "./LayoutLibraryItem";
import { LibrarySearchInput } from "./LibrarySearchInput";
import { RefreshButton } from "@/features/ui/RefreshButton";

export function LibraryList({ initialData }: { initialData: LibraryData }) {
  const { user } = useAuth();
  const { data, mutate, isValidating } = useSWR<LibraryData>(
    ["library", user?.id ?? null],
    () => getLibraryDataAction(),
    { fallbackData: initialData },
  );
  const [query, setQuery] = useState("");

  const { diagrams, layouts, defaultLayoutId } = data ?? initialData;

  const trimmedQuery = query.trim().toLowerCase();
  const filteredDiagrams = useMemo(
    () =>
      diagrams.filter(({ post }) =>
        post.name.toLowerCase().includes(trimmedQuery),
      ),
    [diagrams, trimmedQuery],
  );
  const filteredLayouts = useMemo(
    () =>
      layouts.filter(({ post }) =>
        post.name.toLowerCase().includes(trimmedQuery),
      ),
    [layouts, trimmedQuery],
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <LibrarySearchInput value={query} onChange={setQuery} />
        <RefreshButton onRefresh={() => mutate()} isValidating={isValidating} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Diagrams
        </h2>
        {diagrams.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No diagrams yet — save one from Browse or the keyboard page.
          </p>
        )}
        {diagrams.length > 0 && filteredDiagrams.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No diagrams match &quot;{query}&quot;.
          </p>
        )}
        {filteredDiagrams.map(({ post, isOwned }) => (
          <DiagramLibraryItem key={post.id} post={post} isOwned={isOwned} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Layouts
        </h2>
        {layouts.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No layouts yet — save one from Browse.
          </p>
        )}
        {layouts.length > 0 && filteredLayouts.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No layouts match &quot;{query}&quot;.
          </p>
        )}
        {filteredLayouts.map(({ post, isOwned }) => (
          <LayoutLibraryItem
            key={post.id}
            post={post}
            isOwned={isOwned}
            isDefault={defaultLayoutId === post.id}
          />
        ))}
      </section>
    </>
  );
}
