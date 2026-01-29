import path from "node:path";
import { convertMarkdownToPdfInternal } from "../core/convert.js";
import { loadBookConfig } from "./loadBook.js";
import { buildBookMarkdown } from "./buildBookMarkdown.js";
import { resolveProfile } from "../profiles/index.js";
import type { PublishOptions } from "./types.js";

export async function publishBook(configPath: string, options: PublishOptions = {}) {
  const book = await loadBookConfig(configPath);
  const markdown = await buildBookMarkdown(book);
  const profile = resolveProfile(options.profile ?? book.config.profile);

  const outputPath =
    options.outputPath ??
    path.join(path.dirname(configPath), `${book.config.title ?? "book"}.pdf`);

  return convertMarkdownToPdfInternal(
    { input: markdown, baseDir: book.baseDir },
    {
      outputPath,
      pageSize: options.pageSize ?? book.config.pageSize ?? profile?.pageSize,
      margin: options.margin ?? book.config.margin ?? profile?.margin,
      theme: book.config.theme,
      themeDir: book.config.themeDir,
      themeFile: book.config.themeFile,
      themeOverrides: book.config.themeOverrides,
      toc: book.config.toc,
      footnotes: book.config.footnotes,
      mermaid: book.config.mermaid,
      math: book.config.math,
      frontmatter: book.config.frontmatter,
      allowRemote: book.config.allowRemote,
      formatCode: book.config.formatCode,
      renderer: options.renderer ?? book.config.renderer,
      requireChromium: options.requireChromium ?? book.config.requireChromium,
      header: { title: book.config.title ?? undefined }
    }
  );
}
