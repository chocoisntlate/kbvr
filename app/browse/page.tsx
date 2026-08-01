import Link from "next/link";
import { Suspense } from "react";
import { searchPosts } from "@/features/posts/queries";
import { getBrowseLayoutFlagsAction } from "@/features/posts/readActions";
import { BrowseSearchInput } from "@/features/browse/BrowseSearchInput";
import { BrowseResultsList } from "@/features/browse/BrowseResultsList";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type } = await searchParams;
  const activeType = type === "layout" ? "layout" : "diagram";

  const tabHref = (t: "diagram" | "layout") =>
    `/browse?type=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">Browse</h1>

      <div className="flex items-center gap-2 text-xs">
        <Link
          href={tabHref("diagram")}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400 ${
            activeType === "diagram"
              ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300"
              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
        >
          Diagrams
        </Link>
        <Link
          href={tabHref("layout")}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400 ${
            activeType === "layout"
              ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300"
              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
        >
          Layouts
        </Link>
      </div>

      <BrowseSearchInput initialQuery={q} type={activeType} />

      <Suspense
        key={`${activeType}:${q}`}
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading…
          </p>
        }
      >
        <BrowseResults activeType={activeType} q={q} />
      </Suspense>
    </main>
  );
}

async function BrowseResults({
  activeType,
  q,
}: {
  activeType: "diagram" | "layout";
  q: string;
}) {
  const firstPage = await searchPosts(activeType, q, 0);

  const layoutFlags =
    activeType === "layout" ? await getBrowseLayoutFlagsAction() : undefined;

  return (
    <BrowseResultsList
      activeType={activeType}
      q={q}
      initialPage={firstPage}
      initialLayoutFlags={layoutFlags}
    />
  );
}
