# Publishing Features (V3)

## Book Mode
- `book.yaml` defines title, authors, parts, chapters, appendices
- Supports per-chapter templates and chapter metadata

## Page Break Control
- Markdown directives: `<!-- page-break -->`
- Section break directive for chapter starts
- Keep-with-next rules for headings

## Multi-Column Layout
- Basic column support per section or per template
- Columns are opt-in and validated per profile

## Cross-References
- `@ref(id)` syntax for anchors, figures, tables, sections
- Automatic link resolution and numbering

## Index + Bibliography
- Index terms via frontmatter or inline directives
- Bibliography via CSL/JSON
- V3.0: design + API, V3.1: generator implementation

## Section Templates
- Title page, chapter start, appendix start, back matter
- Per-section template overrides
