# CLI V2

## Commands
- `md2pdf <input> [options]`
- `md2pdf init` (scaffold config + theme)
- `md2pdf watch <input>` (watch & re-render)

## Key Flags
- `--out-dir <dir>`
- `--theme <name>` / `--theme-dir <path>`
- `--config <path>`
- `--watch`
- `--toc --footnotes --math --mermaid`
- `--renderer <chromium|lite>` (chromium default; lite used as fallback on chromium failure)
- `--allow-remote`

## Config Resolution
1) CLI flags
2) Config file (explicit)
3) Config file (auto-discovered)
4) Defaults

Config formats: `md2pdf.config.js`, `.cjs`, `.mjs`, `.json`, `.yaml`, `.yml`

## Examples
- Glob conversion:
  - `md2pdf docs/**/*.md --out-dir dist`
- Folder conversion:
  - `md2pdf ./docs --out-dir ./dist`
- Watch mode:
  - `md2pdf watch ./docs --out-dir ./dist`
- Custom theme:
  - `md2pdf report.md --theme-dir ./themes/report`
- Enable plugins:
  - `md2pdf report.md --toc --footnotes --math --mermaid`

## Exit Codes
- `0`: success
- `1`: usage error
- `2`: render error
- `4`: file not found

## UX Principles
- Clear error messages with file context
- Stable output paths for batch conversion
- Minimal surprises: defaults are safe and offline-first
