# V3 Release Plan

## Versioning
- SemVer
- V3.0 introduces new features without breaking V2 defaults

## Migration Guide
- Existing CLI/API flows remain valid
- New features opt-in via book config and profiles

## Changelog Strategy
- Keepers: features, fixes, deprecations
- Note renderer changes explicitly

## Publishing Checklist
- [ ] All V3 docs updated
- [ ] Golden tests updated
- [ ] Cross-platform CI green
- [ ] Lockfile and renderer versions pinned
- [ ] Smoke test on examples/v3

## Smoke Tests
- `md2pdf render examples/v3/academic-paper.md -o /tmp/paper.pdf`
- `md2pdf book build --config examples/v3/book/book.yaml --profile a4 -o /tmp/book.pdf`
- `md2pdf render examples/v3/accessibility.md -o /tmp/access.pdf`
