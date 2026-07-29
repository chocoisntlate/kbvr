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
          className={`rounded-md border border-gray-300 px-3 py-1.5 font-medium transition-colors ${
            activeType === "diagram"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Diagrams
        </Link>
        <Link
          href={tabHref("layout")}
          className={`rounded-md border border-gray-300 px-3 py-1.5 font-medium transition-colors ${
            activeType === "layout"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Layouts
        </Link>
      </div>

      <BrowseSearchInput initialQuery={q} type={activeType} />

      <Suspense
        key={`${activeType}:${q}`}
        fallback={<p className="text-sm text-gray-500">Loading…</p>}
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
