import Link from "next/link";
import {
  searchPosts,
  getUserSavedLayouts,
  getUserDefaultLayoutId,
} from "@/features/posts/queries";
import { BrowseSearchInput } from "@/features/browse/BrowseSearchInput";
import { DiagramPostCard } from "@/features/browse/DiagramPostCard";
import { LayoutPostCard } from "@/features/browse/LayoutPostCard";
import { DiagramPost, LayoutPost } from "@/features/posts/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type } = await searchParams;
  const activeType = type === "layout" ? "layout" : "diagram";

  const posts = await searchPosts(activeType, q);

  let savedLayoutIds = new Set<string>();
  let defaultLayoutId: string | null = null;
  if (activeType === "layout") {
    const [savedLayouts, defaultId] = await Promise.all([
      getUserSavedLayouts(),
      getUserDefaultLayoutId(),
    ]);
    savedLayoutIds = new Set(savedLayouts.map((l) => l.id));
    defaultLayoutId = defaultId;
  }

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

      <div className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">
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
      </div>
    </main>
  );
}
