import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown.js";
import { loadTheme } from "../themes/index.js";
import { buildHtmlDocument } from "../render/template.js";
import { buildHeaderFooterTemplates } from "../render/headerFooter.js";
import { getKatexCssHref, loadMermaidScript } from "../render/assets.js";
import { getRenderer } from "../renderers/index.js";
import { resolveAsset } from "../assets/resolveAsset.js";
import { runPostParse, runPostRender, runPreParse, runPreRender } from "../plugins/registry.js";
import type { ConvertInput, ConvertOptions, HeaderFooterOptions } from "../types.js";
import type { PluginContext } from "../plugins/types.js";
import { escapeHtml } from "../utils/html.js";

const DEFAULTS = {
  pageSize: "A4",
  margin: "1in,1in,1in,1in",
  theme: "default",
  allowRemote: false,
  toc: false,
  mermaid: false,
  math: false,
  frontmatter: true,
  footnotes: true,
  timeoutMs: 60000,
  shikiTheme: "github-light",
  renderer: "chromium" as const
};

export async function convertMarkdownToPdfInternal(
  input: ConvertInput,
  options: ConvertOptions = {}
): Promise<Buffer | void> {
  const { markdown, baseDir, derivedTitle } = await resolveInput(input);
  const resolved = {
    pageSize: options.pageSize ?? DEFAULTS.pageSize,
    margin: options.margin ?? DEFAULTS.margin,
    theme: options.theme ?? DEFAULTS.theme,
    themeFile: options.themeFile,
    themeDir: options.themeDir,
    themeOverrides: options.themeOverrides,
    coverPath: options.coverPath,
    toc: options.toc ?? DEFAULTS.toc,
    mermaid: options.mermaid ?? DEFAULTS.mermaid,
    math: options.math ?? DEFAULTS.math,
    frontmatter: options.frontmatter ?? DEFAULTS.frontmatter,
    footnotes: options.footnotes ?? DEFAULTS.footnotes,
    allowRemote: options.allowRemote ?? DEFAULTS.allowRemote,
    timeoutMs: options.timeoutMs ?? DEFAULTS.timeoutMs,
    shikiTheme: options.shikiTheme ?? DEFAULTS.shikiTheme,
    renderer: options.renderer ?? DEFAULTS.renderer,
    fallbackRenderer: options.fallbackRenderer ?? "lite",
    remarkPlugins: options.remarkPlugins,
    rehypePlugins: options.rehypePlugins
  };

  const plugins = options.plugins ?? [];
  const cacheDir = path.resolve(options.cacheDir ?? path.join(process.cwd(), ".md2pdf-cache"));
  await fs.mkdir(cacheDir, { recursive: true });

  const ctx: PluginContext = {
    cwd: process.cwd(),
    cacheDir,
    logger: {
      info: (msg) => options.debug && console.log(msg),
      warn: (msg) => console.warn(msg),
      error: (msg) => console.error(msg)
    },
    addAsset: (url) => resolveAsset(url, { baseDir, allowRemote: resolved.allowRemote, cacheDir })
  };

  let content = await runPreParse(markdown, plugins, ctx);
  const templateData: Record<string, string> = {};

  if (resolved.frontmatter) {
    const parsed = matter(content);
    content = parsed.content;
    for (const [key, value] of Object.entries(parsed.data ?? {})) {
      templateData[key] = String(value);
    }
  }

  const { css: themeCss, templates } = await loadTheme({
    theme: resolved.theme,
    themeFile: resolved.themeFile,
    themeDir: resolved.themeDir,
    themeOverrides: resolved.themeOverrides
  });

  const bodyHtml = await markdownToHtml(content, {
    baseDir,
    toc: resolved.toc,
    mermaid: resolved.mermaid,
    math: resolved.math,
    frontmatter: resolved.frontmatter,
    allowRemote: resolved.allowRemote,
    shikiTheme: resolved.shikiTheme,
    remarkPlugins: resolved.remarkPlugins,
    rehypePlugins: resolved.rehypePlugins,
    postParseHook: (mdast) => runPostParse(mdast, plugins, ctx)
  });

  let coverHtml: string | undefined;
  if (resolved.coverPath) {
    const coverMarkdown = await fs.readFile(resolved.coverPath, "utf8");
    coverHtml = await markdownToHtml(coverMarkdown, {
      baseDir: path.dirname(resolved.coverPath),
      toc: false,
      mermaid: resolved.mermaid,
      math: resolved.math,
      frontmatter: resolved.frontmatter,
      allowRemote: resolved.allowRemote,
      shikiTheme: resolved.shikiTheme,
      remarkPlugins: resolved.remarkPlugins,
      rehypePlugins: resolved.rehypePlugins
    });
  }

  const katexCssHref = resolved.math ? getKatexCssHref() : undefined;
  const mermaidScript = resolved.mermaid ? await loadMermaidScript() : undefined;

  if (derivedTitle) {
    templateData.title = templateData.title ?? derivedTitle;
  }

  const html = await runPreRender(
    buildHtmlDocument({
      bodyHtml,
      coverHtml: applyCoverTemplate(coverHtml, templates.cover, templateData),
      themeCss,
      katexCssHref,
      includeMermaidScript: mermaidScript
    }),
    plugins,
    ctx
  );

  const header = resolveHeader(options.header, templateData.title);
  const footer = resolveFooter(options.footer);

  const headerFooter = buildHeaderFooterTemplates({
    header,
    footer,
    themeHeaderTemplate: templates.header,
    themeFooterTemplate: templates.footer,
    templateData
  });

  const pdf = await renderWithFallback({
    renderer: resolved.renderer,
    fallbackRenderer: resolved.fallbackRenderer,
    html,
    baseUrl: pathToFileURL(baseDir).toString(),
    pageSize: resolved.pageSize,
    margin: resolved.margin,
    headerFooter,
    allowRemote: resolved.allowRemote,
    timeoutMs: resolved.timeoutMs,
    mermaid: resolved.mermaid
  });

  const finalPdf = await runPostRender(pdf, plugins, ctx);

  if (options.outputPath) {
    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
    await fs.writeFile(options.outputPath, finalPdf);
    return;
  }

  return finalPdf;
}

async function renderWithFallback(options: {
  renderer: "chromium" | "lite";
  fallbackRenderer: "lite" | "none";
  html: string;
  baseUrl: string;
  pageSize: string;
  margin: string;
  headerFooter: { headerTemplate?: string; footerTemplate?: string; displayHeaderFooter: boolean };
  allowRemote: boolean;
  timeoutMs: number;
  mermaid: boolean;
}) {
  const renderer = getRenderer(options.renderer);
  try {
    return await renderer.render({
      html: options.html,
      baseUrl: options.baseUrl,
      pageSize: options.pageSize,
      margin: options.margin,
      headerFooter: options.headerFooter,
      allowRemote: options.allowRemote,
      timeoutMs: options.timeoutMs,
      mermaid: options.mermaid
    });
  } catch (err) {
    if (options.renderer === "chromium" && options.fallbackRenderer === "lite") {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Chromium render failed, falling back to lite: ${message}`);
      const fallback = getRenderer("lite");
      return fallback.render({
        html: options.html,
        baseUrl: options.baseUrl,
        pageSize: options.pageSize,
        margin: options.margin,
        headerFooter: options.headerFooter,
        allowRemote: options.allowRemote,
        timeoutMs: options.timeoutMs,
        mermaid: options.mermaid
      });
    }
    throw err;
  }
}

async function resolveInput(input: ConvertInput) {
  if ("inputPath" in input) {
    const markdown = await fs.readFile(input.inputPath, "utf8");
    return {
      markdown,
      baseDir: path.dirname(input.inputPath),
      derivedTitle: path.basename(input.inputPath, path.extname(input.inputPath))
    };
  }

  const baseDir = input.baseDir ? path.resolve(input.baseDir) : process.cwd();
  return { markdown: input.input, baseDir, derivedTitle: undefined };
}

function resolveHeader(header: HeaderFooterOptions | undefined, derivedTitle?: string) {
  if (!header && !derivedTitle) return undefined;
  return {
    title: header?.title ?? derivedTitle,
    templateHtml: header?.templateHtml
  };
}

function resolveFooter(footer: HeaderFooterOptions | undefined) {
  if (!footer) {
    return { pageNumbers: true };
  }
  return {
    pageNumbers: footer.pageNumbers ?? true,
    templateHtml: footer.templateHtml
  };
}

function applyCoverTemplate(
  coverHtml: string | undefined,
  template: string | undefined,
  data: Record<string, string>
) {
  if (!coverHtml) return undefined;
  if (!template) return `<section class="cover">${coverHtml}</section><div class="page-break"></div>`;
  return template
    .replace(/\{\{\s*content\s*\}\}/g, coverHtml)
    .replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => {
      if (key === "content") return coverHtml;
      const value = data[key];
      return value ? escapeHtml(value) : "";
    });
}
