"use client";

import { useRef } from "react";

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
      <button
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleClick}
        disabled={disabled}
      >
        {title}
      </button>
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
