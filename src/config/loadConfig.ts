import path from "node:path";
import { cosmiconfig } from "cosmiconfig";

export interface MdPdfConfig {
  inputs?: string | string[];
  output?: string;
  outDir?: string;
  watch?: boolean;
  renderer?: "chromium" | "lite";
  fallbackRenderer?: "lite" | "none";
  theme?: string;
  themeDir?: string;
  themeFile?: string;
  themeOverrides?: Record<string, string>;
  pageSize?: string;
  margin?: string;
  toc?: boolean;
  footnotes?: boolean;
  mermaid?: boolean;
  math?: boolean;
  frontmatter?: boolean;
  allowRemote?: boolean;
  coverPath?: string;
  header?: { title?: string; templateHtml?: string };
  footer?: { pageNumbers?: boolean; templateHtml?: string };
  plugins?: any[];
  cacheDir?: string;
  shikiTheme?: string;
  timeoutMs?: number;
}

const SEARCH_PLACES = [
  "md2pdf.config.js",
  "md2pdf.config.cjs",
  "md2pdf.config.mjs",
  "md2pdf.config.json",
  "md2pdf.config.yaml",
  "md2pdf.config.yml"
];

export async function loadConfig(cwd: string, configPath?: string) {
  const explorer = cosmiconfig("md2pdf", {
    searchPlaces: SEARCH_PLACES
  });

  if (configPath) {
    const absolute = path.resolve(cwd, configPath);
    const result = await explorer.load(absolute);
    return { config: (result?.config as MdPdfConfig) ?? {}, filepath: result?.filepath };
  }

  const result = await explorer.search(cwd);
  return { config: (result?.config as MdPdfConfig) ?? {}, filepath: result?.filepath };
}
