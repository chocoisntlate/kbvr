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
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          View
        </Link>
      }
    />
  );
}
