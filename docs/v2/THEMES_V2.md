# Themes V2

## Theme System Spec
- CSS variables for typography, colors, spacing
- Optional HTML templates for cover, header, footer
- Bundled fonts with explicit licensing and embedding rules

## Theme Folder Structure
```
my-theme/
  theme.css
  templates/
    cover.html
    header.html
    footer.html
  fonts/
    MyFont-Regular.ttf
    OFL.txt
```

## Custom Theme Flow
1) Create a theme folder with CSS + optional templates
2) Reference via CLI `--theme-dir` or config `theme.dir`
3) Override variables per document if needed

## Per-Document Overrides
- Accept a `themeOverrides` object in config/API
- Overrides map to CSS variables injected after theme CSS

## Fonts and Licensing
- Fonts must be licensed for embedding (OFL, Apache, or permissive)
- Include license file in theme fonts directory
- Avoid proprietary fonts unless explicitly licensed

