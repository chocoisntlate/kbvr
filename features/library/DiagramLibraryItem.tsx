"use client";

import Link from "next/link";
import { DiagramPost } from "@/features/posts/types";
import {
  toggleDiagramVisibility,
  duplicateDiagram,
  removeSavedDiagram,
  deleteDiagram,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { Button } from "@/features/ui/Button";
import { ConfirmDialog } from "@/features/ui/Modal";
import { useLibraryItemActions } from "./useLibraryItemActions";

export function DiagramLibraryItem({
  post,
  isOwned,
}: {
  post: DiagramPost;
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900">
      <Link href={`/?diagram=${post.id}`} className="min-w-0 hover:opacity-80">
        <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
          {post.data.name}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          By {post.ownerDisplayName ?? "Unknown"} ·{" "}
          {isOwned ? (isPublic ? "Public" : "Private") : "Saved"}
        </p>
      </Link>
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/?diagram=${post.id}`}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
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
            <Button onClick={() => setShowDuplicateDialog(true)} disabled={busy}>
              Duplicate
            </Button>
            <Button onClick={handleRemove} disabled={busy}>
              Remove
            </Button>
          </>
        )}
      </div>
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
          message={`"${post.data.name}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
