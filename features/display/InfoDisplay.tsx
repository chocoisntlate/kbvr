"use client";

import React, { useState } from "react";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { DiagramLayoutPairing } from "./DiagramLayoutPairing";

/* ------------------------------------------------------------------ */
/* Keyboard panel with diagram + optional layout info                 */
/* ------------------------------------------------------------------ */

export function KeyboardPanel() {
  const { keyDiagram, keyLayout } = useKeyboardContent();

  return (
    <div className="flex flex-col gap-2 w-full max-w-5xl">
      <DiagramLayoutPairing />
      <section className="flex flex-col lg:flex-row justify-center w-full gap-4 rounded-xl p-4">
        {/* Diagram Info Row */}
        <InfoRow
          title="Diagram"
          name={keyDiagram.name}
          description={keyDiagram.description}
        />

        {/* Layout Info Row */}
        <InfoRow
          title="Layout"
          name={keyLayout.name}
          description={keyLayout.description}
        />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InfoRow                                                             */
/* ------------------------------------------------------------------ */

type InfoRowProps = {
  title: string;
  name: string;
  description?: string;
};

function InfoRow({ title, name, description }: InfoRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white px-5 py-4 flex-1 min-w-0 dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </h2>

      <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {name}
      </span>

      {description && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="cursor-pointer text-left"
        >
          <p
            className={`whitespace-pre-wrap text-xs text-neutral-500 dark:text-neutral-400 ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {description}
          </p>
        </button>
      )}
    </div>
  );
}
