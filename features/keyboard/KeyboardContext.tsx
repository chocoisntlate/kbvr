"use client";

import { createContext, useContext, useState } from "react";
import { Diagram } from "../spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { INTRODUCTION_DIAGRAM } from "@/examples/default.diagram";
import { QWERTY_US_80 } from "../../examples/default.layout";
import { PostMeta } from "@/features/posts/types";

// ------------------------------------------------------------------
// Content: diagram/layout data + their saved-post metadata.
// Changes only on import/save/switch, so components that only read
// this (e.g. InfoDisplay) don't re-render on key clicks or mode toggles.
// ------------------------------------------------------------------

type KeyboardContentType = {
  keyDiagram: Diagram;
  setKeyDiagram: React.Dispatch<React.SetStateAction<Diagram>>;
  keyLayout: Layout;
  setKeyLayout: React.Dispatch<React.SetStateAction<Layout>>;
  currentDiagramMeta: PostMeta | null;
  setCurrentDiagramMeta: React.Dispatch<React.SetStateAction<PostMeta | null>>;
  currentLayoutMeta: PostMeta | null;
  setCurrentLayoutMeta: React.Dispatch<React.SetStateAction<PostMeta | null>>;
};

const KeyboardContentContext = createContext<KeyboardContentType | undefined>(
  undefined,
);

export const useKeyboardContent = () => {
  const context = useContext(KeyboardContentContext);
  if (!context)
    throw new Error(
      "useKeyboardContent must be used within a KeyboardContextProvider",
    );
  return context;
};

// ------------------------------------------------------------------
// UI: mode/search/height flags. Changes occasionally, independent of
// which key is pressed.
// ------------------------------------------------------------------

type KeyboardUIType = {
  isInspectMode: boolean;
  setInspectMode: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchVisible: boolean;
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isJsonEditorVisible: boolean;
  setJsonEditorVisible: React.Dispatch<React.SetStateAction<boolean>>;
  keyboardHeight: number | null;
  setKeyboardHeight: React.Dispatch<React.SetStateAction<number | null>>;
  activeMode: string | null;
  setActiveMode: React.Dispatch<React.SetStateAction<string | null>>;
};

const KeyboardUIContext = createContext<KeyboardUIType | undefined>(
  undefined,
);

export const useKeyboardUI = () => {
  const context = useContext(KeyboardUIContext);
  if (!context)
    throw new Error(
      "useKeyboardUI must be used within a KeyboardContextProvider",
    );
  return context;
};

// ------------------------------------------------------------------
// Pressed keys: changes on every key click, the hottest state in the
// app. Kept isolated so nothing else re-renders because of it.
// ------------------------------------------------------------------

type PressedKeysType = {
  pressedKeys: Set<string>;
  setPressedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const PressedKeysContext = createContext<PressedKeysType | undefined>(
  undefined,
);

export const usePressedKeys = () => {
  const context = useContext(PressedKeysContext);
  if (!context)
    throw new Error(
      "usePressedKeys must be used within a KeyboardContextProvider",
    );
  return context;
};

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------

export function KeyboardContextProvider({
  initialDiagram,
  initialLayout,
  initialDiagramMeta,
  initialLayoutMeta,
  children,
}: {
  initialDiagram?: Diagram;
  initialLayout?: Layout;
  initialDiagramMeta?: PostMeta | null;
  initialLayoutMeta?: PostMeta | null;
  children: React.ReactNode;
}) {
  const [keyDiagram, setKeyDiagram] = useState<Diagram>(
    initialDiagram ?? INTRODUCTION_DIAGRAM,
  );
  const [keyLayout, setKeyLayout] = useState<Layout>(
    initialLayout ?? QWERTY_US_80,
  );
  const [currentDiagramMeta, setCurrentDiagramMeta] =
    useState<PostMeta | null>(initialDiagramMeta ?? null);
  const [currentLayoutMeta, setCurrentLayoutMeta] =
    useState<PostMeta | null>(initialLayoutMeta ?? null);

  const [isInspectMode, setInspectMode] = useState<boolean>(false);
  const [isSearchVisible, setSearchVisible] = useState<boolean>(true);
  const [isJsonEditorVisible, setJsonEditorVisible] =
    useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const [prevInspectMode, setPrevInspectMode] = useState(isInspectMode);
  if (isInspectMode !== prevInspectMode) {
    setPrevInspectMode(isInspectMode);
    setPressedKeys(new Set());
  }

  return (
    <KeyboardContentContext.Provider
      value={{
        keyDiagram,
        setKeyDiagram,
        keyLayout,
        setKeyLayout,
        currentDiagramMeta,
        setCurrentDiagramMeta,
        currentLayoutMeta,
        setCurrentLayoutMeta,
      }}
    >
      <KeyboardUIContext.Provider
        value={{
          isInspectMode,
          setInspectMode,
          isSearchVisible,
          setSearchVisible,
          isJsonEditorVisible,
          setJsonEditorVisible,
          keyboardHeight,
          setKeyboardHeight,
          activeMode,
          setActiveMode,
        }}
      >
        <PressedKeysContext.Provider value={{ pressedKeys, setPressedKeys }}>
          {children}
        </PressedKeysContext.Provider>
      </KeyboardUIContext.Provider>
    </KeyboardContentContext.Provider>
  );
}
