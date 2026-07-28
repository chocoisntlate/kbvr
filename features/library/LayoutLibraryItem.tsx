"use client";

import { LayoutPost } from "@/features/posts/types";
import {
  toggleLayoutVisibility,
  duplicateLayout,
  removeSavedLayout,
  setDefaultLayout,
  deleteLayout,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { ConfirmDialog } from "@/features/ui/Modal";
import { useLibraryItemActions } from "./useLibraryItemActions";

export function LayoutLibraryItem({
  post,
  isOwned,
  isDefault,
}: {
  post: LayoutPost;
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
      <button
        type="button"
        onClick={handleSetDefault}
        disabled={busy || isDefault}
        className="min-w-0 text-left hover:opacity-80 disabled:cursor-not-allowed"
      >
        <p className="truncate font-medium text-gray-900">
          {post.data.name}
          {isDefault && (
            <span className="ml-1 text-xs text-green-600">(Default)</span>
          )}
        </p>
        <p className="truncate text-xs text-gray-500">
          By {post.ownerDisplayName ?? "Unknown"} ·{" "}
          {isOwned ? (isPublic ? "Public" : "Private") : "Saved"}
        </p>
      </button>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <button
          onClick={handleSetDefault}
          disabled={busy || isDefault}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDefault ? "Default" : "Set as default"}
        </button>
        {isOwned ? (
          <>
            <button
              onClick={handleToggleVisibility}
              disabled={busy}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Make {isPublic ? "private" : "public"}
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={busy || isDefault}
              title={isDefault ? "Set a different default layout first" : undefined}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowDuplicateDialog(true)}
              disabled={busy}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Duplicate
            </button>
            <button
              onClick={handleRemove}
              disabled={busy || isDefault}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
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
