"use client";

export function HoverTooltip({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap dark:bg-neutral-700">
      {children}
    </span>
  );
}
