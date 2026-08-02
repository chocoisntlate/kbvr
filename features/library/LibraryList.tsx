"use client";

import useSWR from "swr";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getLibraryDataAction,
  type LibraryData,
} from "@/features/posts/readActions";
import { DiagramLibraryItem } from "./DiagramLibraryItem";
import { LayoutLibraryItem } from "./LayoutLibraryItem";
import { RefreshButton } from "@/features/ui/RefreshButton";

export function LibraryList({
  initialData,
  canSetSeedDefault,
}: {
  initialData: LibraryData;
  canSetSeedDefault: boolean;
}) {
  const { user } = useAuth();
  const { data, mutate, isValidating } = useSWR<LibraryData>(
    ["library", user?.id ?? null],
    () => getLibraryDataAction(),
    { fallbackData: initialData },
  );

  const { diagrams, layouts, defaultLayoutId, seedDefaultLayoutId } =
    data ?? initialData;

  return (
    <>
      <div className="flex justify-end">
        <RefreshButton onRefresh={() => mutate()} isValidating={isValidating} />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Diagrams
        </h2>
        {diagrams.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No diagrams yet — save one from Browse or the keyboard page.
          </p>
        )}
        {diagrams.map(({ post, isOwned }) => (
          <DiagramLibraryItem key={post.id} post={post} isOwned={isOwned} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Layouts
        </h2>
        {layouts.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No layouts yet — save one from Browse.
          </p>
        )}
        {layouts.map(({ post, isOwned }) => (
          <LayoutLibraryItem
            key={post.id}
            post={post}
            isOwned={isOwned}
            isDefault={defaultLayoutId === post.id}
            isSeedDefault={seedDefaultLayoutId === post.id}
            canSetSeedDefault={canSetSeedDefault}
          />
        ))}
      </section>
    </>
  );
}
