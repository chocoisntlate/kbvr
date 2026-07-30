"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useKeyboardContent,
  useKeyboardUI,
  usePressedKeys,
} from "../keyboard/KeyboardContext";
import { HoverTooltip } from "../keyboard/HoverTooltip";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return (el as HTMLElement).isContentEditable ?? false;
}

const BUTTON_CLASS =
  "relative group rounded-md border border-gray-300 px-3 py-2 text-xs font-medium shadow-sm bg-white hover:bg-gray-100 transition-colors";

export default function ButtonsBar() {
  const { keyDiagram } = useKeyboardContent();
  const {
    setInspectMode,
    isInspectMode,
    isSearchVisible,
    setSearchVisible,
    isJsonEditorVisible,
    setJsonEditorVisible,
    activeMode,
    setActiveMode,
  } = useKeyboardUI();
  const { setPressedKeys } = usePressedKeys();

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const modeTriggerRef = useRef<HTMLButtonElement>(null);

  const declaredModes = keyDiagram.modes;

  const modeItems = useMemo(
    () => [
      { label: "All modes", value: null as string | null },
      ...(declaredModes ?? []).map((mode) => ({ label: mode, value: mode })),
    ],
    [declaredModes],
  );

  useEffect(() => {
    if (activeMode !== null && !declaredModes?.includes(activeMode)) {
      setActiveMode(null);
    }
  }, [declaredModes, activeMode, setActiveMode]);

  const [prevInspectMode, setPrevInspectMode] = useState(isInspectMode);
  if (isInspectMode !== prevInspectMode) {
    setPrevInspectMode(isInspectMode);
    if (isInspectMode) setIsModeMenuOpen(false);
  }

  useEffect(() => {
    if (!isModeMenuOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (!modeMenuRef.current?.contains(e.target as Node)) {
        setIsModeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isModeMenuOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) return;

      const key = e.key.toLowerCase();

      // toggles Inspect mode itself, so it must work regardless of isInspectMode
      if (key === "i") {
        e.preventDefault();
        setInspectMode((prev) => !prev);
        return;
      }

      // toggles the JSON editor's own visibility, independent of inspect mode
      if (key === "j") {
        e.preventDefault();
        setJsonEditorVisible((prev) => !prev);
        return;
      }

      if (isInspectMode) return;

      if (isModeMenuOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % modeItems.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev - 1 + modeItems.length) % modeItems.length,
          );
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          setActiveMode(modeItems[highlightedIndex].value);
          setIsModeMenuOpen(false);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsModeMenuOpen(false);
          return;
        }
      }

      if (e.key === "Escape") {
        setPressedKeys(new Set());
        return;
      }

      if (key === "m") {
        e.preventDefault();
        const currentIndex = modeItems.findIndex(
          (item) => item.value === activeMode,
        );
        setHighlightedIndex(currentIndex === -1 ? 0 : currentIndex);
        setIsModeMenuOpen(true);
        modeTriggerRef.current?.focus();
        return;
      }

      if (key === "/") {
        e.preventDefault();
        setSearchVisible((prev) => !prev);
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setIsModeMenuOpen(false);
        if (e.key === "0") {
          setActiveMode(null);
        } else {
          const mode = declaredModes?.[Number(e.key) - 1];
          if (mode) setActiveMode(mode);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isInspectMode,
    isModeMenuOpen,
    highlightedIndex,
    modeItems,
    activeMode,
    declaredModes,
    setInspectMode,
    setActiveMode,
    setSearchVisible,
    setJsonEditorVisible,
    setPressedKeys,
  ]);

  return (
    <div
      className="inline-flex items-center gap-2 my-2"
      style={{ background: "none", minHeight: 0 }}
    >
      <button
        className={BUTTON_CLASS}
        onClick={() => setInspectMode((prev) => !prev)}
        aria-pressed={isInspectMode}
      >
        {isInspectMode ? "Exit Inspection" : "Inspect Keys"}
        <HoverTooltip>Press I to toggle</HoverTooltip>
      </button>
      <button
        className={BUTTON_CLASS}
        onClick={() => setJsonEditorVisible((prev) => !prev)}
        aria-pressed={isJsonEditorVisible}
      >
        {isJsonEditorVisible ? "Hide JSON" : "Show JSON"}
        <HoverTooltip>Press J to toggle</HoverTooltip>
      </button>
      {!isInspectMode && (
        <>
          <button
            className={BUTTON_CLASS}
            onClick={() => setSearchVisible((prev) => !prev)}
            aria-pressed={isSearchVisible}
          >
            {isSearchVisible ? "Hide Search" : "Show Search"}
            <HoverTooltip>Press / to toggle</HoverTooltip>
          </button>
          <button
            className={BUTTON_CLASS}
            onClick={() => setPressedKeys(new Set())}
          >
            Reset Pressed Keys
            <HoverTooltip>Press Escape to reset</HoverTooltip>
          </button>
          <div ref={modeMenuRef} className="relative">
            <button
              ref={modeTriggerRef}
              className={BUTTON_CLASS}
              onClick={() =>
                setIsModeMenuOpen((prev) => {
                  const next = !prev;
                  if (next) {
                    const currentIndex = modeItems.findIndex(
                      (item) => item.value === activeMode,
                    );
                    setHighlightedIndex(currentIndex === -1 ? 0 : currentIndex);
                  }
                  return next;
                })
              }
              aria-haspopup="listbox"
              aria-expanded={isModeMenuOpen}
            >
              {activeMode ?? "All modes"}
              <span className="ml-1 opacity-60">▾</span>
              <HoverTooltip>
                Press M to open • 0-9 to jump directly
              </HoverTooltip>
            </button>

            {isModeMenuOpen && (
              <div
                role="listbox"
                className="absolute left-0 top-full z-20 mt-1 flex min-w-full flex-col gap-0.5 rounded-md border border-gray-300 bg-white p-1 shadow-lg"
              >
                {modeItems.map((item, index) => (
                  <button
                    key={item.value ?? "__all__"}
                    role="option"
                    aria-selected={activeMode === item.value}
                    onClick={() => {
                      setActiveMode(item.value);
                      setIsModeMenuOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-4 whitespace-nowrap rounded px-2 py-1 text-left text-xs ${
                      index === highlightedIndex ? "bg-gray-100" : ""
                    } ${activeMode === item.value ? "font-semibold" : ""}`}
                  >
                    <span>{item.label}</span>
                    {index <= 9 && (
                      <span className="text-[10px] opacity-50">{index}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
