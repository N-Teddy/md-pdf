export interface HeaderFooterTemplates {
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter: boolean;
}

export interface RenderOptions {
  html: string;
  baseUrl: string;
  pageSize: string;
  margin: string;
  allowRemote: boolean;
  timeoutMs: number;
  mermaid: boolean;
  headerFooter: HeaderFooterTemplates;
}

export interface Renderer {
  name: "chromium" | "lite";
  render(options: RenderOptions): Promise<Buffer>;
}
