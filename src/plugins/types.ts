export interface PluginContext {
  cwd: string;
  cacheDir: string;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  addAsset: (url: string) => Promise<string>;
}

export interface PluginHooks {
  preParse?: (markdown: string, ctx: PluginContext) => Promise<string> | string;
  postParse?: (mdast: unknown, ctx: PluginContext) => Promise<void> | void;
  preRender?: (html: string, ctx: PluginContext) => Promise<string> | string;
  postRender?: (pdf: Buffer, ctx: PluginContext) => Promise<Buffer> | Buffer;
}

export interface MdPdfPlugin {
  name: string;
  hooks: PluginHooks;
}
