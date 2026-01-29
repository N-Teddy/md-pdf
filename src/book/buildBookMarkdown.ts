import fs from "node:fs/promises";
import path from "node:path";
import type { LoadedBook } from "./loadBook.js";

const SECTION_BREAK = "<!-- section-break -->";

export async function buildBookMarkdown(book: LoadedBook): Promise<string> {
  const parts: string[] = [];
  const { config, chapters, appendices } = book;

  if (config.title) {
    parts.push(`# ${config.title}`);
  }
  if (config.author) {
    parts.push(`**${config.author}**`);
  }
  if (config.title || config.author) {
    parts.push(SECTION_BREAK);
  }

  for (let i = 0; i < chapters.length; i += 1) {
    const filePath = chapters[i];
    const content = await fs.readFile(filePath, "utf8");
    parts.push(normalizeSection(content, path.basename(filePath)));
    if (i < chapters.length - 1) {
      parts.push(SECTION_BREAK);
    }
  }

  if (appendices.length > 0) {
    parts.push(SECTION_BREAK);
    parts.push("# Appendices");
    for (const filePath of appendices) {
      const content = await fs.readFile(filePath, "utf8");
      parts.push(normalizeSection(content, path.basename(filePath)));
    }
  }

  return parts.join("\n\n");
}

function normalizeSection(content: string, fallbackTitle: string) {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return `# ${fallbackTitle}`;
  }
  return trimmed;
}
