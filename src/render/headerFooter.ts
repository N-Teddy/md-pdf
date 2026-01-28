import { escapeHtml } from "../utils/html.js";
import type { HeaderFooterTemplates } from "../renderers/types.js";

export interface HeaderFooterOptions {
  title?: string;
  pageNumbers?: boolean;
  templateHtml?: string;
}

export interface HeaderFooterBuildOptions {
  header?: HeaderFooterOptions;
  footer?: HeaderFooterOptions;
  themeHeaderTemplate?: string;
  themeFooterTemplate?: string;
  templateData?: Record<string, string>;
}

export function buildHeaderFooterTemplates(options: HeaderFooterBuildOptions): HeaderFooterTemplates {
  const { header, footer, themeHeaderTemplate, themeFooterTemplate, templateData } = options;

  const headerTemplate =
    header?.templateHtml ?? themeHeaderTemplate ?? defaultHeaderTemplate(header);
  const footerTemplate =
    footer?.templateHtml ?? themeFooterTemplate ?? defaultFooterTemplate(footer);

  return {
    headerTemplate: headerTemplate ? renderTemplate(headerTemplate, templateData) : "",
    footerTemplate: footerTemplate ? renderTemplate(footerTemplate, templateData) : "",
    displayHeaderFooter: Boolean(headerTemplate || footerTemplate)
  };
}

function defaultHeaderTemplate(header?: HeaderFooterOptions) {
  if (!header?.title) return "";
  const title = escapeHtml(header.title);
  return baseTemplate(`
    <div class="hf-title">${title}</div>
  `);
}

function defaultFooterTemplate(footer?: HeaderFooterOptions) {
  if (!footer?.pageNumbers) return "";
  return baseTemplate(`
    <div class="hf-page">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>
  `);
}

function baseTemplate(inner: string) {
  return `
    <style>
      .hf-root {
        width: 100%;
        font-size: 9px;
        color: #666666;
        padding: 0 12px;
        box-sizing: border-box;
        font-family: "Noto Sans", Arial, sans-serif;
      }
      .hf-title { text-align: left; }
      .hf-page { text-align: right; }
    </style>
    <div class="hf-root">${inner}</div>
  `;
}

function renderTemplate(template: string, data?: Record<string, string>) {
  if (!data) return template;
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => {
    const value = data[key];
    return value ? escapeHtml(value) : "";
  });
}
