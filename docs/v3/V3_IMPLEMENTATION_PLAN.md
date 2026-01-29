# V3 Implementation Plan

## Goals
- Deliver V3.0 publishing engine features with minimal breaking changes
- Preserve CLI + API while adding book mode and layout control
- Establish deterministic, offline-first builds

## Step-by-Step TODO
1) Core refactor
   - Introduce layout stage and layout hooks
   - Add section template resolver and print profile loader
   - Add book project loader (`book.yaml`)

2) Book mode
   - Chapter/part/appendix support
   - Chapter-level frontmatter overrides
   - Running headers/footers per section

3) Layout controls
   - Page break directives and keep-with-next rules
   - Multi-column per section/profile
   - Cross-reference resolution and anchor registry

4) Themes + profiles
   - Theme package validation
   - Profile inheritance and override rules
   - Print profile presets (A4, Letter, book sizes)

5) Determinism + offline
   - Asset vendoring and lockfile (`md2pdf.lock`)
   - Renderer pinning and normalization
   - CI-friendly reproducible build mode

6) CLI + DX
   - Book build commands + preview server
   - Pipeline workflow commands
   - New flags: `--profile`, `--book`, `--deterministic`, `--offline`

7) Accessibility + i18n
   - RTL and CJK font fallback
   - Alt text enforcement warnings
   - Bookmarks and outlines

8) Testing + QA
   - Golden output suites for book mode
   - Regression tests for layout rules
   - Cross-platform CI matrix

## Repo Changes
- New modules
  - `src/layout/` (layout engine, pagination, references)
  - `src/book/` (book config loader, chapter resolver)
  - `src/profiles/` (print profiles, validation)
  - `src/accessibility/` (tagging + checks)
- Update existing modules
  - `src/core/convert.ts` to route book mode
  - `src/cli/index.ts` to add book commands

## Backward Compatibility
- Keep existing CLI/API defaults unchanged
- New features are opt-in via config or new commands
- Deprecations only if unavoidable; warn for 2 minor releases

## Milestones + Acceptance Criteria

### M1: Layout + Profiles
- Layout stage introduced with tests
- Print profiles validated with schema
- Cross-reference registry prototype

### M2: Book Mode
- Book config loads multiple chapters
- Chapter templates applied
- Running headers/footers working

### M3: Determinism + Offline
- Lockfile generated and consumed
- Offline asset resolution enforced
- Reproducible build flag verified

### M4: CLI + Preview
- `md2pdf book build` and `md2pdf book preview`
- Preview server with live reload

### M5: Accessibility + i18n Baseline
- RTL + CJK font fallback
- Alt text checks + warnings
- Bookmarks and outline generation
