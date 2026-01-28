# Product Phases

## MVP (must ship)

Checklist

- [x] CLI: `md2pdf <input.md> -o <output.pdf>`
- [x] API: `convertMarkdownToPdf(input, options)`
- [x] Default theme (print-ready typography, margins)
- [x] Code blocks with syntax highlighting
- [x] Images and links
- [x] Cover page support
- [x] Header/footer with page numbers
- [x] Offline mode (no remote assets) with bundled fonts
- [x] Deterministic output for the same input

## Post-MVP (nice-to-have)

Checklist

- [ ] Multiple built-in themes
- [ ] Watch mode for local development
- [ ] TOC generation with section numbering
- [ ] Per-document theme overrides
- [ ] Improved error messages and diagnostics
- [ ] Performance optimizations and caching

## V2 (advanced)

Checklist

- [ ] PDF/A and archival modes
- [ ] Advanced pagination control (widows/orphans)
- [ ] Layout regions (multi-column, floats)
- [ ] Plugin marketplace and theme gallery
- [ ] Incremental rendering for large docs

## Phase 4 (QA + Release Prep)

Checklist

- [x] docs/TESTING.md created
- [x] docs/RELEASE.md created
