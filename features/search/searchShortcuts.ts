import { Diagram, Shortcut } from "../spec/diagramSchema";

export type SearchResult = {
  key: string;
  shortcut: Shortcut;
  description: string;
};

export function searchShortcuts(
  diagram: Diagram,
  query: string,
  activeMode: string | null,
): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: SearchResult[] = [];

  diagram.shortcuts.forEach((shortcut, shortcutIndex) => {
    if (activeMode !== null && shortcut.mode !== activeMode) return;

    shortcut.description.forEach((description, index) => {
      if (description.toLowerCase().includes(trimmed)) {
        results.push({
          key: `${shortcutIndex}-${index}`,
          shortcut,
          description,
        });
      }
    });
  });

  return results;
}
