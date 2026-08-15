"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useKeyboardContent,
  useKeyboardUI,
  usePressedKeys,
} from "../keyboard/KeyboardContext";
import { HoverTooltip } from "../keyboard/HoverTooltip";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { SaveMenuButton } from "./SaveMenuButton";
import { ImportMenuButton } from "./ImportMenuButton";
import { ExportMenuButton } from "./ExportMenuButton";
import { MatchToLayoutButton } from "./MatchToLayoutButton";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return (el as HTMLElement).isContentEditable ?? false;
}

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
    keyboardWidth,
  } = useKeyboardUI();
  const { setPressedKeys } = usePressedKeys();

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
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
      className="flex flex-wrap items-center justify-between gap-2 gap-y-2 my-2"
      style={{
        background: "none",
        minHeight: 0,
        // pinned to the keyboard's own rendered width so the right-hand
        // buttons stay above the keyboard's right edge, not the far edge
        // of the row (which widens once the search panel is shown)
        width: keyboardWidth ?? undefined,
      }}
    >
      <div className="inline-flex flex-wrap items-center gap-2">
        <Button
          size="md"
          className="relative group"
          onClick={() => setInspectMode((prev) => !prev)}
          aria-pressed={isInspectMode}
        >
          {isInspectMode ? "Exit Inspection" : "Inspect Keys"}
          <HoverTooltip>Press I to toggle</HoverTooltip>
        </Button>
        <Button
          size="md"
          className="relative group"
          onClick={() => setJsonEditorVisible((prev) => !prev)}
          aria-pressed={isJsonEditorVisible}
        >
          {isJsonEditorVisible ? "Hide JSON" : "Show JSON"}
          <HoverTooltip>Press J to toggle</HoverTooltip>
        </Button>
        <Button
          size="md"
          className="relative group"
          onClick={() => setSearchVisible((prev) => !prev)}
          aria-pressed={isSearchVisible}
        >
          {isSearchVisible ? "Hide Search" : "Show Search"}
          <HoverTooltip>Press / to toggle</HoverTooltip>
        </Button>
        <Button
          size="md"
          className="relative group"
          onClick={() => setPressedKeys(new Set())}
        >
          Reset Pressed Keys
          <HoverTooltip>Press Escape to reset</HoverTooltip>
        </Button>
        <div className="relative">
          <Button
            ref={modeTriggerRef}
            size="md"
            className="relative group"
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
            <HoverTooltip>Press M to open • 0-9 to jump directly</HoverTooltip>
          </Button>

          <Dropdown
            items={modeItems}
            value={activeMode}
            onChange={setActiveMode}
            isOpen={isModeMenuOpen}
            onOpenChange={setIsModeMenuOpen}
            highlightedIndex={highlightedIndex}
            onHighlightChange={setHighlightedIndex}
            triggerRef={modeTriggerRef}
            renderBadge={(index) => (index <= 9 ? index : null)}
          />
        </div>
      </div>

      <div className="inline-flex flex-wrap items-center gap-2">
        <SaveMenuButton />
        <ImportMenuButton />
        <ExportMenuButton />
        <MatchToLayoutButton />
      </div>
    </div>
  );
}
