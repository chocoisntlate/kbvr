import { PostCard } from "./PostCard";
import { LayoutActions } from "./LayoutActions";
import { LayoutPost } from "@/features/posts/types";

export function LayoutPostCard({
  post,
  isSaved,
  isDefault,
}: {
  post: LayoutPost;
  isSaved: boolean;
  isDefault: boolean;
}) {
  const keyCount = new Set(
    post.data.rows.flatMap((row) => row.map((key) => key.id).filter(Boolean)),
  ).size;

  return (
    <PostCard
      name={post.data.name}
      description={post.data.description}
      ownerDisplayName={post.ownerDisplayName}
      createdAt={post.createdAt}
      details={
        <div>
          {post.data.rows.length} rows · {keyCount} keys
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
