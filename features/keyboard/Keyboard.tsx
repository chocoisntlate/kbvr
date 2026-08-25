"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/features/spec/layoutSchema";
import { Shortcut } from "../spec/diagramSchema";
import { Key } from "./Key";
import {
  useKeyboardContent,
  useKeyboardUI,
  usePressedKeys,
} from "./KeyboardContext";
import InspectModal from "../inspect/InspectKey";
import { getKeyDescription } from "./description";
import { getDisplayKey } from "../diagram/shortcut";

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const MAX_UNIT = 60;
const MIN_UNIT = 32;
const GAP = 4;
const GAP_RATIO = GAP / MAX_UNIT;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function addGapCompensation(rows: Layout["rows"], unit: number, gap: number) {
  return rows.map((row) =>
    row.map((key) => ({
      ...key,
      adjustedWidth:
        (key.widthScale ?? 1) * unit + ((key.widthScale ?? 1) - 1) * gap,
    })),
  );
}

function getMaxRowScale(rows: Layout["rows"]) {
  return Math.max(
    ...rows.map((row) =>
      row.reduce((sum, key) => sum + (key.widthScale ?? 1), 0),
    ),
  );
}

const clampUnit = (value: number) =>
  Math.max(MIN_UNIT, Math.min(MAX_UNIT, value));

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function Keyboard() {
  const { keyDiagram, keyLayout } = useKeyboardContent();
  const {
    isInspectMode,
    activeMode,
    setKeyboardHeight,
    setKeyboardWidth,
    editingKey,
    setEditingKey,
    isSearchVisible,
  } = useKeyboardUI();
  const { pressedKeys, setPressedKeys } = usePressedKeys();
  const keyboardRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState(MAX_UNIT);
  const [gap, setGap] = useState(GAP);

  // publish the keyboard's rendered size so sibling UI can match it: the
  // search panel matches height without growing past it, and the buttons
  // bar matches width so it stays pinned above the keyboard regardless of
  // whether the search panel is shown next to it
  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      // below `lg` the keyboard's wrapper is `display: none`, which reports
      // a phantom 0x0 rect here; ignore it so dependent UI (the search
      // panel's height match) keeps its last real measurement instead of
      // collapsing to 0
      if (rect.width === 0 && rect.height === 0) return;
      setKeyboardHeight(rect.height);
      setKeyboardWidth(rect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [setKeyboardHeight, setKeyboardWidth]);

  const maxRowScale = useMemo(
    () => getMaxRowScale(keyLayout.rows),
    [keyLayout],
  );

  // shrink/grow the key unit to fit whatever width the surrounding layout
  // actually gives us, instead of rendering at a fixed pixel size. gap is
  // resolved first because it rounds to whole pixels; the unit then takes the
  // remainder unrounded so the rows land exactly on the measured width rather
  // than stopping up to a unit short of it and leaving a hole on the right.
  useEffect(() => {
    const outer = sizerRef.current;
    const inner = keyboardRef.current;
    if (!outer || !inner) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const available = outer.clientWidth;
        if (!available) return;

        const cs = getComputedStyle(inner);
        const paddingBorder =
          parseFloat(cs.paddingLeft) +
          parseFloat(cs.paddingRight) +
          parseFloat(cs.borderLeftWidth) +
          parseFloat(cs.borderRightWidth);
        // half a pixel of slack so float error can never round up into a scrollbar
        const content = available - paddingBorder - 0.5;

        const nextGap = Math.max(
          2,
          Math.round(clampUnit(content / maxRowScale) * GAP_RATIO),
        );
        const nextUnit = clampUnit(
          (content - (maxRowScale - 1) * nextGap) / maxRowScale,
        );

        setUnit((prev) => (prev === nextUnit ? prev : nextUnit));
        setGap((prev) => (prev === nextGap ? prev : nextGap));
      });
    });
    observer.observe(outer);
    return () => observer.disconnect();
  }, [maxRowScale]);

  const keyCandidatesMap = useMemo(() => {
    if (!keyDiagram) return new Map<string, Shortcut[]>();

    const map = new Map<string, Shortcut[]>();

    for (const shortcut of keyDiagram.shortcuts) {
      if (activeMode !== null && shortcut.mode !== activeMode) continue;

      const key = getDisplayKey(shortcut);

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(shortcut);
    }

    return map;
  }, [keyDiagram, activeMode]);

  const layout = useMemo(
    () => addGapCompensation(keyLayout.rows, unit, gap),
    [keyLayout, unit, gap],
  );

  // ------------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------------

  const toggleKey = useCallback(
    (keyId: string | null) => {
      if (!keyId) return;

      setPressedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(keyId)) {
          next.delete(keyId);
        } else {
          next.add(keyId);
        }
        return next;
      });
    },
    [setPressedKeys],
  );

  const editingShortcuts = useMemo(() => {
    if (!editingKey || !keyDiagram) return [];

    return keyDiagram.shortcuts.filter(
      (s) =>
        getDisplayKey(s) === editingKey &&
        (activeMode === null || s.mode === activeMode),
    );
  }, [editingKey, keyDiagram, activeMode]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <>
      <div
        ref={sizerRef}
        className={`w-full min-w-0 flex overflow-x-auto ${
          isSearchVisible ? "justify-center lg:justify-start" : "justify-center"
        }`}
      >
        <div
          ref={keyboardRef}
          className="flex flex-col gap-1 rounded-xl p-3 border border-neutral-300 w-fit dark:border-neutral-700 dark:bg-neutral-900"
        >
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ gap }}>
              {row.map((key, keyIndex) =>
                key.id === null ? (
                  <div
                    key={`gap-${rowIndex}-${keyIndex}`}
                    className="flex-none"
                    style={{ width: key.adjustedWidth }}
                  />
                ) : (
                  <Key
                    key={key.id}
                    label={key.label}
                    width={key.adjustedWidth}
                    unit={unit}
                    description={getKeyDescription(
                      keyCandidatesMap.get(key.id),
                      pressedKeys,
                    )}
                    candidateCount={keyCandidatesMap.get(key.id)?.length ?? 0}
                    isPressed={pressedKeys.has(key.id)}
                    isInspectMode={isInspectMode}
                    onClick={() =>
                      isInspectMode ? setEditingKey(key.id) : toggleKey(key.id)
                    }
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {editingKey && (
        <InspectModal
          key={`${editingKey}:${activeMode ?? ""}`}
          keyId={editingKey}
          shortcuts={editingShortcuts}
          activeMode={activeMode}
          onClose={() => setEditingKey(null)}
        />
      )}
    </>
  );
}
