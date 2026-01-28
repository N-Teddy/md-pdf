# Implementation Plan

Assumptions
- Node.js >= 18
- Headless Chromium is allowed and required for print-ready output
- Offline mode is required (bundled fonts/assets; optional remote assets)

## Phase 2 Tasks (Repo Setup)
1) Initialize TypeScript tooling
   - Add `tsconfig.json` for Node 18 and ESM builds
   - Add `tsup.config.ts` for dual ESM/CJS library output and ESM CLI build

2) Package configuration
   - Update `package.json`:
     - `type: module`, exports map, bin entry
     - scripts: build, lint, format, test, typecheck
     - engines: node >= 18
   - Add MIT license

3) Linting and formatting
   - ESLint with @typescript-eslint
   - Prettier with shared config

4) Testing
   - Vitest for unit tests
   - Test folder structure and example test placeholder

5) CI plan (GitHub Actions)
   - Lint + typecheck + test + build
   - Cache pnpm store

6) Changesets (optional but recommended)
   - Configure changesets for versioning and changelog

7) Folder structure
   - Create `/src/cli`, `/src/core`, `/src/render`, `/src/themes`, `/src/utils`
   - Create `/examples`, `/tests`

## Phase 3 Preview (MVP Build)
- Implement markdown -> HTML pipeline using unified
- Integrate Shiki, Mermaid, KaTeX
- Implement HTML template with header/footer + optional cover
- Render via Playwright and print to PDF
- Add default theme + bundled fonts
- CLI and API wiring

