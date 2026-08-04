import Link from "next/link";
import { PostCard } from "./PostCard";
import { DiagramPostSummary } from "@/features/posts/types";

export function DiagramPostCard({ post }: { post: DiagramPostSummary }) {
  return (
    <PostCard
      name={post.name}
      description={post.description ?? undefined}
      ownerDisplayName={post.ownerDisplayName}
      isOfficial={post.isOfficial}
      createdAt={post.createdAt}
      stats={[
        `${post.shortcutCount} shortcuts`,
        `${post.saveCount} save${post.saveCount === 1 ? "" : "s"}`,
      ]}
      actions={
        <Link
          href={`/?diagram=${post.id}`}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
        >
          View
        </Link>
      }
    />
  );
}
