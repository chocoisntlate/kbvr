import { useCallback, useState } from "react";

export function useEditMode() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const setEditing = useCallback((index: number | null) => {
    setEditingIndex(index);
  }, []);

  const collapseEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  return {
    editingIndex,
    setEditing,
    collapseEdit,
  };
}
