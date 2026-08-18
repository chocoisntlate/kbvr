"use client";

import { useState } from "react";
import { getExportBundleAction } from "@/features/posts/readActions";
import { Button } from "@/features/ui/Button";

export function ExportDataButton() {
  const [exporting, setExporting] = useState(false);

  // Fetched on click rather than passed in as props: the full `data` jsonb of
  // every owned post is far too much to ship with the account page's HTML
  // when most visits never press this.
  const handleExport = async () => {
    setExporting(true);
    try {
      const bundle = await getExportBundleAction();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "kbvr-export.json";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting}>
      {exporting ? "Preparing…" : "Export my data"}
    </Button>
  );
}
