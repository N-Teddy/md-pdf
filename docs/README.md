# md-pdf

## Overview

md-pdf is a production-grade Node.js package that converts Markdown to high-quality, print-ready PDF using a deterministic, themeable rendering pipeline. It ships as both a CLI tool and a programmatic API.

## Setup

- Install Playwright browsers (required for rendering): `npx playwright install --with-deps`
- Offline mode blocks remote assets by default; enable with `--allow-remote` or `allowRemote: true`.

## Key Features

MVP

- Markdown to PDF with consistent typography, margins, and spacing
- Headings, lists, tables, blockquotes, links
- Code blocks with syntax highlighting
- Images (local and remote; remote can be disallowed for offline mode)
- Optional cover page
- Header and footer with page numbers and title
- Theme support (default theme + custom themes)

Roadmap

- Multiple built-in themes
- Per-document theme overrides
- Table of contents and section numbering
- Advanced pagination control (widow/orphan handling)
- PDF/A output mode
- Faster incremental builds in watch mode

## Examples

CLI

- Convert one file to a PDF
  - `md2pdf README.md -o README.pdf`
- Convert a folder to PDFs
  - `md2pdf docs/**/*.md --out-dir dist/pdfs`
- Use a custom theme and add a cover
  - `md2pdf report.md --theme-file ./themes/report.css --cover ./cover.md`

API

```ts
import { convertMarkdownToPdf } from "md-pdf";

await convertMarkdownToPdf({
	inputPath: "./notes.md",
	outputPath: "./notes.pdf",
	theme: "default",
	header: { title: "Notes" },
	footer: { pageNumbers: true }
});
```

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs, emphasis, strong
- Ordered and unordered lists
- Tables (GFM)
- Blockquotes
- Inline and fenced code blocks with syntax highlighting
- Links
- Images (local and remote)
- Footnotes
- Mermaid diagrams
- Math (KaTeX)
- Table of contents (optional)

## Offline Operation

- Fully offline mode is supported.
- Default theme fonts are bundled in the package.
- Remote images can be disabled for strict offline builds.
