# V3 Architecture

## Platform Design
V3 formalizes a pipeline-oriented architecture with explicit stages and extension points:
1) Parse (Markdown → AST)
2) Transform (AST → layout-aware HTML)
3) Layout (HTML → paginated view model)
4) Render (view model → PDF)
5) Post-process (metadata, optimization, accessibility)

## Rendering Pipeline
Markdown → MDAST → (Plugins) → HAST → Layout Engine → PDF Renderer

- Layout Engine: adds pagination primitives, page breaks, section templates, running headers/footers.
- Renderer: Chromium-based, with a compatibility layer for print profiles.

## Plugin Ecosystem Architecture
- Core pipeline exposes lifecycle hooks: pre-parse, post-parse, pre-render, post-render.
- V3 adds layout hooks (pre-layout, post-layout) and asset hooks (resolve/transform).
- Compatibility is enforced by a plugin manifest (name, version, engine range, capabilities).

## Theme + Layout Template Engine
- Themes are versioned packages with:
  - `theme.css`
  - `templates/` (title, chapter, appendix, running header/footer)
  - `profiles/` (A4, Letter, book sizes)
- Template engine uses strict data bindings (no arbitrary JS).
- Validation checks required CSS variables and template slots.

## Asset Management and Caching
- Asset pipeline resolves local assets to file URLs and vendored paths.
- `md2pdf.lock` records versions, asset hashes, and renderer build ID.
- Offline builds use vendored assets only (default).

## Deterministic Builds
- Pin rendering engine version and theme packages.
- Normalize timestamps, locale, fonts, and line-break settings.
- Stable asset resolution and consistent image scaling.

## Security Model
- Default sanitization for raw HTML.
- Plugin sandboxing (worker threads + restricted IO) planned.
- Configurable allowlist for file access.
