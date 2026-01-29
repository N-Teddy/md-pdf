# V3 Overview

## Vision
V3 evolves md-pdf into a professional document publishing engine for long-form, print-ready deliverables while preserving the CLI + Node API.

## Runtime Targets
- Node.js 20+ only (current LTS and newer)

## Renderer Strategy
- Primary: Chromium (print-ready fidelity)
- Fallback: Lite renderer for restricted environments
- Evaluation in V3.1: secondary high-fidelity renderer

## Publishing-Grade Definition
- Books, manuals, academic/technical papers, and enterprise documentation
- Layout fidelity with section templates, running headers/footers, and print profiles

## Target Users
- Publishers of books, manuals, and technical guides
- Enterprises with repeatable compliance-ready publishing workflows
- Technical writers and doc teams producing long-form PDFs

## MVP vs V2 vs V3 (Summary)
| Capability | MVP | V2 | V3 |
|---|---|---|---|
| CLI + API | ✅ | ✅ | ✅ |
| Themes (CSS + fonts) | ✅ | ✅ | ✅ (advanced templates + print profiles) |
| Plugin system | ❌ | ✅ | ✅ (registry + compatibility policy) |
| TOC/footnotes/frontmatter | ❌ | ✅ | ✅ |
| Mermaid/math | ❌ | ✅ | ✅ |
| Book mode | ❌ | ❌ | ✅ |
| Page layout control | ❌ | ❌ | ✅ |
| Cross-references | ❌ | ❌ | ✅ |
| Accessibility (PDF/UA) | ❌ | ❌ | ⚠️ phased |
| i18n (RTL/CJK/hyphenation) | ❌ | ❌ | ✅ (phased) |
| Deterministic build profiles | ⚠️ basic | ✅ | ✅ (strict, pinned) |
| Registry / marketplace model | ❌ | ❌ | ✅ (curated registry) |

## V3.0 Scope (Proposed)
- Book mode with chapters/parts/appendices
- Page break controls and section templates
- Running headers/footers and chapter-specific styling
- Cross-references + anchors
- Advanced theme system with print profiles and validation
- CLI build pipelines, preview server, and CI-friendly flags
- Deterministic builds: pinned renderer + asset lockfile
- i18n: RTL + CJK font fallback (hyphenation via plugin)
- Accessibility baseline: semantic HTML, alt text enforcement, bookmarks
- Offline by default with asset vendoring

## Migration Notes
- No breaking changes required for basic CLI/API usage.
- New V3 features are opt-in through config/profile files.
- Deprecations will be announced with ≥2 minor releases lead time.

## Feature Flags / Experimental Policy
- Experimental features use `--experimental-*` flags and config equivalents.
- Any experimental output is labeled in metadata.
- Experimental defaults are OFF.

## Long-Term Roadmap
- V3.1: full PDF/UA validation toolchain; bibliography/index generator
- V3.2: layout engine optimization for multi-column and floats
- V4: optional native rendering backend for server-side performance
