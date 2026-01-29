# V3 Risks

## Technical Risks
- Chromium rendering variability across platforms
- Advanced layout (multi-column, floats) correctness
- PDF/UA tagging support limitations

## Security Risks
- Plugin execution safety
- HTML sanitization gaps
- Untrusted asset handling

## Performance Risks
- Large document memory spikes
- Multi-file builds causing redundant work

## Legal/Licensing Risks
- Font licensing compliance
- Third-party renderer licensing

## Mitigations
- Strict determinism mode + renderer pinning
- Plugin sandboxing and allowlists
- Asset vendoring and cache policies
