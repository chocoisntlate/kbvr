"use client";

import { useEffect } from "react";
import {
  useKeyboardContent,
  useKeyboardUI,
  usePressedKeys,
} from "../keyboard/KeyboardContext";

export default function ButtonsBar() {
  const { keyDiagram } = useKeyboardContent();
  const {
    setInspectMode,
    isInspectMode,
    isSearchVisible,
    setSearchVisible,
    activeMode,
    setActiveMode,
  } = useKeyboardUI();
  const { setPressedKeys } = usePressedKeys();

  const declaredModes = keyDiagram.modes;

  useEffect(() => {
    if (activeMode !== null && !declaredModes?.includes(activeMode)) {
      setActiveMode(null);
    }
  }, [declaredModes, activeMode, setActiveMode]);

  return (
    <div
      className="inline-flex items-center gap-2 my-2"
      style={{ background: "none", minHeight: 0 }}
    >
      <button
        className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium shadow-sm bg-white hover:bg-gray-100 transition-colors"
        onClick={() => setInspectMode((prev) => !prev)}
        aria-pressed={isInspectMode}
      >
        {isInspectMode ? "Exit Inspection" : "Inspect Keys"}
      </button>
      {!isInspectMode && (
        <>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium shadow-sm bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setSearchVisible((prev) => !prev)}
            aria-pressed={isSearchVisible}
          >
            {isSearchVisible ? "Hide Search" : "Show Search"}
          </button>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium shadow-sm bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setPressedKeys(new Set())}
          >
            Reset Pressed Keys
          </button>
          {declaredModes && declaredModes.length > 0 && (
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium shadow-sm bg-white hover:bg-gray-100 transition-colors"
              value={activeMode ?? ""}
              onChange={(e) => setActiveMode(e.target.value || null)}
              aria-label="Active mode"
            >
              <option value="">All modes</option>
              {declaredModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </div>
  );
}
