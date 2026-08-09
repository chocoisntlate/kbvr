"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/features/ui/Button";
import { saveDiagramReference } from "@/features/posts/actions";

export function DiagramActions({
  diagramId,
  ownerId,
  initialSaved,
}: {
  diagramId: string;
  ownerId: string;
  initialSaved: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  if (user?.id === ownerId) return null;

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      await saveDiagramReference(diagramId);
      setSaved(true);
      await mutate(["browse-diagram-flags"]);
      mutate(["library", user.id]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={handleSave} disabled={busy || saved}>
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
