import Link from "next/link";
import { PostCard } from "./PostCard";
import { DiagramPost } from "@/features/posts/types";

export function DiagramPostCard({ post }: { post: DiagramPost }) {
  return (
    <PostCard
      name={post.data.name}
      description={post.data.description}
      ownerDisplayName={post.ownerDisplayName}
      createdAt={post.createdAt}
      details={<div>{post.data.shortcuts.length} shortcuts</div>}
      actions={
        <Link
          href={`/?diagram=${post.id}`}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
        >
          View
        </Link>
      }
    />
  );
}
