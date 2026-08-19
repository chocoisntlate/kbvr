"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { isTypingTarget } from "./isTypingTarget";

export function useFocusShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  options?: { key?: string; enabled?: boolean },
) {
  const key = options?.key ?? "s";
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
        return;
      }

      if (
        e.key.toLowerCase() === key &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTypingTarget(document.activeElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputRef, key, enabled]);
}
