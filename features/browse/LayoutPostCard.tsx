import { LayoutGrid } from "lucide-react";
import { PostCard } from "./PostCard";
import { LayoutActions } from "./LayoutActions";
import { LayoutPostSummary } from "@/features/posts/types";

export function LayoutPostCard({
  post,
  isSaved,
  isDefault,
}: {
  post: LayoutPostSummary;
  isSaved: boolean;
  isDefault: boolean;
}) {
  return (
    <PostCard
      name={post.name}
      description={post.description ?? undefined}
      ownerDisplayName={post.ownerDisplayName}
      isOfficial={post.isOfficial}
      createdAt={post.createdAt}
      icon={<LayoutGrid className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
      stats={[]}
      actions={
        <LayoutActions
          layoutId={post.id}
          ownerId={post.ownerId}
          initialSaved={isSaved}
          initialDefault={isDefault}
        />
      }
    />
  );
}
