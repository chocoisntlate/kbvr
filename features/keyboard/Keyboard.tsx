"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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

const UNIT = 60;
const GAP = 4;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function addGapCompensation(rows: Layout["rows"], gap: number) {
  return rows.map((row) =>
    row.map((key) => ({
      ...key,
      adjustedWidth:
        (key.widthScale ?? 1) * UNIT + ((key.widthScale ?? 1) - 1) * gap,
    })),
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function Keyboard() {
  const { keyDiagram, keyLayout } = useKeyboardContent();
  const {
    isInspectMode,
    activeMode,
    setKeyboardHeight,
    editingKey,
    setEditingKey,
  } = useKeyboardUI();
  const { pressedKeys, setPressedKeys } = usePressedKeys();
  const keyboardRef = useRef<HTMLDivElement>(null);

  // publish the keyboard's rendered height so sibling UI (e.g. the search
  // panel) can size itself to match without growing past it
  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setKeyboardHeight(el.getBoundingClientRect().height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [setKeyboardHeight]);

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
    () => addGapCompensation(keyLayout.rows, GAP),
    [keyLayout],
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
        ref={keyboardRef}
        className="flex flex-col gap-1 rounded-xl p-3 border border-neutral-300 w-fit dark:border-neutral-700 dark:bg-neutral-900"
      >
        {layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex" style={{ gap: GAP }}>
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
                  unit={UNIT}
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
