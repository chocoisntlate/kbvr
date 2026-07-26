"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Diagram } from "../spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { INTRODUCTION_DIAGRAM } from "@/examples/default.diagram";
import { QWERTY_US_80 } from "../../examples/default.layout";
import { PostMeta } from "@/features/posts/types";

type KeyboardContextType = {
  keyDiagram: Diagram;
  setKeyDiagram: React.Dispatch<React.SetStateAction<Diagram>>;
  keyLayout: Layout;
  setKeyLayout: React.Dispatch<React.SetStateAction<Layout>>;
  isInspectMode: boolean;
  setInspectMode: React.Dispatch<React.SetStateAction<boolean>>;
  pressedKeys: Set<string>;
  setPressedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  isSearchVisible: boolean;
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  keyboardHeight: number | null;
  setKeyboardHeight: React.Dispatch<React.SetStateAction<number | null>>;
  currentDiagramMeta: PostMeta | null;
  setCurrentDiagramMeta: React.Dispatch<React.SetStateAction<PostMeta | null>>;
  currentLayoutMeta: PostMeta | null;
  setCurrentLayoutMeta: React.Dispatch<React.SetStateAction<PostMeta | null>>;
};

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined,
);

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
  const [isInspectMode, setInspectMode] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(null);
  const [currentDiagramMeta, setCurrentDiagramMeta] =
    useState<PostMeta | null>(initialDiagramMeta ?? null);
  const [currentLayoutMeta, setCurrentLayoutMeta] =
    useState<PostMeta | null>(initialLayoutMeta ?? null);

  useEffect(() => {
    setPressedKeys(new Set());
  }, [isInspectMode]);

  return (
    <KeyboardContext.Provider
      value={{
        keyDiagram,
        setKeyDiagram,
        keyLayout,
        setKeyLayout,
        isInspectMode,
        setInspectMode,
        pressedKeys,
        setPressedKeys,
        isSearchVisible,
        setSearchVisible,
        keyboardHeight,
        setKeyboardHeight,
        currentDiagramMeta,
        setCurrentDiagramMeta,
        currentLayoutMeta,
        setCurrentLayoutMeta,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context)
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  return context;
};
