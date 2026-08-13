"use client";

import { useRef, useState } from "react";
import { Button } from "@/features/ui/Button";
import { Dropdown } from "@/features/ui/Dropdown";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { exportJson } from "./importExportUtil";

const items = [
  { label: "Export Diagram", value: "diagram" as const },
  { label: "Export Layout", value: "layout" as const },
];

export function ExportMenuButton() {
  const { keyDiagram, keyLayout } = useKeyboardContent();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (value: "diagram" | "layout" | null) => {
    if (value === "diagram") {
      exportJson(keyDiagram.name, keyDiagram, "keydiagram");
    } else {
      exportJson(keyLayout.name, keyLayout, "keylayout");
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
        Export
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
    </div>
  );
}
