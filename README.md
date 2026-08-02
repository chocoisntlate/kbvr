# [keybind-viewer](https://kbvr.dev/)

Interactive keyboard shortcut visualization tool. Create, view, import, and export [Diagrams](#diagram) and [Layouts](#layout).

## Diagram

A **Diagram** defines a collection of keyboard shortcuts and their metadata.

It is represented as a JSON object with the following structure.

### Example

```json
{
  "name": "Google Chrome Shortcuts",
  "description": "Common keyboard shortcuts for Google Chrome",
  "shortcuts": [
    {
      "keys": ["ctrl-left", "t"],
      "description": ["Open a new tab"],
      "tags": ["tab", "navigation"]
    },
    {
      "keys": ["ctrl-left", "w"],
      "description": ["Close current tab"],
      "tags": ["tab"]
    },
    {
      "keys": ["ctrl-left", "shift-left", "t"],
      "description": ["Reopen last closed tab"],
      "tags": ["tab", "history"]
    },
    {
      "keys": ["ctrl-left", "l"],
      "description": ["Focus address bar"],
      "tags": ["navigation"]
    },
    {
      "keys": ["ctrl-left", "shift-left", "n"],
      "description": ["Open new incognito window"],
      "tags": ["window", "privacy"]
    }
  ]
}
```

### Diagram Structure

| Field         | Type       | Required | Description                                                                               |
| ------------- | ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `name`        | string     | yes      | Diagram name                                                                              |
| `description` | string     | no       | Diagram description                                                                       |
| `createdBy`   | string     | no       | Author of diagram                                                                         |
| `modes`       | string[]   | no       | Declared shortcut modes (e.g. `["normal", "insert"]`); shown as the mode-switcher options |
| `shortcuts`   | Shortcut[] | yes      | List of shortcuts                                                                         |

### Shortcut Structure

| Field         | Type     | Required | Description                                                      |
| ------------- | -------- | -------- | ---------------------------------------------------------------- |
| `keys`        | string[] | yes      | Key combination to trigger                                       |
| `description` | string[] | yes      | One or more descriptions (for conflicts)                         |
| `tags`        | string[] | no       | For grouping and filtering                                       |
| `mode`        | string   | no       | Which of the diagram's declared `modes` this shortcut belongs to |

The physical key a description renders on is not stored — it's inferred as the last element of `keys`.

## Layout

A **Layout** defines the physical structure of a keyboard.  
It describes keys arranged in rows and is used to render diagrams accurately.

It is represented as a JSON object.

### Example

```json
{
  "name": "QWERTY US 80%",
  "description": "Exclusion of numpad and some navigation keys from a standard full-size keyboard.",
  "rows": [
    // Top row
    [
      { "id": "esc", "label": "Esc" },
      { "id": null, "label": "", "widthScale": 1 },

      { "id": "f1", "label": "F1" },
      { "id": "f2", "label": "F2" },
      { "id": "f3", "label": "F3" },
      { "id": "f4", "label": "F4" },

      { "id": null, "label": "", "widthScale": 0.5 },

      { "id": "f5", "label": "F5" },
      { "id": "f6", "label": "F6" },
      { "id": "f7", "label": "F7" },
      { "id": "f8", "label": "F8" },

      { "id": null, "label": "", "widthScale": 0.5 },

      { "id": "f9", "label": "F9" },
      { "id": "f10", "label": "F10" },
      { "id": "f11", "label": "F11" },
      { "id": "f12", "label": "F12" },

      { "id": null, "label": "", "widthScale": 0.25 },

      { "id": "print", "label": "PrtSc" },
      { "id": "scroll", "label": "ScrLk" },
      { "id": "pause", "label": "Pause" }
    ]

    // ...
  ]
}
```

### Layout Structure

| Field         | Type     | Required | Description                   |
| ------------- | -------- | -------- | ----------------------------- |
| `name`        | string   | yes      | Layout name                   |
| `description` | string   | no       | Layout description            |
| `rows`        | KeyRow[] | yes      | Keyboard rows (top to bottom) |

### KeyRow Structure

A **KeyRow** is an ordered array of keys.

| Type    | Required | Description                  |
| ------- | -------- | ---------------------------- |
| `Key[]` | yes      | One keyboard row (min 1 key) |

### Key Structure

| Field        | Type           | Required | Description                                          |
| ------------ | -------------- | -------- | ---------------------------------------------------- |
| `id`         | string \| null | no       | Optional unique key identifier                       |
| `label`      | string         | yes      | Text shown on the key                                |
| `widthScale` | number         | no       | Width multiplier for larger keys (e.g. Shift, Space) |
