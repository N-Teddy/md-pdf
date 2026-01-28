# Architecture

## High-Level Design

md-pdf uses a two-stage pipeline:

1. Markdown is parsed and converted to HTML with a well-defined AST transformation chain.
2. HTML is styled and rendered to PDF in headless Chromium.

This leverages browser-quality layout while keeping the transformation pipeline deterministic and themeable.

## Modules

- src/core
  - Input normalization, option validation, config resolution
  - Markdown parsing and HTML generation
- src/render
  - HTML template assembly (cover, body, header/footer)
  - Asset management (fonts, CSS, scripts)
  - Chromium print-to-PDF orchestration
- src/themes
  - Default theme CSS + fonts
  - Theme loader and custom theme merging
- src/cli
  - CLI parsing, glob expansion, batch conversion
- src/utils
  - Logging, path helpers, file IO, hashing

## Data Flow

Markdown -> MDAST -> HAST -> HTML -> Rendered HTML (CSS + JS) -> Chromium printToPDF -> PDF

Detailed flow:

1. Read Markdown input (file or string)
2. Parse to MDAST (remark)
3. Apply remark plugins (GFM, footnotes, math, mermaid)
4. Convert to HAST (rehype)
5. Apply rehype plugins (syntax highlight, KaTeX rendering, TOC)
6. Serialize to HTML and inject into template
7. Inject theme CSS, fonts, and offline assets
8. Load into Chromium, run diagram pre-render scripts, then print to PDF

## Plugin System Approach

- Plugin hooks at two points:
  - remarkPlugins: MDAST transforms
  - rehypePlugins: HAST transforms
- User can register additional plugins via config or API options.
- Custom template hooks allow extending the HTML shell for headers/footers or custom scripts.

## Error Handling and Logging

- Structured errors with codes (e.g., ERR_INVALID_INPUT, ERR_RENDER_TIMEOUT)
- Errors include context: input file, phase, and plugin name
- CLI reports user-friendly messages; API throws typed errors
- Logging levels: silent, info, debug
