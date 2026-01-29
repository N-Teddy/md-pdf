import { unified, type Plugin } from "unified";
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

const noopPlugin: Plugin = () => {};

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
  const processor: any = unified();
  processor.use(remarkParse);
  processor.use(remarkGfm);
  processor.use(remarkPageBreaks);
  processor.use(remarkCrossRefs);
  processor.use(options.toc ? remarkToc : noopPlugin);
  processor.use(options.frontmatter ? remarkFrontmatter : noopPlugin);
  processor.use(options.math ? remarkMath : noopPlugin);
  processor.use(options.formatCode ? remarkFormatCode({ formatter: options.formatter }) : noopPlugin);
  processor.use(options.remarkPlugins ?? []);
  processor.use(remarkRehype, { allowDangerousHtml: false });
  processor.use(rehypeSlug);
  processor.use(rehypeAutolinkHeadings, { behavior: "wrap" });
  processor.use(rehypePageBreaks);
  processor.use(options.mermaid ? rehypeMermaid : noopPlugin);
  processor.use(rehypeImages, { baseDir: options.baseDir, allowRemote: options.allowRemote });
  processor.use(rehypeShiki, {
    defaultTheme: options.shikiTheme,
    themeByLanguage: options.themeByLanguage
  });
  processor.use(options.math ? rehypeKatex : noopPlugin);
  processor.use(options.rehypePlugins ?? []);
  processor.use(rehypeStringify, { allowDangerousHtml: false });

  if (options.postParseHook) {
    const postParseHookPlugin: Plugin<[]> = () => {
      return async (tree: unknown) => {
        await options.postParseHook?.(tree);
      };
    };
    processor.use(postParseHookPlugin);
  }

  const file = await processor.process(markdown);
  return String(file);
}
