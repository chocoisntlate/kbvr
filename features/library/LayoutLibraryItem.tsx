"use client";

import { LayoutGrid } from "lucide-react";
import { LayoutPostSummary } from "@/features/posts/types";
import {
  toggleLayoutVisibility,
  duplicateLayout,
  removeSavedLayout,
  setDefaultLayout,
  deleteLayout,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { PostCard } from "@/features/browse/PostCard";
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
    <>
      <PostCard
        name={post.name}
        description={post.description ?? undefined}
        ownerDisplayName={post.ownerDisplayName}
        isOfficial={post.isOfficial}
        createdAt={post.createdAt}
        icon={
          <LayoutGrid className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        }
        stats={[
          {
            label: isOwned ? (isPublic ? "Public" : "Private") : "Saved",
            accent: isOwned && isPublic,
          },
          ...(isDefault ? [{ label: "Default", accent: true }] : []),
        ]}
        actions={
          <>
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
                    isDefault
                      ? "Set a different default layout first"
                      : undefined
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
          </>
        }
      />
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
    </>
  );
}
