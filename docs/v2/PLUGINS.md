# Plugins

## Plugin API (TypeScript)
```ts
export interface PluginContext {
  cwd: string;
  cacheDir: string;
  logger: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void };
  addAsset: (url: string) => Promise<string>; // resolves + caches assets
}

export interface PluginHooks {
  preParse?: (markdown: string, ctx: PluginContext) => Promise<string> | string;
  postParse?: (mdast: any, ctx: PluginContext) => Promise<void> | void;
  preRender?: (html: string, ctx: PluginContext) => Promise<string> | string;
  postRender?: (pdf: Buffer, ctx: PluginContext) => Promise<Buffer> | Buffer;
}

export interface MdPdfPlugin {
  name: string;
  hooks: PluginHooks;
}
```

## Lifecycle Hooks
- preParse: modify raw Markdown before parsing
- postParse: modify MDAST before HTML conversion
- preRender: modify HTML/template output
- postRender: modify PDF buffer

## Official Plugins (Planned)
- toc
- mermaid
- math (KaTeX)
- footnotes
- frontmatter
- syntax-highlight (Shiki)

## Safety Model
- Plugins run in-process and can access filesystem by default
- Optional sandbox mode (future) to restrict IO
- Plugin compatibility is semver-bound to major versions

