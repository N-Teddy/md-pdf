# Plugin Ecosystem (V3)

## Registry Concept
- Curated registry with verified plugins
- Optional community marketplace model
- Metadata: name, version, engine compatibility, capabilities

## Versioning and Compatibility
- Strict semver for core
- Plugins declare `engine` and `capabilities`
- Compatibility tests published with each core release

## Security and Sandboxing
- Plugins run in worker threads by default
- Restricted FS access with allowlists
- Network access disabled unless explicitly allowed

## Lifecycle Hooks
- pre-parse, post-parse
- pre-layout, post-layout
- pre-render, post-render
- asset-resolve, asset-transform

## Governance Model
- Official plugins maintained by core team
- Community plugins require review + signed metadata
