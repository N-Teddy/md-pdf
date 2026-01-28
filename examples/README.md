# Examples

Generate PDFs from the sample Markdown:

```bash
pnpm exec md2pdf ./examples/sample.md --out-dir ./examples/output --mermaid --math
```

If you want a cover page:

```bash
pnpm exec md2pdf ./examples/sample.md --out-dir ./examples/output --cover ./examples/cover.md --mermaid --math
```
