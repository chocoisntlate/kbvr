"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiagramPost } from "@/features/posts/types";
import {
  toggleDiagramVisibility,
  duplicateDiagram,
  removeSavedDiagram,
  deleteDiagram,
} from "@/features/posts/actions";
import { VisibilityDialog } from "@/features/posts/SaveDialog";
import { ConfirmDialog } from "@/features/ui/Modal";

export function DiagramLibraryItem({
  post,
  isOwned,
}: {
  post: DiagramPost;
  isOwned: boolean;
}) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(post.isPublic);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (removed) return null;

  const handleToggleVisibility = async () => {
    setBusy(true);
    try {
      await toggleDiagramVisibility(post.id, !isPublic);
      setIsPublic((v) => !v);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await removeSavedDiagram(post.id);
      setRemoved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDuplicate = async (asPublic: boolean) => {
    setShowDuplicateDialog(false);
    setBusy(true);
    try {
      await duplicateDiagram(post.id, asPublic);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setBusy(true);
    try {
      await deleteDiagram(post.id);
      setRemoved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
      <Link href={`/?diagram=${post.id}`} className="min-w-0 hover:opacity-80">
        <p className="truncate font-medium text-gray-900">{post.data.name}</p>
        <p className="truncate text-xs text-gray-500">
          By {post.ownerDisplayName ?? "Unknown"} ·{" "}
          {isOwned ? (isPublic ? "Public" : "Private") : "Saved"}
        </p>
      </Link>
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/?diagram=${post.id}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          {isOwned ? "Edit" : "View"}
        </Link>
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
              disabled={busy}
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
              disabled={busy}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
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
