import { Diagram, Shortcut } from "../spec/diagramSchema";

export type SearchResult = {
  key: string;
  shortcut: Shortcut;
  description: string;
};

export function searchShortcuts(
  diagram: Diagram,
  query: string,
): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: SearchResult[] = [];

  for (const shortcut of diagram.shortcuts) {
    shortcut.description.forEach((description, index) => {
      if (description.toLowerCase().includes(trimmed)) {
        results.push({
          key: `${shortcut.displayKey}-${shortcut.keys.join("+")}-${index}`,
          shortcut,
          description,
        });
      }
    });
  }

  return results;
}
