# V2 Risks

## Technical Risks
- Chromium footprint and CI stability
- Cross-platform rendering differences
- Font licensing and embedding compliance
- Plugin system security (arbitrary code execution)
- Determinism regression with remote assets

## Mitigations
- Provide a Lite renderer for constrained environments
- Pin renderer + font + plugin versions
- Require explicit allowRemote for remote assets
- Provide a documented plugin compatibility policy
- Add golden and visual regression tests

