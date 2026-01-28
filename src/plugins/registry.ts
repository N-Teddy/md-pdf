import type { MdPdfPlugin, PluginContext } from "./types.js";

export async function runPreParse(
  markdown: string,
  plugins: MdPdfPlugin[],
  ctx: PluginContext
): Promise<string> {
  let current = markdown;
  for (const plugin of plugins) {
    if (plugin.hooks.preParse) {
      current = await plugin.hooks.preParse(current, ctx);
    }
  }
  return current;
}

export async function runPostParse(
  mdast: unknown,
  plugins: MdPdfPlugin[],
  ctx: PluginContext
): Promise<void> {
  for (const plugin of plugins) {
    if (plugin.hooks.postParse) {
      await plugin.hooks.postParse(mdast, ctx);
    }
  }
}

export async function runPreRender(
  html: string,
  plugins: MdPdfPlugin[],
  ctx: PluginContext
): Promise<string> {
  let current = html;
  for (const plugin of plugins) {
    if (plugin.hooks.preRender) {
      current = await plugin.hooks.preRender(current, ctx);
    }
  }
  return current;
}

export async function runPostRender(
  pdf: Buffer,
  plugins: MdPdfPlugin[],
  ctx: PluginContext
): Promise<Buffer> {
  let current = pdf;
  for (const plugin of plugins) {
    if (plugin.hooks.postRender) {
      current = await plugin.hooks.postRender(current, ctx);
    }
  }
  return current;
}
