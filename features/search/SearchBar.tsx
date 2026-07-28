"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useKeyboardContent, useKeyboardUI, usePressedKeys } from "../keyboard/KeyboardContext";
import { searchShortcuts } from "./searchShortcuts";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return (el as HTMLElement).isContentEditable ?? false;
}

export default function SearchBar() {
  const { keyDiagram, keyLayout } = useKeyboardContent();
  const { isInspectMode, isSearchVisible, keyboardHeight } = useKeyboardUI();
  const { pressedKeys, setPressedKeys } = usePressedKeys();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const focusBaselineRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 275);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(
    () => searchShortcuts(keyDiagram, debouncedQuery),
    [keyDiagram, debouncedQuery],
  );

  const keyLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of keyLayout.rows) {
      for (const key of row) {
        if (key.id) map.set(key.id, key.label);
      }
    }
    return map;
  }, [keyLayout]);

  const formatKeys = useCallback(
    (keys: string[]) => keys.map((k) => keyLabels.get(k) ?? k).join(" + "),
    [keyLabels],
  );

  const previewResult = useCallback(
    (index: number) => {
      setPressedKeys(new Set(results[index].shortcut.keys));
      setActiveIndex(index);
    },
    [results, setPressedKeys],
  );

  const selectResult = useCallback(
    (index: number) => {
      const stuck = new Set(results[index].shortcut.keys);
      setPressedKeys(stuck);
      focusBaselineRef.current = stuck;
    },
    [results, setPressedKeys],
  );

  const revertToBaseline = useCallback(() => {
    setPressedKeys(focusBaselineRef.current ?? new Set());
    setActiveIndex(null);
    setIsFocused(false);
  }, [setPressedKeys]);

  // a new search invalidates whatever was being previewed from the old list
  useEffect(() => {
    if (activeIndex !== null) revertToBaseline();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isSearchVisible || isInspectMode) return;

      if (e.key === "Escape") {
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
        return;
      }

      if (document.activeElement === inputRef.current && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next =
            activeIndex === null
              ? 0
              : Math.min(activeIndex + 1, results.length - 1);
          previewResult(next);
          itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          const next = activeIndex === null ? 0 : Math.max(activeIndex - 1, 0);
          previewResult(next);
          itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return;
        }

        if (e.key === "Enter" && activeIndex !== null) {
          e.preventDefault();
          selectResult(activeIndex);
          return;
        }
      }

      if (
        e.key.toLowerCase() === "s" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTypingTarget(document.activeElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isInspectMode,
    isSearchVisible,
    results,
    activeIndex,
    previewResult,
    selectResult,
  ]);

  if (!isSearchVisible || isInspectMode) return null;

  return (
    <div
      className="flex min-h-0 w-64 flex-col gap-1"
      style={{ height: keyboardHeight ?? undefined }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={(e) => {
          focusBaselineRef.current = pressedKeys;
          setIsFocused(true);
          e.target.select();
        }}
        onBlur={revertToBaseline}
        placeholder="Search shortcuts... (press s to focus)"
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
      />

      {isFocused && results.length > 0 && (
        <ul
          onMouseDown={(e) => e.preventDefault()}
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm"
        >
          {results.map((result, index) => (
            <li
              key={result.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onMouseEnter={() => previewResult(index)}
              onMouseLeave={() =>
                setActiveIndex((prev) => (prev === index ? null : prev))
              }
              onClick={() => selectResult(index)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-gray-100 ${
                activeIndex === index ? "bg-gray-100" : ""
              }`}
            >
              <span className="truncate">{result.description}</span>
              <span className="shrink-0 whitespace-nowrap text-[10px] text-gray-400">
                {formatKeys(result.shortcut.keys)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
