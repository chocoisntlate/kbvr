import { CSSProperties } from "react";
import { useKeyboardUI } from "./KeyboardContext";

// Constrains a root element to the keyboard's own rendered width, and
// mirrors the keyboard's own horizontal alignment: flush-left next to the
// search panel when it's visible, centered in the row once the panel is
// hidden. Spread the result onto any element that should stay stuck to the
// keyboard (ButtonsBar, SpecEditor, ...) without expanding into the search
// panel's space.
export function useMatchKeyboardWidth(): {
  className: string;
  style: CSSProperties;
} {
  const { keyboardWidth, isSearchVisible } = useKeyboardUI();

  return {
    className: isSearchVisible ? "" : "mx-auto",
    style: { width: keyboardWidth ?? undefined, maxWidth: "100%" },
  };
}
