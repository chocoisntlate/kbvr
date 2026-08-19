import Link from "next/link";
import { FeaturedDiagramCard } from "@/features/landing/FeaturedDiagramCard";
import { FEATURED_DIAGRAM_IDS } from "@/features/landing/featuredDiagrams";
import { getDiagramSummariesByIds } from "@/features/posts/queries";

export async function FeaturedDiagrams() {
  const featuredDiagrams = await getDiagramSummariesByIds(FEATURED_DIAGRAM_IDS);

  if (featuredDiagrams.length === 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        No featured diagrams yet — browse{" "}
        <Link
          href="/browse"
          className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          what&apos;s public
        </Link>{" "}
        in the meantime.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {featuredDiagrams.map((post) => (
        <FeaturedDiagramCard
          key={post.id}
          diagram={{
            key: post.id,
            name: post.name,
            description: post.description ?? "No description yet.",
            href: `/editor?diagram=${post.id}`,
            author: post.ownerDisplayName,
            isOfficial: post.isOfficial,
            stats: [`${post.shortcutCount} shortcuts`],
          }}
        />
      ))}
    </div>
  );
}
