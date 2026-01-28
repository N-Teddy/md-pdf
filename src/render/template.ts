export interface HtmlTemplateOptions {
  bodyHtml: string;
  coverHtml?: string;
  themeCss: string;
  katexCss?: string;
  katexCssHref?: string;
  includeMermaidScript?: string;
}

export function buildHtmlDocument(options: HtmlTemplateOptions): string {
  const { bodyHtml, coverHtml, themeCss, katexCss, katexCssHref, includeMermaidScript } = options;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${themeCss}</style>
  ${katexCssHref ? `<link rel="stylesheet" href="${katexCssHref}">` : ""}
  ${katexCss ? `<style>${katexCss}</style>` : ""}
</head>
<body>
  ${coverHtml ?? ""}
  <main class="content">${bodyHtml}</main>
  ${includeMermaidScript ? `<script>${includeMermaidScript}</script>` : ""}
</body>
</html>`;
}
