export type ConvertInput = { inputPath: string } | { input: string; baseDir?: string };

export interface HeaderFooterOptions {
  title?: string;
  pageNumbers?: boolean;
  templateHtml?: string;
}

export interface ConvertOptions {
  outputPath?: string;
  pageSize?: "A4" | "Letter" | string;
  margin?: string;
  theme?: string;
  themeFile?: string;
  coverPath?: string;
  header?: HeaderFooterOptions;
  footer?: HeaderFooterOptions;
  toc?: boolean;
  mermaid?: boolean;
  math?: boolean;
  allowRemote?: boolean;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  timeoutMs?: number;
  debug?: boolean;
}

export async function convertMarkdownToPdf(
  _input: ConvertInput,
  _options: ConvertOptions = {}
): Promise<Buffer | void> {
  void _input;
  void _options;
  throw new Error("Not implemented. Phase 3 will add the rendering pipeline.");
}
