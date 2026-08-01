"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export type DropdownItem<T> = {
  label: string;
  value: T;
};

export function Dropdown<T>({
  items,
  value,
  onChange,
  isOpen,
  onOpenChange,
  highlightedIndex,
  onHighlightChange,
  triggerRef,
  renderBadge,
}: {
  items: DropdownItem<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  highlightedIndex: number;
  onHighlightChange: (index: number) => void;
  triggerRef?: RefObject<HTMLElement | null>;
  renderBadge?: (index: number) => ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onOpenChange(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onOpenChange, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="listbox"
      className="absolute left-0 top-full z-20 mt-1 flex min-w-full flex-col gap-0.5 rounded-md border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
    >
      {items.map((item, index) => (
        <button
          key={index}
          role="option"
          aria-selected={value === item.value}
          onClick={() => {
            onChange(item.value);
            onOpenChange(false);
          }}
          onMouseEnter={() => onHighlightChange(index)}
          className={`flex items-center justify-between gap-4 whitespace-nowrap rounded px-2 py-1 text-left text-xs ${
            index === highlightedIndex ? "bg-neutral-100 dark:bg-neutral-700" : ""
          } ${value === item.value ? "font-semibold" : ""}`}
        >
          <span>{item.label}</span>
          {renderBadge && (
            <span className="text-[10px] opacity-50">
              {renderBadge(index)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
