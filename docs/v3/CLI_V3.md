# CLI V3

## Book Build Commands
- `md2pdf book build --config book.yaml`
- `md2pdf book preview --config book.yaml`

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
