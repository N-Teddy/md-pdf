export interface BookConfig {
  title?: string;
  author?: string;
  profile?: string;
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
  formatCode?: boolean;
  renderer?: "chromium" | "lite";
  requireChromium?: boolean;
  chapters: string[];
  appendices?: string[];
}

export interface PublishOptions {
  outputPath?: string;
  profile?: string;
  pageSize?: string;
  margin?: string;
  renderer?: "chromium" | "lite";
  requireChromium?: boolean;
}
