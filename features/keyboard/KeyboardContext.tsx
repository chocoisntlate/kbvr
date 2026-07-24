"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Diagram } from "../spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { INTRODUCTION_DIAGRAM } from "@/examples/default.diagram";
import { QWERTY_US_80 } from "../../examples/default.layout";

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
};

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined,
);

export function KeyboardContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [keyDiagram, setKeyDiagram] = useState<Diagram>(INTRODUCTION_DIAGRAM);
  const [keyLayout, setKeyLayout] = useState<Layout>(QWERTY_US_80);
  const [isInspectMode, setInspectMode] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number | null>(null);

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
