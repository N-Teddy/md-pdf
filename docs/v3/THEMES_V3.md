# Themes V3

## Theme Package Structure
- theme.css
- templates/
  - title.html
  - chapter.html
  - appendix.html
  - header.html
  - footer.html
- profiles/
  - a4.json
  - letter.json
  - book-6x9.json

## Advanced Layout Templates
- Named slots for title, author, chapter titles, running heads
- Optional per-section overrides via frontmatter

## Print Profiles
- Size, margins, columns, font stacks, line-height
- Validation ensures all required keys are present

## Font Embedding and Licensing
- Fonts must be embedded for reproducibility
- Only license-safe fonts allowed in default bundles

## Validation Rules
- Required CSS variables
- Required templates per profile
- Lint for unsupported CSS features
