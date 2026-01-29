# Code Formatting (Chromium Only)

## Scope
- Applies only when renderer is `chromium`.
- Offline and deterministic by default.
- Formats fenced code blocks before HTML rendering.
- If formatting fails, the original code block is preserved.

## Language Support
Tier 1 (formatted via Prettier parsers)
- JavaScript/TypeScript (js, ts, jsx, tsx)
- JSON
- HTML
- CSS/SCSS
- Markdown
- YAML
- GraphQL

Tier 2 (no formatting; highlighted only)
- All other languages

## Defaults
- `formatCode: true` for chromium
- Prettier defaults with:
  - `useTabs: true`

## Theme by Language
Default per-language theme mapping (configurable):
- js, ts, jsx, tsx, json → `github-light`
- html → `light-plus`
- css, scss → `one-light`
- md → `min-light`
- yaml → `github-light`
- graphql → `light-plus`

## Config Example
```json
{
  "formatCode": true,
  "formatter": {
    "useTabs": true,
    "printWidth": 80
  },
  "themeByLanguage": {
    "ts": "github-light",
    "py": "nord"
  }
}
```

## Failure Behavior
- Any formatter error results in the original code block being used.
- Formatting failures never block PDF output.

