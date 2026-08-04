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
      stats={[
        `${post.rowCount} rows`,
        `${post.keyCount} keys`,
        `${post.saveCount} save${post.saveCount === 1 ? "" : "s"}`,
      ]}
      actions={
        <LayoutActions
          layoutId={post.id}
          initialSaved={isSaved}
          initialDefault={isDefault}
        />
      }
    />
  );
}
