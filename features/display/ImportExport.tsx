"use client";

import { useRef } from "react";
import { Button } from "@/features/ui/Button";

type ImportExportButtonProps<T> = {
  title: string;
  onClick?: () => void;
  onFileSelect?: (
    file: File,
    contextSetter?: React.Dispatch<React.SetStateAction<T>>,
  ) => void;
  contextSetter?: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
};

export function ImportExportButton<T>({
  title,
  onClick,
  onFileSelect,
  contextSetter,
  disabled,
}: ImportExportButtonProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (onFileSelect) {
      fileInputRef.current?.click(); // trigger file picker
    } else {
      onClick?.(); // normal action
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) onFileSelect(file, contextSetter);
  };

  return (
    <>
      <Button size="md" onClick={handleClick} disabled={disabled}>
        {title}
      </Button>
      {onFileSelect && (
        <input
          type="file"
          accept=".json,application/json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </>
  );
}
