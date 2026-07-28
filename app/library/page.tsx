import { Suspense } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import {
  getUserOwnedDiagrams,
  getUserOwnedLayouts,
  getUserSavedDiagrams,
  getUserSavedLayouts,
  getUserDefaultLayoutId,
} from "@/features/posts/queries";
import { ensureDefaultLayoutSeeded } from "@/features/posts/actions";
import { SignInPrompt } from "@/features/auth/SignInPrompt";
import { DiagramLibraryItem } from "@/features/library/DiagramLibraryItem";
import { LayoutLibraryItem } from "@/features/library/LayoutLibraryItem";
import { DiagramPost, LayoutPost } from "@/features/posts/types";

function dedupeById<T extends { id: string }>(
  owned: T[],
  saved: T[],
): { post: T; isOwned: boolean }[] {
  const map = new Map<string, { post: T; isOwned: boolean }>();
  for (const post of owned) map.set(post.id, { post, isOwned: true });
  for (const post of saved) {
    if (!map.has(post.id)) map.set(post.id, { post, isOwned: false });
  }
  return Array.from(map.values());
}

export default function LibraryPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold"> My Library</h1>
      <Suspense
        fallback={<p className="text-sm text-gray-500">Loading…</p>}
      >
        <LibraryContent />
      </Suspense>
    </main>
  );
}

async function LibraryContent() {
  const { user } = await getServerAuthContext();

  if (!user) {
    return (
      <SignInPrompt message="Sign in to see your saved diagrams and layouts." />
    );
  }

  await ensureDefaultLayoutSeeded();

  const [
    ownedDiagrams,
    ownedLayouts,
    savedDiagrams,
    savedLayouts,
    defaultLayoutId,
  ] = await Promise.all([
    getUserOwnedDiagrams(),
    getUserOwnedLayouts(),
    getUserSavedDiagrams(),
    getUserSavedLayouts(),
    getUserDefaultLayoutId(),
  ]);

  const diagrams = dedupeById<DiagramPost>(ownedDiagrams, savedDiagrams);
  const layouts = dedupeById<LayoutPost>(ownedLayouts, savedLayouts);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Diagrams
        </h2>
        {diagrams.length === 0 && (
          <p className="text-sm text-gray-500">
            No diagrams yet — save one from Browse or the keyboard page.
          </p>
        )}
        {diagrams.map(({ post, isOwned }) => (
          <DiagramLibraryItem key={post.id} post={post} isOwned={isOwned} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Layouts
        </h2>
        {layouts.length === 0 && (
          <p className="text-sm text-gray-500">
            No layouts yet — save one from Browse.
          </p>
        )}
        {layouts.map(({ post, isOwned }) => (
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
