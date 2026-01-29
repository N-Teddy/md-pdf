import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { BookConfig } from "./types.js";

export interface LoadedBook {
  config: BookConfig;
  baseDir: string;
  chapters: string[];
  appendices: string[];
}

export async function loadBookConfig(configPath: string): Promise<LoadedBook> {
  const absolute = path.resolve(configPath);
  const baseDir = path.dirname(absolute);
  const raw = await fs.readFile(absolute, "utf8");
  const parsed = YAML.parse(raw) as BookConfig;

  if (!parsed || !Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
    throw new Error("book.yaml must define a non-empty chapters array");
  }

  const chapters = parsed.chapters.map((entry) => path.resolve(baseDir, entry));
  const appendices = (parsed.appendices ?? []).map((entry) => path.resolve(baseDir, entry));

  return { config: parsed, baseDir, chapters, appendices };
}
