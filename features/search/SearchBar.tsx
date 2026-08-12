"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useKeyboardContent,
  useKeyboardUI,
  usePressedKeys,
} from "../keyboard/KeyboardContext";
import { searchShortcuts } from "./searchShortcuts";
import { getDisplayKey } from "../diagram/shortcut";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return (el as HTMLElement).isContentEditable ?? false;
}

function highlightMatch(description: string, trimmedQuery: string) {
  if (!trimmedQuery) return description;

  const start = description.toLowerCase().indexOf(trimmedQuery);
  if (start === -1) return description;

  const end = start + trimmedQuery.length;
  return (
    <>
      {description.slice(0, start)}
      <span className="font-semibold">{description.slice(start, end)}</span>
      {description.slice(end)}
    </>
  );
}

export default function SearchBar() {
  const { keyDiagram, keyLayout } = useKeyboardContent();
  const {
    isInspectMode,
    isSearchVisible,
    keyboardHeight,
    activeMode,
    setEditingKey,
  } = useKeyboardUI();
  const { pressedKeys, setPressedKeys } = usePressedKeys();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const focusBaselineRef = useRef<Set<string> | null>(null);

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(
    () => searchShortcuts(keyDiagram, query, activeMode),
    [keyDiagram, query, activeMode],
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
      const shortcut = results[index].shortcut;
      setPressedKeys(
        isInspectMode
          ? new Set([getDisplayKey(shortcut)])
          : new Set(shortcut.keys),
      );
      setActiveIndex(index);
    },
    [results, setPressedKeys, isInspectMode],
  );

  const selectResult = useCallback(
    (index: number) => {
      const shortcut = results[index].shortcut;

      if (isInspectMode) {
        setEditingKey(getDisplayKey(shortcut));
        return;
      }

      const stuck = new Set(shortcut.keys);
      setPressedKeys(stuck);
      focusBaselineRef.current = stuck;
    },
    [results, setPressedKeys, isInspectMode, setEditingKey],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const revertPreview = useCallback(() => {
    setPressedKeys(focusBaselineRef.current ?? new Set());
    setActiveIndex(null);
  }, [setPressedKeys]);

  const revertToBaseline = useCallback(() => {
    revertPreview();
    clearSearch();
    setIsFocused(false);
  }, [revertPreview]);

  // a new search invalidates whatever was being previewed from the old list;
  // deliberately only reacts to query, not activeIndex/revertPreview,
  // otherwise every arrow-key preview would immediately revert itself.
  // Only clears the preview, not focus - the input is still focused while typing.
  useEffect(() => {
    if (activeIndex !== null) revertPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isSearchVisible) return;

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

  if (!isSearchVisible) return null;

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
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
      />

      {isFocused && results.length > 0 && (
        <ul
          onMouseDown={(e) => e.preventDefault()}
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
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
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 ${
                activeIndex === index ? "bg-teal-50 dark:bg-teal-950/40" : ""
              }`}
            >
              <span className="truncate">
                {highlightMatch(result.description, trimmedQuery)}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {activeMode === null && result.shortcut.mode && (
                  <span className="rounded bg-neutral-100 px-1 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    {result.shortcut.mode}
                  </span>
                )}
                <span className="whitespace-nowrap text-[10px] text-neutral-400 dark:text-neutral-500">
                  {formatKeys(result.shortcut.keys)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {isFocused && results.length === 0 && trimmedQuery && (
        <div className="rounded-md border border-neutral-200 bg-white px-2 py-3 text-center text-xs text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
          No shortcuts found
        </div>
      )}
    </div>
  );
}
