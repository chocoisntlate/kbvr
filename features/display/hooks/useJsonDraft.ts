"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export function useJsonDraft<T>(
  value: T,
  setValue: (next: T) => void,
  schema: z.ZodType<T>,
) {
  const canonical = JSON.stringify(value, null, 2);
  const [text, setText] = useState(canonical);
  const [error, setError] = useState<string | null>(null);
  const [lastCommitted, setLastCommitted] = useState(canonical);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (canonical !== lastCommitted) {
    setLastCommitted(canonical);
    setText(canonical);
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onChange = (next: string) => {
    setText(next);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(next);
      } catch {
        setError("Invalid JSON");
        return;
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        setError(
          result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        );
        return;
      }

      setError(null);
      setLastCommitted(JSON.stringify(result.data, null, 2));
      setValue(result.data);
    }, 500);
  };

  return { text, onChange, error };
}
