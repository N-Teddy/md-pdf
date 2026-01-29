# V3 Security

## Threat Model
- Untrusted Markdown input
- Untrusted plugins
- Remote assets and external URLs
- Malicious HTML or script injection

## Security Controls
- Sanitization of raw HTML by default
- Plugin sandboxing (worker threads + restricted IO)
- Allowlist-based file access
- Network access disabled by default

## Plugin Trust Model
- Official plugins signed and curated
- Third-party plugins require explicit enablement
- Capability declarations required

## Asset Handling
- Local asset resolution only in offline mode
- Optional remote allowlist
- Asset hashing + cache validation

## Recommendations
- Run builds in isolated CI environment
- Use `--require-chromium` for deterministic output
- Pin renderer version in lockfile
