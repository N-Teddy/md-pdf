# V2 Architecture

## High-Level Design
V2 keeps the core Markdown → HTML → PDF pipeline but introduces a plugin system and an asset pipeline that can target multiple renderers (Chromium or non-Chromium). The pipeline is deterministic by design, with pinned renderer versions and normalized assets.

## Module Boundaries and Extension Points
- core/
  - Option resolution, config loading, plugin registry
- markdown/
  - Unified pipeline, plugin hooks for AST transforms
- render/
  - Renderer abstraction: ChromiumRenderer, LiteRenderer
- themes/
  - Theme loader, template system, font resolver
- assets/
  - Asset resolution, caching, hashing, offline rules
- cli/
  - Command parsing, watch pipeline, batch execution

## Data Flow
Markdown → MDAST → HAST → HTML → Layout (templates + CSS) → Renderer → PDF

## Asset Pipeline
- Resolve local/remote assets
- Apply offline policy
- Cache remote assets (optional) with content hashing
- Normalize URLs to file:// paths for deterministic rendering

## Determinism Strategy
- Pin renderer versions (Chromium/Playwright) in package.json
- Pin Shiki, Mermaid, KaTeX versions
- Normalize timezone, locale, and deviceScaleFactor
- Content-hash remote assets and store in cache
- Stable ordering for batch inputs

## Renderer Abstraction
- ChromiumRenderer: full-fidelity, print-ready output
- LiteRenderer: non-Chromium option for restricted environments (lower fidelity)

