# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a Vite + React + TypeScript app for "housework roulette" (家事ルーレット). The project currently
contains only the unmodified Vite template scaffold (`src/App.tsx` is still the default counter demo) — no
application logic, routing, or state management has been built yet. There is also no git repository
initialized in this directory. Treat any described "architecture" as the template's, not the final app's.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via `tsc -b` then produce a production build with Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured yet (no `test` script, no test framework installed).

## Tooling notes

- TypeScript project is split via project references: `tsconfig.json` references `tsconfig.app.json` (app
  source under `src/`) and `tsconfig.node.json` (Vite config). Run `tsc -b` (as `npm run build` does) rather
  than a plain `tsc` when type-checking, so both projects are covered.
- `tsconfig.app.json` enables strict-ish linting compiler options (`noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`) — unused locals/params will fail the build, not just lint.
- ESLint config (`eslint.config.js`) is flat-config style, extending `@eslint/js`, `typescript-eslint`
  recommended, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` (Vite preset). It only lints
  `**/*.{ts,tsx}`.
- Icons are loaded from `public/icons.svg` via `<use href="/icons.svg#...">` references rather than
  individually imported SVG components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
