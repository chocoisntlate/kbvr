import type { Dispatch, SetStateAction } from "react";

export function importJsonFile<T>(
  file: File,
  setter: Dispatch<SetStateAction<T>>,
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as T;
      setter(data);
    } catch (err) {
      console.error("Failed to import JSON:", err);
    }
  };
  reader.readAsText(file);
}

export function exportJson(
  name: string,
  data: object,
  extension: "keydiagram" | "keylayout",
) {
  const safeName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
  const filename = `${safeName}.${extension}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
