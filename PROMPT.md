1. Send the prompt below into an AI chat (ChatGPT, Claude, etc.)
2. Provide two things to the AI:
   - A layout JSON file for the AI to use as reference for key IDs
   - Some form of source of truth for shortcuts (ex. keybind config, cheatsheet text, etc.)

````markdown
You generate **Diagram** files for kbvr (kbvr.dev), a keyboard shortcut visualizer. Output ONLY raw JSON — no markdown fences, no commentary — so it can be saved directly as a `.json` file and imported.

After or during this message, you'll be given two inputs: a **Layout** (the physical keyboard/device the shortcuts are drawn on) and a **Source of truth** (where the shortcuts come from). Always base the key IDs you use on the given Layout — never assume a particular keyboard. You'll need to output a Layout file alongside the Diagram (see below) so those IDs are actually defined.

## Diagram object

- `name` (string, required)
- `description` (string, optional)
- `modes` (string[], optional) — only if shortcuts vary by mode (e.g. vim's normal/insert)
- `shortcuts` (Shortcut[], required, at least one)

Leave out `createdBy` and `intendedLayout` entirely — kbvr / user fills those in on import.

## Shortcut object

- `keys` (string[], required) — 1 to 5 key IDs, modifiers first, trigger key last; every ID must exist in the Layout file
- `description` (string[], required) — normally just one string; more than one only if the same key combo genuinely does two different things
- `tags` (string[], optional) — free-form grouping labels, e.g. app or category name
- `mode` (string, optional) — must exactly match one entry in the diagram's top-level `modes`

## Layout object

Always also output a matching **Layout** file, clearly labeled:

- `name` (string, required)
- `rows` (Key[][], required) — physical rows, top to bottom, left to right

Each `Key` is `{ "id": string | null, "label": string, "widthScale"?: number }`. `id` is `null` only for blank spacers (no label needed); every real key needs a unique `id` and a `label` (text shown on the keycap). `widthScale` is a multiplier where `1` is a standard key (Space ≈ `6.25`, Enter ≈ `2.25`, Shift ≈ `2.25`-`2.75`). Use short, lowercase, hyphenated IDs (e.g. `ctrl-left`, `bracket-right`, `arrow-up`), then reuse those exact IDs in the diagram's `shortcuts[].keys`.

## Example

```json
{
  "name": "VIM Key Bindings",
  "description": "Common VIM keybindings, grouped by mode",
  "modes": ["normal", "insert"],
  "shortcuts": [
    { "keys": ["h"], "description": ["Move cursor left"], "mode": "normal" },
    {
      "keys": ["shift-left", "g"],
      "description": ["Go to bottom of file"],
      "mode": "normal",
      "tags": ["navigation"]
    },
    {
      "keys": ["ctrl-left", "r"],
      "description": ["Redo"],
      "mode": "normal",
      "tags": ["editing"]
    }
  ]
}
```
````
