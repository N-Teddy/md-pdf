# V2 Implementation Plan

Assumed approvals
- Node >= 20 LTS
- Renderer abstraction (Chromium default + Lite renderer)
- Plugin API with lifecycle hooks
- Theme system with templates + per-doc overrides

## Step-by-step TODO

### 1) Repo Structure Updates
- Add `src/renderers/` with `chromium.ts`, `lite.ts`, and `index.ts`
- Add `src/plugins/` for built-in plugins and plugin registry
- Add `src/config/` for config loading and validation
- Add `src/assets/` for asset resolution + caching
- Add `src/themes/templates/` for default templates

Acceptance criteria
- Build passes with new folders and entry points
- No breaking changes to current API

### 2) Plugin System (Core)
- Define `MdPdfPlugin` types and plugin registry
- Add lifecycle hook execution order
- Add built-in plugins: toc, footnotes, frontmatter, mermaid, math

Acceptance criteria
- Plugins can modify markdown, AST, HTML, and PDF
- Plugin order is deterministic and documented

### 3) Renderer Abstraction
- Create `Renderer` interface
- Implement `ChromiumRenderer` using Playwright (existing pipeline)
- Implement `LiteRenderer` (e.g., HTML→PDF via pdfkit or a simpler renderer)

Acceptance criteria
- Renderer can be selected via CLI/API
- Output is generated for both renderers

### 4) Theming V2
- Add template system (cover/header/footer)
- Add per-document overrides mapped to CSS variables
- Document theme package structure

Acceptance criteria
- Theme templates render in both renderers
- Custom theme folder loads correctly

### 5) Config + CLI UX
- Add config resolution and schema validation (json/yaml/js)
- Add `md2pdf init` (scaffold config + theme)
- Add `md2pdf watch` (rebuild on changes)

Acceptance criteria
- CLI flags override config
- Watch mode supports multiple inputs

### 6) Determinism + Assets
- Implement asset cache directory with hashing
- Add remote asset opt-in and pinning
- Normalize locale/timezone, font loading

Acceptance criteria
- Same input yields identical output on same renderer version
- Cache is used for remote assets

### 7) QA and CI
- Add golden file tests for sample fixtures
- Add visual regression testing (optional in CI)
- Expand CI matrix (Node 20/22, Linux/macOS)

Acceptance criteria
- CI runs unit + integration + build
- Golden tests run in a stable environment

## Repo Changes
- Update `package.json` exports/types for new modules
- Add new dependencies for YAML config (e.g., `yaml`)
- Possibly add a lightweight PDF renderer dependency

## Backward Compatibility
- Keep `convertMarkdownToPdf` as main entry
- Add new fields to options; old fields remain valid
- Log deprecation warnings for renamed fields (if any)

## Milestones

### M1: Plugin system + renderer abstraction
- Plugin registry in place
- Renderer interface implemented

### M2: Themes V2 + config + CLI
- Template-based theming
- Config system and CLI commands

### M3: Determinism + QA
- Asset caching + pinning
- Golden tests + CI matrix

