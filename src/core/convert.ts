import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { markdownToHtml } from "./markdown.js";
import { loadThemeCss } from "../themes/index.js";
import { buildHtmlDocument } from "../render/template.js";
import { renderPdf } from "../render/render.js";
import { getKatexCssHref, loadMermaidScript } from "../render/assets.js";
import type { ConvertInput, ConvertOptions, HeaderFooterOptions } from "../types.js";

const DEFAULTS = {
	pageSize: "A4",
	margin: "1in,1in,1in,1in",
	theme: "default",
	allowRemote: false,
	toc: false,
	mermaid: false,
	math: false,
	timeoutMs: 60000,
	shikiTheme: "github-light"
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
		coverPath: options.coverPath,
		toc: options.toc ?? DEFAULTS.toc,
		mermaid: options.mermaid ?? DEFAULTS.mermaid,
		math: options.math ?? DEFAULTS.math,
		allowRemote: options.allowRemote ?? DEFAULTS.allowRemote,
		timeoutMs: options.timeoutMs ?? DEFAULTS.timeoutMs,
		shikiTheme: DEFAULTS.shikiTheme,
		remarkPlugins: options.remarkPlugins,
		rehypePlugins: options.rehypePlugins
	};

	const themeCss = await loadThemeCss(resolved.theme, resolved.themeFile);

	const bodyHtml = await markdownToHtml(markdown, {
		baseDir,
		toc: resolved.toc,
		mermaid: resolved.mermaid,
		math: resolved.math,
		allowRemote: resolved.allowRemote,
		shikiTheme: resolved.shikiTheme,
		remarkPlugins: resolved.remarkPlugins,
		rehypePlugins: resolved.rehypePlugins
	});

	let coverHtml: string | undefined;
	if (resolved.coverPath) {
		const coverMarkdown = await fs.readFile(resolved.coverPath, "utf8");
		coverHtml = await markdownToHtml(coverMarkdown, {
			baseDir: path.dirname(resolved.coverPath),
			toc: false,
			mermaid: resolved.mermaid,
			math: resolved.math,
			allowRemote: resolved.allowRemote,
			shikiTheme: resolved.shikiTheme,
			remarkPlugins: resolved.remarkPlugins,
			rehypePlugins: resolved.rehypePlugins
		});
	}

	const katexCssHref = resolved.math ? getKatexCssHref() : undefined;
	const mermaidScript = resolved.mermaid ? await loadMermaidScript() : undefined;

	const html = buildHtmlDocument({
		bodyHtml,
		coverHtml,
		themeCss,
		katexCssHref,
		includeMermaidScript: mermaidScript
	});

	const header = resolveHeader(options.header, derivedTitle);
	const footer = resolveFooter(options.footer);

	const pdf = await renderPdf({
		html,
		baseUrl: pathToFileURL(baseDir).toString(),
		pageSize: resolved.pageSize,
		margin: resolved.margin,
		header,
		footer,
		allowRemote: resolved.allowRemote,
		timeoutMs: resolved.timeoutMs,
		mermaid: resolved.mermaid
	});

	if (options.outputPath) {
		await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
		await fs.writeFile(options.outputPath, pdf);
		return;
	}

	return pdf;
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
		title: header?.title ?? derivedTitle
	};
}

function resolveFooter(footer: HeaderFooterOptions | undefined) {
	if (!footer) {
		return { pageNumbers: true };
	}
	return {
		pageNumbers: footer.pageNumbers ?? true
	};
}
