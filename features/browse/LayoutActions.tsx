"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useAuth } from "@/features/auth/AuthContext";
import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
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
      <button
        onClick={handleSave}
        disabled={busy || saved}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={handleSetDefault}
        disabled={busy || isDefault}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDefault ? "Default" : "Set as default"}
      </button>
    </>
  );
}
