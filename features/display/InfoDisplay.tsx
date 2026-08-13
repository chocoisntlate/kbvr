"use client";

import React from "react";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { DiagramLayoutPairing } from "./DiagramLayoutPairing";

/* ------------------------------------------------------------------ */
/* Keyboard panel with diagram + optional layout info                 */
/* ------------------------------------------------------------------ */

export function KeyboardPanel() {
  const { keyDiagram, keyLayout } = useKeyboardContent();

  const keyCount = new Set(
    keyLayout.rows.flatMap((r) => r.map((k) => k.id).filter(Boolean)),
  ).size;

  return (
    <div className="flex flex-col gap-2 w-full max-w-5xl">
      <DiagramLayoutPairing />
      <section className="flex justify-center w-full gap-4 rounded-xl p-4">
        {/* Diagram Info Row */}
        <InfoRow
          title="Diagram"
          name={keyDiagram.name}
          description={keyDiagram.description}
          counters={`${keyDiagram.shortcuts.length} shortcuts`}
        />

        {/* Layout Info Row */}
        <InfoRow
          title="Layout"
          name={keyLayout.name}
          description={keyLayout.description}
          counters={`${keyCount} keys`}
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
  counters: string;
};

function InfoRow({ title, name, description, counters }: InfoRowProps) {
  return (
    <div className="flex items-center gap-x-3 rounded-lg border border-neutral-200 bg-white px-5 py-8 flex-1 min-w-0 dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 justify-self-start w-max dark:text-neutral-400">
        {title}
      </h2>

      <div className="flex min-w-0 flex-col gap-1 mr-auto">
        <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {name}
        </span>
        {description && (
          <div className="group relative min-w-0">
            <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>

            {/* pt-2 (not mt-2) keeps this wrapper's box touching the
                paragraph with no true gap, so the cursor stays over a
                hoverable element the whole way down into the panel */}
            <div
              className="absolute left-0 top-full z-20 w-80 max-w-[90vw] pt-2
                          translate-y-1 opacity-0 pointer-events-none transition-all
                          duration-150 group-hover:translate-y-0 group-hover:opacity-100
                          group-hover:pointer-events-auto"
            >
              <p className="whitespace-pre-wrap rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-700 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>

      <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
        {counters}
      </span>
    </div>
  );
}
