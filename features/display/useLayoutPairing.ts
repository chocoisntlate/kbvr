import { useMemo } from "react";
import { useKeyboardContent } from "../keyboard/KeyboardContext";
import {
  fingerprintLayout,
  getLayoutMismatch,
  LayoutMismatch,
} from "../diagram/layoutMatch";
import { Diagram } from "../spec/diagramSchema";

export function useLayoutPairing(): {
  intendedLayout: Diagram["intendedLayout"];
  isMatched: boolean;
  mismatch: LayoutMismatch;
  match: () => void;
} {
  const { keyDiagram, setKeyDiagram, keyLayout } = useKeyboardContent();

  const liveFingerprint = useMemo(
    () => fingerprintLayout(keyLayout),
    [keyLayout],
  );
  const mismatch = useMemo(
    () => getLayoutMismatch(keyDiagram, keyLayout),
    [keyDiagram, keyLayout],
  );

  const intendedLayout = keyDiagram.intendedLayout;
  const isMatched = intendedLayout?.fingerprint === liveFingerprint;

  const match = () => {
    setKeyDiagram((d) => ({
      ...d,
      intendedLayout: { name: keyLayout.name, fingerprint: liveFingerprint },
    }));
  };

  return { intendedLayout, isMatched, mismatch, match };
}
