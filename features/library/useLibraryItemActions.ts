import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PostMeta } from "@/features/posts/types";

type LibraryItemActions = {
  toggleVisibility: (id: string, isPublic: boolean) => Promise<void>;
  removeSaved: (id: string) => Promise<void>;
  duplicate: (id: string, isPublic: boolean) => Promise<PostMeta>;
  deleteItem: (id: string) => Promise<void>;
};

export function useLibraryItemActions(
  postId: string,
  initialIsPublic: boolean,
  actions: LibraryItemActions,
) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
        router.refresh();
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  const handleToggleVisibility = () =>
    run(async () => {
      await actions.toggleVisibility(postId, !isPublic);
      setIsPublic((v) => !v);
    });

  const handleRemove = () =>
    run(async () => {
      await actions.removeSaved(postId);
      setRemoved(true);
    });

  const handleConfirmDuplicate = (asPublic: boolean) => {
    setShowDuplicateDialog(false);
    return run(async () => {
      await actions.duplicate(postId, asPublic);
    });
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    return run(async () => {
      await actions.deleteItem(postId);
      setRemoved(true);
    });
  };

  return {
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
  };
}
