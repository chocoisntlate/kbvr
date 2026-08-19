"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFocusShortcut } from "@/features/ui/useFocusShortcut";

export function BrowseSearchInput({
  initialQuery,
  type,
}: {
  initialQuery: string;
  type: string;
}) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusShortcut(inputRef);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("type", type);
      if (value) params.set("q", value);
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, type]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search by name or description… (press s to focus)"
      className="flex-1 min-w-0 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
    />
  );
}
