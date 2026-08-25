"use client";

import { useState } from "react";
import { useKeyboardContent, useKeyboardUI } from "../keyboard/KeyboardContext";
import { useMatchKeyboardWidth } from "../keyboard/useMatchKeyboardWidth";
import { DiagramSchema } from "../spec/diagramSchema";
import { LayoutSchema } from "../spec/layoutSchema";
import { useJsonDraft } from "./hooks/useJsonDraft";

const TAB_BASE =
  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400";
const TAB_ACTIVE =
  "border-teal-500 bg-teal-50 font-semibold dark:border-teal-400 dark:bg-teal-950/40";
const TAB_INACTIVE =
  "border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700";

type Target = "diagram" | "layout";

export default function SpecEditor() {
  const { isJsonEditorVisible } = useKeyboardUI();
  const [target, setTarget] = useState<Target>("diagram");
  const matchKeyboardWidth = useMatchKeyboardWidth();

  if (!isJsonEditorVisible) return null;

  return (
    <div
      className={`mt-4 rounded-lg border border-neutral-300 p-4 space-y-3 text-sm dark:border-neutral-700 ${matchKeyboardWidth.className}`}
      style={matchKeyboardWidth.style}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Raw JSON
        </h2>
        <div className="flex gap-2">
          <button
            className={`${TAB_BASE} ${target === "diagram" ? TAB_ACTIVE : TAB_INACTIVE}`}
            aria-pressed={target === "diagram"}
            onClick={() => setTarget("diagram")}
          >
            Diagram
          </button>
          <button
            className={`${TAB_BASE} ${target === "layout" ? TAB_ACTIVE : TAB_INACTIVE}`}
            aria-pressed={target === "layout"}
            onClick={() => setTarget("layout")}
          >
            Layout
          </button>
        </div>
      </div>

      <JsonEditorPane key={target} target={target} />
    </div>
  );
}

function JsonEditorPane({ target }: { target: Target }) {
  const { keyDiagram, setKeyDiagram, keyLayout, setKeyLayout } =
    useKeyboardContent();

  const diagramDraft = useJsonDraft(keyDiagram, setKeyDiagram, DiagramSchema);
  const layoutDraft = useJsonDraft(keyLayout, setKeyLayout, LayoutSchema);
  const { text, onChange, error } =
    target === "diagram" ? diagramDraft : layoutDraft;

  return (
    <div>
      <textarea
        spellCheck={false}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`h-80 w-full resize-y rounded-md border px-3 py-2 font-mono text-xs leading-relaxed dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-neutral-300 dark:border-neutral-700"
        }`}
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
