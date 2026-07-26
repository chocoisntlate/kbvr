"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search by name or description…"
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
    />
  );
}
