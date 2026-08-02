import { notFound } from "next/navigation";
import {
  getPublicPostsByDisplayName,
  getUserSavedLayouts,
  getUserDefaultLayoutId,
} from "@/features/posts/queries";
import { DiagramPostCard } from "@/features/browse/DiagramPostCard";
import { LayoutPostCard } from "@/features/browse/LayoutPostCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ displayName: string }>;
}): Promise<Metadata> {
  const { displayName: encoded } = await params;
  const displayName = decodeURIComponent(encoded);
  return {
    title: displayName,
    description: `Public keyboard shortcut diagrams and layouts shared by ${displayName} on kbvr.`,
    openGraph: { type: "profile" },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const { displayName: encoded } = await params;
  const displayName = decodeURIComponent(encoded);

  const result = await getPublicPostsByDisplayName(displayName);
  if (!result) notFound();

  const { diagrams, layouts } = result;

  const [savedLayouts, defaultLayoutId] = await Promise.all([
    getUserSavedLayouts(),
    getUserDefaultLayoutId(),
  ]);
  const savedLayoutIds = new Set(savedLayouts.map((l) => l.id));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">{displayName}</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Diagrams
        </h2>
        {diagrams.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No public diagrams.
          </p>
        )}
        {diagrams.map((post) => (
          <DiagramPostCard key={post.id} post={post} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Layouts
        </h2>
        {layouts.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No public layouts.
          </p>
        )}
        {layouts.map((post) => (
          <LayoutPostCard
            key={post.id}
            post={post}
            isSaved={savedLayoutIds.has(post.id)}
            isDefault={defaultLayoutId === post.id}
          />
        ))}
      </section>
    </main>
  );
}
