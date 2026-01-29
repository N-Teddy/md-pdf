# CLI V3

## Book Build Commands
- `md2pdf book build --config book.yaml`
- `md2pdf book preview --config book.yaml`

## Examples
- Build a book with a profile:
  `md2pdf book build --config examples/v3/book/book.yaml --profile a4 --output ./dist/book.pdf`
- Preview/watch a book:
  `md2pdf book preview --config examples/v3/book/book.yaml --profile book-6x9`
- Require Chromium for CI:
  `md2pdf book build --config book.yaml --require-chromium`
## Pipeline Workflows
- `md2pdf render` for single or batch documents
- `md2pdf watch` for incremental rebuilds

## Preview Server
- Live reload for HTML + PDF preview
- Optional asset caching

## Build Profiles
- `--profile a4` / `--profile letter` / `--profile book-6x9`
- Profile defaults can be overridden per chapter

## Config Inheritance
- Root config → profile config → chapter frontmatter

## CI-friendly Usage
- `--require-chromium` to fail fast
- `--offline` to disable network
- `--deterministic` to enforce pinned outputs

## Exit Codes
- 0: success
- 1: invalid input
- 2: renderer failure
- 3: asset resolution failure
- 4: config error
