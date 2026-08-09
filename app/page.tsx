import Link from "next/link";
import type { Metadata } from "next";
import { FeaturedDiagramCard } from "@/features/landing/FeaturedDiagramCard";
import { FEATURED_DIAGRAM_IDS } from "@/features/landing/featuredDiagrams";
import { getDiagramById } from "@/features/posts/queries";

export const metadata: Metadata = {
  title: "kbvr",
};

const primaryButtonClasses =
  "inline-block rounded-md border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60";

const secondaryButtonClasses =
  "inline-block rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700";

export default async function LandingPage() {
  const results = await Promise.all(
    FEATURED_DIAGRAM_IDS.map((id) => getDiagramById(id)),
  );
  const featuredDiagrams = results.filter((result) => result !== null);

  return (
    <>
      <section className="bg-teal-50 dark:bg-teal-950/40">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            An Interactive{" "}
            <span className="text-teal-600 dark:text-teal-400">K</span>ey
            <span className="text-teal-600 dark:text-teal-400">b</span>ind{" "}
            <span className="text-teal-600 dark:text-teal-400">V</span>iewe
            <span className="text-teal-600 dark:text-teal-400">r</span>
          </h1>
          <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Browse and build a visual reference for your keybinds.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/editor" className={primaryButtonClasses}>
              Try kbvr
            </Link>
            <Link href="/editor?new=1" className={secondaryButtonClasses}>
              Start from scratch
            </Link>
            <Link href="/browse" className={secondaryButtonClasses}>
              Browse diagrams
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Why?
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Keeping track of shortcuts across multiple applications gets
          overwhelming fast, especially once you start customizing them. kbvr
          maps your shortcuts onto a virtual keyboard, giving you a clear
          reference point you can keep for yourself or share with others. No
          account needed, everything imports and exports as a plain JSON file.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Featured Diagrams
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          See what the community has to offer!
        </p>
        {featuredDiagrams.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featuredDiagrams.map(({ post }) => (
              <FeaturedDiagramCard
                key={post.id}
                diagram={{
                  key: post.id,
                  name: post.data.name,
                  description: post.data.description ?? "No description yet.",
                  href: `/editor?diagram=${post.id}`,
                  author: post.ownerDisplayName,
                  isOfficial: post.isOfficial,
                  stats: [`${post.data.shortcuts.length} shortcuts`],
                }}
              />
            ))}
          </div>
        ) : (
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
        )}
      </section>
    </>
  );
}
