// @ts-nocheck
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeMermaid } from "./rehype-mermaid.js";
import { rehypeShiki } from "./rehype-shiki.js";
import { rehypeImages } from "./rehype-images.js";
import { rehypePageBreaks } from "./rehype-page-breaks.js";
import { remarkPageBreaks } from "./remark-page-breaks.js";
import { remarkCrossRefs } from "./remark-cross-refs.js";
import { remarkFormatCode } from "../formatters/remark-format-code.js";
import type { FormatterOptions } from "../formatters/registry.js";

export interface MarkdownRenderOptions {
  baseDir: string;
  toc: boolean;
  mermaid: boolean;
  math: boolean;
  frontmatter: boolean;
  allowRemote: boolean;
  formatCode: boolean;
  formatter: FormatterOptions;
  shikiTheme: string;
  themeByLanguage?: Record<string, string>;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  postParseHook?: (mdast: unknown) => Promise<void> | void;
}

export async function markdownToHtml(markdown: string, options: MarkdownRenderOptions): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkPageBreaks)
    .use(remarkCrossRefs)
    .use(options.toc ? remarkToc : () => {})
    .use(options.frontmatter ? remarkFrontmatter : () => {})
    .use(options.math ? remarkMath : () => {})
    .use(options.formatCode ? remarkFormatCode({ formatter: options.formatter }) : () => {})
    .use(options.remarkPlugins ?? [])
    .use(function postParseHookPlugin() {
      return async (tree: unknown) => {
        if (options.postParseHook) {
          await options.postParseHook(tree);
        }
      };
    })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePageBreaks)
    .use(options.mermaid ? rehypeMermaid : () => {})
    .use(rehypeImages, { baseDir: options.baseDir, allowRemote: options.allowRemote })
    .use(rehypeShiki, {
      defaultTheme: options.shikiTheme,
      themeByLanguage: options.themeByLanguage
    })
    .use(options.math ? rehypeKatex : () => {})
    .use(options.rehypePlugins ?? [])
    .use(rehypeStringify, { allowDangerousHtml: false });

  const file = await processor.process(markdown);
  return String(file);
}
