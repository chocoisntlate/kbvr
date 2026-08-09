# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Next.js)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config: eslint.config.mjs)
```

The user runs `npm run dev` themselves to manually verify changes in the browser — don't start the dev server on their behalf. Verify changes with `npm run lint` (and `npm run build` when relevant). After making changes, run `npx prettier --write .`.
