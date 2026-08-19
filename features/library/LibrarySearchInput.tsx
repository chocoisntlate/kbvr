"use client";

import { useRef } from "react";
import { useFocusShortcut } from "@/features/ui/useFocusShortcut";

export function LibrarySearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusShortcut(inputRef);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search your library… (press s to focus)"
      className="flex-1 min-w-0 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
    />
  );
}
