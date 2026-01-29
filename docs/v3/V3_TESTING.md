# V3 Testing Strategy

## Goals
- Prevent layout regressions across platforms
- Validate determinism and reproducibility
- Ensure accessibility/i18n baselines are enforced

## Test Types
1) Unit Tests
   - Layout rules (page/section breaks)
   - Profile resolution + validation
   - Book config parsing and validation

2) Integration Tests
   - End-to-end book build for V3 examples
   - Cross-ref resolution in long documents
   - Theme/template rendering

3) Golden/Visual Regression
   - Render baseline PDFs for core fixtures
   - Compare page count, text extraction, and pixel diffs

4) Performance Tests
   - Large doc stress test (100+ pages)
   - Batch conversion throughput

## Cross-Platform Matrix
- Linux, macOS, Windows
- Chromium pinned version

## Determinism Checks
- Hash PDF outputs across repeated runs
- Verify asset lockfile use

## Accessibility Checks
- Heading hierarchy
- Alt text present for images
- Bookmark outline generation
