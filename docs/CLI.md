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
- `--title <title>`: header title text
- `--no-page-numbers`: disable footer page numbers
- `--page-size <size>`: `A4`, `Letter`, or custom `widthxheight` (e.g. `8.5in x 11in`)
- `--margin <sizes>`: `top,right,bottom,left` (e.g. `1in,1in,1in,1in`)
- `--toc`: generate table of contents
- `--mermaid`: enable Mermaid rendering
- `--math`: enable KaTeX rendering
- `--allow-remote`: allow remote images and remote assets

Notes:

- Watch mode and config files are planned post-MVP.

## Exit Codes

- `0`: success
- `1`: usage error (invalid args)
- `2`: render error
- `4`: file not found
