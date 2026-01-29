# V2 Overview

## What V2 Adds
V2 focuses on extensibility, higher-fidelity print output, and a more powerful CLI/API while keeping MVP compatibility where practical. It introduces a plugin system, a theme + template pipeline, deterministic rendering controls, and optional non-Chromium rendering for lightweight environments.

## Who It’s For
- Teams publishing long-form technical or business documents
- CI/CD pipelines that require repeatable, deterministic PDF output
- Users who need custom themes, headers/footers, and advanced Markdown features
- Users who cannot ship Chromium in some environments (serverless, minimal containers)

## MVP vs V2 Comparison

| Area | MVP | V2 |
| --- | --- | --- |
| Rendering | Chromium-only | Chromium default + lite fallback renderer |
| Extensibility | Limited options | Plugin API with lifecycle hooks |
| Markdown | GFM + Mermaid + KaTeX | TOC + footnotes + frontmatter + extensible plugins |
| Themes | CSS-only default theme | CSS + template system + per-doc overrides |
| CLI | Single file / glob / folder | Config, watch, init, batch pipelines |
| Determinism | Best-effort | Explicit pinning + asset hashing + cache strategy |
| QA | Basic | Golden tests + visual regression + cross-platform CI |

## Migration Notes
- MVP API remains available; V2 adds new options but preserves current defaults where possible.
- V2 introduces a config file format and plugin registration. Older configs remain valid; new fields are optional.
- Some security defaults may tighten (e.g., raw HTML or remote assets), with opt-in overrides.

## Feature Flags / Experimental Policy
- Experimental features are behind `experimental.*` options in config and API.
- Each experimental feature includes a versioned flag and changelog note.
- Experimental features can be changed or removed without semver guarantees until stabilized.
