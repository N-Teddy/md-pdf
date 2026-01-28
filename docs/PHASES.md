# Product Phases

## MVP (must ship)

Checklist

- [ ] CLI: `md2pdf <input.md> -o <output.pdf>`
- [ ] API: `convertMarkdownToPdf(input, options)`
- [ ] Default theme (print-ready typography, margins)
- [ ] Code blocks with syntax highlighting
- [ ] Images and links
- [ ] Cover page support
- [ ] Header/footer with page numbers
- [ ] Offline mode (no remote assets) with bundled fonts
- [ ] Deterministic output for the same input

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
