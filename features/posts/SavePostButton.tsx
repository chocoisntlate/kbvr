"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { signInWithGoogle } from "@/features/auth/signInWithGoogle";
import { ImportExportButton } from "@/features/display/ImportExport";
import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { PostMeta } from "./types";
import { VisibilityDialog, ForkChoiceDialog } from "./SaveDialog";
import {
  saveNewDiagram,
  updateDiagram,
  duplicateDiagram,
  saveDiagramReference,
  saveNewLayout,
  updateLayout,
  duplicateLayout,
  saveLayoutReference,
} from "./actions";

type SavePostButtonProps =
  | {
      kind: "diagram";
      data: Diagram;
      meta: PostMeta | null;
      onMetaChange: (meta: PostMeta) => void;
    }
  | {
      kind: "layout";
      data: Layout;
      meta: PostMeta | null;
      onMetaChange: (meta: PostMeta) => void;
    };

type DialogStep = "visibility-new" | "fork-choice" | "visibility-fork" | null;

export function SavePostButton(props: SavePostButtonProps) {
  const { kind, meta, onMetaChange } = props;
  const { user } = useAuth();
  const [step, setStep] = useState<DialogStep>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const isOwnedByMe = !!meta && !!user && meta.ownerId === user.id;
  const alreadySavedReference =
    !!meta && !!user && meta.ownerId !== user.id && meta.isSavedByMe;

  const handleClick = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!meta) {
      setStep("visibility-new");
      return;
    }
    if (isOwnedByMe) {
      setStatus("saving");
      try {
        if (kind === "diagram") await updateDiagram(meta.id, props.data);
        else await updateLayout(meta.id, props.data);
        setStatus("idle");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
      return;
    }
    if (alreadySavedReference) return;
    setStep("fork-choice");
  };

  const handleConfirmNew = async (isPublic: boolean) => {
    setStep(null);
    setStatus("saving");
    try {
      const result =
        kind === "diagram"
          ? await saveNewDiagram(props.data, isPublic)
          : await saveNewLayout(props.data, isPublic);
      onMetaChange(result);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleChooseOriginal = async () => {
    if (!meta) return;
    setStep(null);
    setStatus("saving");
    try {
      if (kind === "diagram") await saveDiagramReference(meta.id);
      else await saveLayoutReference(meta.id);
      onMetaChange({ ...meta, isSavedByMe: true });
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleConfirmFork = async (isPublic: boolean) => {
    if (!meta) return;
    setStep(null);
    setStatus("saving");
    try {
      const result =
        kind === "diagram"
          ? await duplicateDiagram(meta.id, isPublic)
          : await duplicateLayout(meta.id, isPublic);
      onMetaChange(result);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const label = alreadySavedReference
    ? "Saved"
    : status === "saving"
      ? "Saving…"
      : "Save";

  return (
    <>
      <ImportExportButton
        title={label}
        onClick={handleClick}
        disabled={status === "saving" || alreadySavedReference}
      />
      {status === "error" && (
        <span className="text-[10px] text-red-600">Save failed</span>
      )}

      {step === "visibility-new" && (
        <VisibilityDialog
          title={`Save this ${kind}`}
          onCancel={() => setStep(null)}
          onConfirm={handleConfirmNew}
        />
      )}
      {step === "fork-choice" && (
        <ForkChoiceDialog
          kind={kind}
          onCancel={() => setStep(null)}
          onChooseDuplicate={() => setStep("visibility-fork")}
          onChooseOriginal={handleChooseOriginal}
        />
      )}
      {step === "visibility-fork" && (
        <VisibilityDialog
          title={`Save your duplicate ${kind}`}
          onCancel={() => setStep(null)}
          onConfirm={handleConfirmFork}
        />
      )}
    </>
  );
}
