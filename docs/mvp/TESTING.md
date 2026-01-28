# Testing

## Goals
- Verify correctness of markdown -> HTML transformations
- Ensure deterministic PDF output under offline mode
- Catch rendering regressions in typography, layout, and diagrams

## Test Types

### Unit Tests (fast)
- Markdown pipeline
  - GFM tables, footnotes, links, images
  - Mermaid blocks converted to .mermaid div
  - KaTeX rendering enabled/disabled
- Asset resolution
  - Local image paths -> file URLs
  - Remote assets blocked when allowRemote=false
- Theme loading
  - Built-in theme CSS loads and font URLs resolve

### Integration Tests (rendering)
- Render sample markdown to PDF using Playwright
- Validate:
  - PDF file created
  - Non-zero size
  - Page count meets expectations (approx)

### Golden-File Tests (if feasible)
- Generate PDFs from canonical fixtures under stable environment
- Store and compare with pixel or text extraction deltas
- Suggested approach:
  - Use Playwright to render to PDF
  - Extract text via pdfjs or similar
  - Compare against stored snapshot text

### Rendering Regression Strategy
- Keep fixed test fixtures in /examples or /tests/fixtures
- Use deterministic settings:
  - timezoneId: UTC
  - deviceScaleFactor: 1
  - fixed fonts bundled with package
  - consistent Playwright/Chromium version

## Performance Notes
- Chromium startup dominates runtime for small files
- Batch conversion should reuse the same browser context (future improvement)
- Large documents may require increased timeout

