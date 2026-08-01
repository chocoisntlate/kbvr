"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useAuth } from "@/features/auth/AuthContext";
import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { Button } from "@/features/ui/Button";
import {
  saveLayoutReference,
  setDefaultLayout,
} from "@/features/posts/actions";

export function LayoutActions({
  layoutId,
  initialSaved,
  initialDefault,
}: {
  layoutId: string;
  initialSaved: boolean;
  initialDefault: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isDefault, setIsDefault] = useState(initialDefault);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setBusy(true);
    try {
      await saveLayoutReference(layoutId);
      setSaved(true);
      await mutate(["browse-layout-flags"]);
      mutate(["library", user.id]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSetDefault = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setBusy(true);
    try {
      await setDefaultLayout(layoutId);
      setSaved(true);
      setIsDefault(true);
      await mutate(["browse-layout-flags"]);
      mutate(["library", user.id]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={handleSave} disabled={busy || saved}>
        {saved ? "Saved" : "Save"}
      </Button>
      <Button onClick={handleSetDefault} disabled={busy || isDefault}>
        {isDefault ? "Default" : "Set as default"}
      </Button>
    </>
  );
}
