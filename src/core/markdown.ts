import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeMermaid } from "./rehype-mermaid.js";
import { rehypeShiki } from "./rehype-shiki.js";
import { rehypeImages } from "./rehype-images.js";

export interface MarkdownRenderOptions {
	baseDir: string;
	toc: boolean;
	mermaid: boolean;
	math: boolean;
	allowRemote: boolean;
	shikiTheme: string;
	remarkPlugins?: any[];
	rehypePlugins?: any[];
}

export async function markdownToHtml(
	markdown: string,
	options: MarkdownRenderOptions
): Promise<string> {
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(options.toc ? remarkToc : () => {})
		.use(options.math ? remarkMath : () => {})
		.use(options.remarkPlugins ?? [])
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, { behavior: "wrap" })
		.use(options.mermaid ? rehypeMermaid : () => {})
		.use(rehypeImages, { baseDir: options.baseDir, allowRemote: options.allowRemote })
		.use(rehypeShiki({ theme: options.shikiTheme }))
		.use(options.math ? rehypeKatex : () => {})
		.use(options.rehypePlugins ?? [])
		.use(rehypeStringify, { allowDangerousHtml: true });

	const file = await processor.process(markdown);
	return String(file);
}
