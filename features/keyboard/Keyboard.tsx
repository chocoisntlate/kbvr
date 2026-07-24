"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/features/spec/layoutSchema";
import { Diagram, Shortcut } from "../spec/diagramSchema";
import { Key } from "./Key";
import { useKeyboard } from "./KeyboardContext";
import InspectModal from "../inspect/InspectKey";
import { getKeyDescription } from "./description";

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const UNIT = 55;
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
  const {
    keyDiagram,
    keyLayout,
    isInspectMode,
    pressedKeys,
    setPressedKeys,
    setKeyboardHeight,
  } = useKeyboard();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingShortcuts, setEditingShortcuts] = useState<
    Diagram["shortcuts"]
  >([]);
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
      const key = shortcut.displayKey;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(shortcut);
    }

    return map;
  }, [keyLayout, keyDiagram]);

  const layout = useMemo(
    () => addGapCompensation(keyLayout.rows, GAP),
    [keyLayout, keyDiagram],
  );

  // ------------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------------

  const toggleKey = useCallback((keyId: string | null) => {
    if (!keyId) return;

    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.has(keyId) ? next.delete(keyId) : next.add(keyId);
      return next;
    });
  }, [setPressedKeys]);

  const editKey = useCallback(
    (keyId: string | null) => {
      if (!keyId || !keyDiagram) return;

      const shortcutsForKey = keyDiagram.shortcuts.filter(
        (s) => s.displayKey === keyId,
      );

      setEditingKey(keyId);
      setEditingShortcuts(shortcutsForKey);
    },
    [keyDiagram],
  );

  // reset interaction state when toggling modes
  useEffect(() => {
    setEditingKey(null);
    setEditingShortcuts([]);
  }, [isInspectMode]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <>
      <div
        ref={keyboardRef}
        className="flex flex-col gap-1 rounded-xl p-3 shadow-md border border-gray-300 w-fit"
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
                  onClick={() =>
                    isInspectMode ? editKey(key.id) : toggleKey(key.id)
                  }
                />
              ),
            )}
          </div>
        ))}
      </div>

      {editingKey && (
        <InspectModal
          keyId={editingKey}
          shortcuts={editingShortcuts}
          onClose={() => {
            setEditingKey(null);
            setEditingShortcuts([]);
          }}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------------
// Editor stub (intentionally minimal)
// ------------------------------------------------------------------
