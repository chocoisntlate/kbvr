"use client";

import { useRef, useState } from "react";
import { Button } from "@/features/ui/Button";
import { Dropdown } from "@/features/ui/Dropdown";
import { useSavePost } from "@/features/posts/useSavePost";
import { useKeyboardContent } from "../keyboard/KeyboardContext";

export function SaveMenuButton() {
  const {
    keyDiagram,
    currentDiagramMeta,
    setCurrentDiagramMeta,
    keyLayout,
    currentLayoutMeta,
    setCurrentLayoutMeta,
  } = useKeyboardContent();

  const diagramSave = useSavePost({
    kind: "diagram",
    data: keyDiagram,
    meta: currentDiagramMeta,
    onMetaChange: setCurrentDiagramMeta,
  });
  const layoutSave = useSavePost({
    kind: "layout",
    data: keyLayout,
    meta: currentLayoutMeta,
    onMetaChange: setCurrentLayoutMeta,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const diagramLabel =
    diagramSave.status === "error"
      ? "Diagram Save Failed"
      : diagramSave.label === "Saved"
        ? "Diagram Saved"
        : diagramSave.label === "Saving…"
          ? "Saving Diagram…"
          : "Save Diagram";
  const layoutLabel =
    layoutSave.status === "error"
      ? "Layout Save Failed"
      : layoutSave.label === "Saved"
        ? "Layout Saved"
        : layoutSave.label === "Saving…"
          ? "Saving Layout…"
          : "Save Layout";

  const items = [
    { label: diagramLabel, value: "diagram" as const },
    { label: layoutLabel, value: "layout" as const },
  ];

  const handleSelect = (value: "diagram" | "layout" | null) => {
    if (value === "diagram") {
      if (!diagramSave.isDisabled) diagramSave.handleClick();
    } else if (value === "layout" && !layoutSave.isDisabled) {
      layoutSave.handleClick();
    }
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        size="md"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        Save
        <span className="ml-1 opacity-60">▾</span>
      </Button>

      <Dropdown<"diagram" | "layout" | null>
        items={items}
        value={null}
        onChange={handleSelect}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        highlightedIndex={highlightedIndex}
        onHighlightChange={setHighlightedIndex}
        triggerRef={triggerRef}
      />

      {diagramSave.dialog}
      {layoutSave.dialog}
    </div>
  );
}
