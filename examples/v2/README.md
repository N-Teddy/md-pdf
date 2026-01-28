# V2 Examples

Generate a V2 PDF using the Chromium renderer:

```bash
node dist/cli/index.js ./examples/v2/sample.md --out-dir ./examples/output --toc --footnotes --mermaid --math --frontmatter
```

Generate a V2 PDF using the Lite renderer:

```bash
node dist/cli/index.js ./examples/v2/sample.md --out-dir ./examples/output --renderer lite
```
