import { escapeHtml } from "../utils/html.js";

export interface HeaderFooterOptions {
	title?: string;
	pageNumbers?: boolean;
	templateHtml?: string;
}

export function buildHeaderFooterTemplates(
	header?: HeaderFooterOptions,
	footer?: HeaderFooterOptions
) {
	const headerTemplate = header?.templateHtml ?? defaultHeaderTemplate(header);
	const footerTemplate = footer?.templateHtml ?? defaultFooterTemplate(footer);

	return {
		headerTemplate: headerTemplate ?? "",
		footerTemplate: footerTemplate ?? "",
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
