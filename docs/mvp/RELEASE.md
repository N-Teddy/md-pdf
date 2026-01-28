# Release Checklist

## Versioning
- Use changesets for version bumps
- Follow semver: patch for fixes, minor for features, major for breaking changes

## Pre-Release
- [ ] `pnpm install`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `npx playwright install --with-deps` (CI and local as needed)
- [ ] Smoke test CLI:
  - `node dist/cli/index.js ./examples/sample.md --out-dir ./examples/output --mermaid --math`

## Publishing
- [ ] `pnpm changeset` (if using changesets)
- [ ] `pnpm changeset version`
- [ ] Update CHANGELOG
- [ ] `pnpm publish --access public`

## Post-Release
- [ ] Tag release in git
- [ ] Verify npm package installs and CLI works

