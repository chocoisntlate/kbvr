"use client";

import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { Button } from "@/features/ui/Button";

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
    link.download = "kbvr-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <Button onClick={handleExport}>Export my data</Button>;
}
