# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

kbvr is a Next.js (App Router) app for creating, viewing, importing, and exporting interactive keyboard shortcut visualizations ("Diagrams" overlaid on keyboard "Layouts"). Preview: https://kbvr.dev/

## Commands

```bash
npm run dev      # start dev server (Next.js)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config: eslint.config.mjs)
```

There is no test suite configured in this repo currently.

The user runs `npm run dev` themselves to manually verify changes in the browser — don't start the dev server on their behalf. Verify changes with `npm run lint` (and `npm run build` when relevant). After making changes, run `npx prettier --write .`.

## Core domain model

The app revolves around two independent JSON documents, both validated with Zod schemas in `features/spec/`:

- **Diagram** (`features/spec/diagramSchema.ts`) — a set of `Shortcut`s, plus an optional `modes: string[]` declaring the diagram's shortcut modes (e.g. `["normal", "insert"]` for a VIM-style diagram — see `examples/vim.diagram.ts`). Each shortcut has `keys` (up to 5 key IDs), one or more `description`s (multiple = conflicting keybinds on the same trigger), and optional `tags`/`mode` (which of the diagram's declared `modes` it belongs to). The physical key a description renders on (the "display key") is not stored — it's derived as the last element of `keys` via `getDisplayKey()` (`features/diagram/shortcut.ts`).
- **Layout** (`features/spec/layoutSchema.ts`) — the physical keyboard: `rows` of `Key`s, each with an `id` (or `null` for a spacer), `label`, and optional `widthScale` for wide keys (Shift, Space, etc.).

A Diagram and Layout are matched at render time purely by `Key.id` <-> `Shortcut.keys` string equality (the display key being the last element) — there is no foreign-key enforcement beyond what `getValidKeyIds()` checks during editing. See `README.md` for the full field-level spec and JSON examples.

Default/example data lives in `examples/` (`default.diagram.ts`, `default.layout.ts`, `us-qwerty.ts`) and seeds `KeyboardContextProvider`'s initial state.

## Architecture

State is centralized in a single React context, `KeyboardContext` (`features/keyboard/KeyboardContext.tsx`), which holds `keyDiagram`, `keyLayout`, and `isInspectMode`. Nearly every component reads/writes through `useKeyboard()`. There is no external state library.

Feature folders under `features/`:

- `keyboard/` — renders the keyboard grid (`Keyboard.tsx`, `Key.tsx`) and owns the shared context. `Keyboard.tsx` computes per-key rendered widths (`addGapCompensation`) and builds a map keyed by each shortcut's derived display key (via `getDisplayKey()`) each render. `description.ts` (`getKeyDescription`) contains the logic for matching the currently pressed key combo (as tracked in `pressedKeys` state) against candidate shortcuts to decide which description to surface, including "one modifier short" partial matches. `HoverTooltip.tsx` is the shared dark hover-bubble component (fades in via `group-hover`, requires `relative group` on the trigger) used by `Key.tsx`'s conflict tooltip and reused by `display/ButtonsBar.tsx`'s button hints.
- `display/` — the info/metadata panel (`InfoDisplay.tsx`, `MetadataCard.tsx`) and JSON import/export (`ImportExport.tsx`, generic `ImportExportButton<T>` that round-trips a context setter through file input / Blob download) and the button bar (`ButtonsBar.tsx`) — Inspect Keys toggle, Search toggle (search is visible by default; `s` focuses the search input, `/` toggles the bar itself), Reset Pressed Keys, and a custom mode menu (button + dropdown, not a native `<select>` — needed to render per-mode number badges) that sets `activeMode` in `KeyboardUIContext`, filtering which shortcuts `Keyboard.tsx`/`SearchBar.tsx` show. The mode trigger always renders — even for diagrams without declared `modes` it just shows "All modes" — `m` opens it (seeding a roving highlight on the current mode), and while open Up/Down/Enter/Escape navigate/select/close, with a document-level click-outside listener also closing it. `activeMode` is a distinct concept from `isInspectMode` — one picks a shortcut-mode filter, the other toggles the editing UI. `ButtonsBar.tsx` owns a single global hotkey listener (guarded against typing targets/modifiers): `i` toggles Inspect mode from anywhere, `Escape` clears `pressedKeys` (mirroring the Reset button, or closes the mode menu if it's open) when not inspecting, `0`-`9` jump `activeMode` directly to the Nth declared mode (`0` = "All modes", matching the number badges shown in the open mode menu), and `/` toggles search visibility.
- `inspect/` — the "Inspect Keys" editing modal (`InspectKey.tsx`) for editing all shortcuts bound to a given key. Split into small single-purpose hooks in `inspect/hooks/`: `useShortcutDraft` (in-memory draft array in human-editable string form), `useShortcutErrors` (per-row validation errors, keyed by index, with index-shifting on delete), `useEditMode` (edit/collapse state), `useScrollToRow` (scroll+focus a row by index), `useSaveShortcuts` (runs validation and commits valid rows back into `keyDiagram` via `setKeyDiagram`).
- `diagram/shortcut.ts` — the boundary between the human-editable form representation (`EditableShortcut`: space/comma-separated strings) and the validated domain type (`Shortcut`). `normalizeShortcut()` parses the string form; `validateShortcut()` checks key IDs exist in the current layout (`getValidKeyIds`), rejects duplicate keybinds with the same key set, then runs `ShortcutSchema.safeParse`. `getDisplayKey()` derives the display key from a shortcut's `keys`.
- `spec/` — Zod schemas and inferred types (`Diagram`, `Shortcut`, `Layout`), the source of truth for both domain types and runtime validation of imported JSON.
- `navbar/` — top-level nav bar.

Two interaction modes driven by `isInspectMode`:

1. **Normal mode** — clicking a key toggles it in/out of `pressedKeys`; `Key.tsx` shows the matched shortcut description and a tooltip listing all descriptions if there's a conflict.
2. **Inspect mode** — clicking a key opens `InspectModal` to view/add/edit/delete shortcuts whose derived display key matches that key.

## Supabase

`utils/supabase/{client,server,middleware}.ts` provide Supabase SSR clients (browser, server component, middleware) reading `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` from env. `utils/supabase/config.ts` exposes `isSupabaseConfigured()`, used to skip Supabase calls gracefully when env vars are missing.

Google OAuth login/logout is wired up: `proxy.ts` (using `utils/supabase/middleware.ts`) refreshes the session cookie on every request, `app/layout.tsx` fetches the current user server-side and passes it into `features/auth/AuthContext.tsx`'s `AuthProvider` (wrapping the whole app), and `features/navbar/Navbar.tsx` renders "Sign in with Google" (`features/auth/signInWithGoogle.ts`) or the signed-in user + "Sign out" depending on auth state. `app/auth/callback/route.ts` handles the OAuth redirect back from Google. All of these calls are guarded to fail open (continue signed out) rather than crash the app if Supabase is unreachable or misconfigured.

There is no data-persistence feature — diagrams/layouts are only ever loaded/saved via the existing local file Import/Export (`features/display/ImportExport.tsx`), not stored in Supabase.

## Styling

Tailwind CSS v4 (via `@tailwindcss/postcss`), utility classes only, no CSS modules. Prettier formats with its default settings (`.prettierrc` is empty, meaning defaults).
