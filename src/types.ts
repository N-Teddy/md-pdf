import type { MdPdfPlugin } from "./plugins/types.js";

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
  themeDir?: string;
  themeOverrides?: Record<string, string>;
  coverPath?: string;
  header?: HeaderFooterOptions;
  footer?: HeaderFooterOptions;
  toc?: boolean;
  footnotes?: boolean;
  mermaid?: boolean;
  math?: boolean;
  frontmatter?: boolean;
  allowRemote?: boolean;
  renderer?: "chromium" | "lite";
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  plugins?: MdPdfPlugin[];
  cacheDir?: string;
  shikiTheme?: string;
  timeoutMs?: number;
  debug?: boolean;
}
