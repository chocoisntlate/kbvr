"use client";

import { useRef, useState } from "react";
import { Button } from "@/features/ui/Button";
import { Dropdown } from "@/features/ui/Dropdown";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { importJsonFile } from "./importExportUtil";

const items = [
  { label: "Import Diagram", value: "diagram" as const },
  { label: "Import Layout", value: "layout" as const },
];

export function ImportMenuButton() {
  const { setKeyDiagram, setKeyLayout } = useKeyboardContent();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const diagramInputRef = useRef<HTMLInputElement>(null);
  const layoutInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (value: "diagram" | "layout" | null) => {
    if (value === "diagram") diagramInputRef.current?.click();
    else if (value === "layout") layoutInputRef.current?.click();
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
        Import
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

      <input
        type="file"
        accept=".json,application/json"
        ref={diagramInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importJsonFile(file, setKeyDiagram);
          e.target.value = "";
        }}
      />
      <input
        type="file"
        accept=".json,application/json"
        ref={layoutInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importJsonFile(file, setKeyLayout);
          e.target.value = "";
        }}
      />
    </div>
  );
}
