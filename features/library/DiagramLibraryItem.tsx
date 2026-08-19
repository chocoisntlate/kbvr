"use client";

import Link from "next/link";
import { Keyboard } from "lucide-react";
import { DiagramPostSummary } from "@/features/posts/types";
import {
  toggleDiagramVisibility,
  duplicateDiagram,
  removeSavedDiagram,
  deleteDiagram,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { PostCard } from "@/features/browse/PostCard";
import { Button } from "@/features/ui/Button";
import { ConfirmDialog } from "@/features/ui/Modal";
import { useLibraryItemActions } from "./useLibraryItemActions";

export function DiagramLibraryItem({
  post,
  isOwned,
}: {
  post: DiagramPostSummary;
  isOwned: boolean;
}) {
  const {
    isPublic,
    removed,
    busy,
    showDuplicateDialog,
    setShowDuplicateDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    handleToggleVisibility,
    handleRemove,
    handleConfirmDuplicate,
    handleDelete,
  } = useLibraryItemActions(post.id, post.isPublic, {
    toggleVisibility: toggleDiagramVisibility,
    removeSaved: removeSavedDiagram,
    duplicate: duplicateDiagram,
    deleteItem: deleteDiagram,
  });

  if (removed) return null;

  return (
    <>
      <PostCard
        name={post.name}
        description={post.description ?? undefined}
        ownerDisplayName={post.ownerDisplayName}
        isOfficial={post.isOfficial}
        createdAt={post.createdAt}
        icon={<Keyboard className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
        stats={[
          {
            label: isOwned ? (isPublic ? "Public" : "Private") : "Saved",
            accent: isOwned && isPublic,
          },
        ]}
        actions={
          <>
            <Link
              href={`/editor?diagram=${post.id}`}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
            >
              {isOwned ? "Edit" : "View"}
            </Link>
            {isOwned ? (
              <>
                <Button onClick={handleToggleVisibility} disabled={busy}>
                  Make {isPublic ? "private" : "public"}
                </Button>
                <Button
                  tone="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowDuplicateDialog(true)}
                  disabled={busy}
                >
                  Duplicate
                </Button>
                <Button onClick={handleRemove} disabled={busy}>
                  Remove
                </Button>
              </>
            )}
          </>
        }
      />
      {showDuplicateDialog && (
        <VisibilityDialog
          title="Save your duplicate diagram"
          onCancel={() => setShowDuplicateDialog(false)}
          onConfirm={handleConfirmDuplicate}
        />
      )}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete this diagram?"
          message={`"${post.name}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
