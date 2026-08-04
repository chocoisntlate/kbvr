import { Diagram } from "@/features/spec/diagramSchema";

export const INTRODUCTION_DIAGRAM: Diagram = {
  name: "Default Introduction Diagram",
  description: "Hover over keys to learn about kbvr",
  intendedLayout: { name: "QWERTY US 80%", fingerprint: "1ynpbrt" },
  shortcuts: [
    {
      keys: ["ctrl-left", "w"],
      description: ["Close Tab"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "tab"],
      description: ["Next Tab"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "n"],
      description: ["New Window"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "f"],
      description: ["Find"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "r"],
      description: ["Refresh"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "l"],
      description: ["Address Bar"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "p"],
      description: ["Print"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "s"],
      description: ["Save"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "a"],
      description: ["Select All"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "c"],
      description: ["Copy"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "v"],
      description: ["Paste"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "x"],
      description: ["Cut"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "z"],
      description: ["Undo"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "equals"],
      description: ["Zoom In"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "minus"],
      description: ["Zoom Out"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "0"],
      description: ["Reset Zoom"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "d"],
      description: ["Bookmark"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "shift-left", "n"],
      description: ["Incognito"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "shift-left", "tab"],
      description: ["Previous Tab"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "shift-left", "b"],
      description: ["Bookmarks Bar"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "shift-left", "delete"],
      description: ["Clear Data"],
      tags: ["google chrome"],
    },
    {
      keys: ["ctrl-left", "shift-left", "i"],
      description: ["DevTools"],
      tags: ["google chrome"],
    },
    {
      keys: ["i"],
      description: ["Toggle Inspect mode"],
      tags: ["kbvr"],
    },
    {
      keys: ["esc"],
      description: ["Clear pressed keys, or close the mode menu"],
      tags: ["kbvr"],
    },
    {
      keys: ["s"],
      description: ["Jump into the search bar"],
      tags: ["kbvr"],
    },
    {
      keys: ["slash"],
      description: ["Toggle the search bar"],
      tags: ["kbvr"],
    },
    {
      keys: ["m"],
      description: ["Open the mode menu"],
      tags: ["kbvr"],
    },
    {
      keys: ["j"],
      description: ["Toggle the JSON editor"],
      tags: ["kbvr"],
    },
    {
      keys: ["ctrl-left"],
      description: ["Click me"],
    },
    {
      keys: ["1"],
      description: ["👋 Hello!"],
      tags: ["tutorial"],
    },
    {
      keys: ["ctrl-left", "shift-left"],
      description: ["Click me"],
    },
    {
      keys: ["2"],
      description: [
        "❓ kbvr is an interactive key-bind visualizer, editor, and library",
      ],
      tags: ["tutorial"],
    },
    {
      keys: ["3"],
      description: [
        "↙️ Try clicking the bottom-left 'Ctrl' key to see some Google Chrome shortcuts",
      ],
      tags: ["tutorial"],
    },
    {
      keys: ["4"],
      description: [
        'ℹ️ "Diagrams" are groups of related key-binds that are displayed on a supported keyboard "Layout".',
      ],
      tags: ["tutorial"],
    },
    {
      keys: ["5"],
      description: [
        "👓 Descriptions are revealed when they are within one key press of completion.",
      ],
      tags: ["tutorial"],
    },
    {
      keys: ["6"],
      description: [
        "🗨️ Key-binds with multiple descriptions look like this",
        "Useful for conflicting key-binds",
      ],
      tags: ["tutorial"],
    },
    {
      keys: ["7"],
      description: [
        '🔎 "Inspect Keys" lets you view all descriptions for each key and serves as the main interface for editing key-binds.',
      ],
      tags: ["tutorial"],
    },
  ],
};
