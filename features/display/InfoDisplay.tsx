"use client";

import React from "react";
import { ImportExportButton } from "./ImportExport";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import { SavePostButton } from "@/features/posts/SavePostButton";

/* ------------------------------------------------------------------ */
/* Keyboard panel with diagram + optional layout info                 */
/* ------------------------------------------------------------------ */

export function KeyboardPanel() {
  const {
    keyDiagram,
    setKeyDiagram,
    keyLayout,
    setKeyLayout,
    currentDiagramMeta,
    setCurrentDiagramMeta,
    currentLayoutMeta,
    setCurrentLayoutMeta,
  } = useKeyboardContent();

  /* Helper to import JSON, update state, and detach it from any saved post */
  const handleImport = <T,>(
    file: File,
    setter: React.Dispatch<React.SetStateAction<T>>,
    resetMeta: () => void,
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as T;
        setter(data);
        resetMeta();
      } catch (err) {
        console.error("Failed to import JSON:", err);
      }
    };
    reader.readAsText(file);
  };

  /* Helper to export JSON */
  const handleExport = (name: string, data: object) => {
    // sanitize name to be file-system safe
    const safeName = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    const filename = `${safeName}.keydiagram.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex justify-center w-full max-w-5xl gap-4 rounded-xl p-4">
      {/* Diagram Info Row */}
      <InfoRow
        title="Diagram"
        name={keyDiagram.name}
        description={keyDiagram.description}
        meta={
          <>
            <MetaRow label="Name" value={keyDiagram.name} />
            <MetaRow label="Description" value={keyDiagram.description} />
            <MetaRow label="Shortcuts" value={keyDiagram.shortcuts.length} />
            <MetaRow
              label="Tags"
              value={
                new Set(
                  keyDiagram.shortcuts
                    .flatMap((s) => s.tags ?? [])
                    .filter(Boolean),
                ).size
              }
            />
          </>
        }
        actions={
          <>
            <ImportExportButton
              title="Import"
              onFileSelect={(file) =>
                handleImport(file, setKeyDiagram, () =>
                  setCurrentDiagramMeta(null),
                )
              }
            />
            <ImportExportButton
              title="Export"
              onClick={() => handleExport(keyDiagram.name, keyDiagram)}
            />
            <SavePostButton
              kind="diagram"
              data={keyDiagram}
              meta={currentDiagramMeta}
              onMetaChange={setCurrentDiagramMeta}
            />
          </>
        }
      />

      {/* Layout Info Row */}
      <InfoRow
        title="Layout"
        name={keyLayout.name}
        description={keyLayout.description}
        meta={
          <>
            <MetaRow label="Name" value={keyLayout.name} />
            <MetaRow label="Description" value={keyLayout.description} />
            <MetaRow label="Rows" value={keyLayout.rows.length} />
            <MetaRow
              label="Keys"
              value={
                new Set(
                  keyLayout.rows.flatMap((r) =>
                    r.map((k) => k.id).filter(Boolean),
                  ),
                ).size
              }
            />
          </>
        }
        actions={
          <>
            <ImportExportButton
              title="Import"
              onFileSelect={(file) =>
                handleImport(file, setKeyLayout, () =>
                  setCurrentLayoutMeta(null),
                )
              }
            />
            <ImportExportButton
              title="Export"
              onClick={() => handleExport(keyLayout.name, keyLayout)}
            />
            <SavePostButton
              kind="layout"
              data={keyLayout}
              meta={currentLayoutMeta}
              onMetaChange={setCurrentLayoutMeta}
            />
          </>
        }
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* InfoRow & InfoHover                                                 */
/* ------------------------------------------------------------------ */

type InfoRowProps = {
  title: string;
  name: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

function InfoRow({ title, name, description, meta, actions }: InfoRowProps) {
  return (
    <div className="flex items-center gap-x-3 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm relative flex-1 min-w-0">
      {meta && (
        <div className="absolute top-3 left-3">
          <InfoHover>{meta}</InfoHover>
        </div>
      )}

      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 justify-self-start w-max">
        {title}
      </h2>

      <div className="flex min-w-0 flex-col gap-1 mr-auto">
        <span className="truncate text-sm font-medium text-gray-900">
          {name}
        </span>
        {description && (
          <span className="truncate text-xs text-gray-500">{description}</span>
        )}
      </div>

      {actions && (
        <div className="flex flex-col gap-2.5 justify-center">{actions}</div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-semibold text-gray-500">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function InfoHover({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="More information"
      >
        i
      </button>

      {/* pt-2 (not mt-2) keeps this wrapper's box touching the button with
          no true gap, so the cursor stays over a hoverable element the
          whole way from the icon into the panel below it */}
      <div
        className="absolute left-0 top-full z-10 w-64 pt-2 translate-y-1
                opacity-0 pointer-events-none transition-all duration-150
                group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto"
      >
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-lg">
          <div className="flex flex-col gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
