# Stack

## Proposed Stack
- Markdown parsing: unified (remark)
  - remark-parse, remark-gfm, remark-frontmatter, remark-footnotes, remark-math
- HTML generation: remark-rehype + rehype-stringify
  - rehype-slug, rehype-autolink-headings, rehype-katex, rehype-highlight or shiki-based transform
- PDF generation: Playwright (Chromium) printToPDF
- Styling: CSS themes + HTML template
- Syntax highlighting: Shiki (inline styles, deterministic output)
- Diagrams: Mermaid (bundled mermaid.js, rendered in headless Chromium)
- Math: KaTeX (offline CSS + fonts bundled)

## Justification
- Print-ready output requires real browser layout, font shaping, and pagination controls. Chromium is the most reliable option for consistent, high-quality PDF output across platforms.
- unified (remark/rehype) provides a robust plugin ecosystem and fine-grained control over Markdown extensions (GFM, footnotes, math, TOC).
- Shiki produces consistent syntax highlighting by embedding styles directly into HTML.
- Mermaid and KaTeX can be rendered offline by bundling their assets with the package.

## Alternatives Considered
Markdown parsing
- markdown-it: faster and simpler but fewer AST transformations and weaker integration with rehype pipeline.

PDF generation
- pdfkit: portable and dependency-light but lacks HTML/CSS fidelity and advanced layout control.
- md-to-pdf (puppeteer-based): similar approach but limited extensibility and API control.

Syntax highlighting
- Prism/highlight.js: lighter runtime but less deterministic than Shiki.

## Tradeoffs Table

| Choice | Quality | Speed | Dependencies | Portability | Notes |
|-------|---------|-------|--------------|-------------|------|
| Playwright + Chromium | High | Medium | Heavy | Medium | Best layout fidelity, biggest install size |
| Puppeteer + Chromium | High | Medium | Heavy | Medium | Similar output, less cross-browser support |
| pdfkit | Medium-Low | Fast | Light | High | No HTML/CSS layout, limited print quality |
| markdown-it | Medium | Fast | Light | High | Fewer AST transforms, harder to extend |
| unified (remark/rehype) | High | Medium | Medium | High | Strong plugin ecosystem |
| Shiki | High | Medium | Medium | High | Deterministic, good theming |
| Prism/highlight.js | Medium | Fast | Light | High | Less consistent styling |

## Chromium Notes
- Headless Chromium adds significant install size (hundreds of MB depending on platform).
- CI must install Playwright browsers (`npx playwright install --with-deps`).
- Some Linux distros require additional system packages for Chromium to launch.

