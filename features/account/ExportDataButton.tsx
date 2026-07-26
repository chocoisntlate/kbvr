"use client";

import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";

export function ExportDataButton({
  diagrams,
  layouts,
}: {
  diagrams: Diagram[];
  layouts: Layout[];
}) {
  const handleExport = () => {
    const bundle = { diagrams, layouts };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "key-diagram-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
    >
      Export my data
    </button>
  );
}
