"use client";

import { LayoutPostSummary } from "@/features/posts/types";
import {
  toggleLayoutVisibility,
  duplicateLayout,
  removeSavedLayout,
  setDefaultLayout,
  deleteLayout,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { OfficialBadge } from "@/features/browse/PostCard";
import { Button } from "@/features/ui/Button";
import { ConfirmDialog } from "@/features/ui/Modal";
import { useLibraryItemActions } from "./useLibraryItemActions";

export function LayoutLibraryItem({
  post,
  isOwned,
  isDefault,
}: {
  post: LayoutPostSummary;
  isOwned: boolean;
  isDefault: boolean;
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
    run,
  } = useLibraryItemActions(post.id, post.isPublic, {
    toggleVisibility: toggleLayoutVisibility,
    removeSaved: removeSavedLayout,
    duplicate: duplicateLayout,
    deleteItem: deleteLayout,
  });

  if (removed) return null;

  const handleSetDefault = () => run(() => setDefaultLayout(post.id));

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900">
      <button
        type="button"
        onClick={handleSetDefault}
        disabled={busy || isDefault}
        className="min-w-0 text-left hover:opacity-80 disabled:cursor-not-allowed"
      >
        <p className="flex items-center gap-2 truncate font-medium text-neutral-900 dark:text-neutral-100">
          {post.name}
          {post.isOfficial && <OfficialBadge />}
          {isDefault && (
            <span className="text-xs text-teal-600 dark:text-teal-400">
              (Default)
            </span>
          )}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          By {post.ownerDisplayName ?? "Unknown"} ·{" "}
          {isOwned ? (isPublic ? "Public" : "Private") : "Saved"}
        </p>
      </button>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <Button onClick={handleSetDefault} disabled={busy || isDefault}>
          {isDefault ? "Default" : "Set as default"}
        </Button>
        {isOwned ? (
          <>
            <Button onClick={handleToggleVisibility} disabled={busy}>
              Make {isPublic ? "private" : "public"}
            </Button>
            <Button
              tone="danger"
              onClick={() => setShowDeleteDialog(true)}
              disabled={busy || isDefault}
              title={
                isDefault ? "Set a different default layout first" : undefined
              }
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
            <Button onClick={handleRemove} disabled={busy || isDefault}>
              Remove
            </Button>
          </>
        )}
      </div>
      {showDuplicateDialog && (
        <VisibilityDialog
          title="Save your duplicate layout"
          onCancel={() => setShowDuplicateDialog(false)}
          onConfirm={handleConfirmDuplicate}
        />
      )}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete this layout?"
          message={`"${post.name}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
