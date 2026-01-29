# md-pdf

Print-ready Markdown → PDF converter for Node.js with both CLI (`md2pdf`) and programmatic API. Supports themes, plugins (Mermaid, math, TOC, footnotes, frontmatter), Watch mode, multi-file/book builds, and Chromium or lite rendering.

## Install

```bash
pnpm add -D @n-teddy/md-pdf
# or
npm install --save-dev @n-teddy/md-pdf
```

## CLI

```bash
md2pdf input.md -o output.pdf
```

Key flags (see docs/v2 and docs/v3 for advanced usage):
- `--theme <name|path>`
- `--renderer chromium|lite`
- `--toc`, `--footnotes`, `--mermaid`, `--math`
- `--watch` for live rebuilds
- `book build` / `book preview` for V3 book-mode projects

## API

```ts
import { convertMarkdownToPdf } from "@n-teddy/md-pdf";

await convertMarkdownToPdf("# Hello", {
  output: "hello.pdf",
  renderer: "chromium",
  toc: true,
});
```

See `docs/` for architecture, plugins, themes, and book publishing guidance.

## Releasing

CI auto-runs on `main`; Changesets manages versions and publishes to npm when release PRs are merged.
