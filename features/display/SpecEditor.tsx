"use client";

import { useState } from "react";
import { useKeyboardContent, useKeyboardUI } from "../keyboard/KeyboardContext";
import { DiagramSchema } from "../spec/diagramSchema";
import { LayoutSchema } from "../spec/layoutSchema";
import { useJsonDraft } from "./hooks/useJsonDraft";

const TAB_BASE =
  "rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors";
const TAB_ACTIVE = "border-gray-300 bg-gray-100 font-semibold";
const TAB_INACTIVE = "border-gray-300 bg-white hover:bg-gray-100";

type Target = "diagram" | "layout";

export default function SpecEditor() {
  const { isJsonEditorVisible } = useKeyboardUI();
  const [target, setTarget] = useState<Target>("diagram");

  if (!isJsonEditorVisible) return null;

  return (
    <div className="mt-4 w-full rounded-lg border border-gray-300 p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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
        className={`h-80 w-full resize-y rounded-md border px-3 py-2 font-mono text-xs leading-relaxed ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
