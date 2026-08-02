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
      details={
        <div>
          {post.rowCount} rows · {post.keyCount} keys
        </div>
      }
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
