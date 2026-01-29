export type { ConvertInput, ConvertOptions, HeaderFooterOptions } from "./types.js";
export type { MdPdfPlugin, PluginContext } from "./plugins/types.js";
export type { BookConfig, PublishOptions } from "./book/types.js";
export { createPlugin } from "./plugins/index.js";
export { tocPlugin, footnotesPlugin, frontmatterPlugin, mermaidPlugin, mathPlugin } from "./plugins/builtins.js";
import type { ConvertInput, ConvertOptions } from "./types.js";
import { convertMarkdownToPdfInternal } from "./core/convert.js";
export { publishBook } from "./book/publishBook.js";

export async function convertMarkdownToPdf(
  input: ConvertInput,
  options: ConvertOptions = {}
): Promise<Buffer | void> {
  return convertMarkdownToPdfInternal(input, options);
}
