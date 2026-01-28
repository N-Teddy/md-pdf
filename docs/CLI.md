# CLI

## Command

`md2pdf [input] [options]`

## Inputs

- Single file: `md2pdf README.md`
- Glob: `md2pdf docs/**/*.md`
- Folder: `md2pdf ./docs --out-dir ./dist`

## Options

- `-o, --output <file>`: output PDF file (single input only)
- `--out-dir <dir>`: output directory for batch conversion
- `--theme <name>`: built-in theme name (default: `default`)
- `--theme-file <path>`: path to custom CSS theme
- `--cover <path>`: Markdown file used as cover page
- `--header <path>`: HTML or Markdown snippet for header
- `--footer <path>`: HTML or Markdown snippet for footer
- `--page-size <size>`: `A4`, `Letter`, or custom `widthxheight` (e.g. `8.5in x 11in`)
- `--margin <sizes>`: `top,right,bottom,left` (e.g. `1in,1in,1in,1in`)
- `--toc`: generate table of contents
- `--mermaid`: enable Mermaid rendering
- `--math`: enable KaTeX rendering
- `--no-remote`: disallow remote images and remote assets
- `--base-dir <dir>`: base directory for resolving relative assets
- `--watch`: watch input files and re-render on changes
- `--config <path>`: config file path (overrides auto-discovery)
- `--quiet`: minimal output
- `--verbose`: debug output

## Config File

Supported names (auto-discovered in CWD):

- `md2pdf.config.js`
- `md2pdf.config.cjs`
- `md2pdf.config.mjs`
- `md2pdf.config.json`
- `md2pdf.config.ts` (requires runtime TS loader)

Example `md2pdf.config.js`:

```js
export default {
	theme: "default",
	pageSize: "A4",
	margin: "1in,1in,1in,1in",
	toc: true,
	mermaid: true,
	math: true,
	allowRemote: false,
	header: { title: "My Document" },
	footer: { pageNumbers: true }
};
```

## Exit Codes

- `0`: success
- `1`: usage error (invalid args)
- `2`: render error
- `3`: config error
- `4`: file not found
