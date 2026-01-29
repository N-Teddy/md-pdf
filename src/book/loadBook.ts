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

  validateBookConfig(parsed);

  if (!parsed || !Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
    throw new Error("book.yaml must define a non-empty chapters array");
  }

  const chapters = parsed.chapters.map((entry) => path.resolve(baseDir, entry));
  const appendices = (parsed.appendices ?? []).map((entry) => path.resolve(baseDir, entry));

  await assertFilesExist(chapters, "chapter");
  await assertFilesExist(appendices, "appendix");

  return { config: parsed, baseDir, chapters, appendices };
}

function validateBookConfig(config: BookConfig) {
  if (!config || typeof config !== "object") {
    throw new Error("book.yaml must be a YAML object");
  }

  const errors: string[] = [];

  const expectString = (key: keyof BookConfig, value: unknown) => {
    if (value !== undefined && typeof value !== "string") {
      errors.push(`'${String(key)}' must be a string`);
    }
  };

  const expectBool = (key: keyof BookConfig, value: unknown) => {
    if (value !== undefined && typeof value !== "boolean") {
      errors.push(`'${String(key)}' must be a boolean`);
    }
  };

  const expectStringArray = (key: keyof BookConfig, value: unknown, required = false) => {
    if (value === undefined) {
      if (required) errors.push(`'${String(key)}' is required`);
      return;
    }
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
      errors.push(`'${String(key)}' must be an array of strings`);
    }
  };

  expectString("title", config.title);
  expectString("author", config.author);
  expectString("profile", config.profile);
  expectString("theme", config.theme);
  expectString("themeDir", config.themeDir);
  expectString("themeFile", config.themeFile);
  expectString("pageSize", config.pageSize);
  expectString("margin", config.margin);
  expectString("renderer", config.renderer);
  expectBool("requireChromium", config.requireChromium);
  expectBool("toc", config.toc);
  expectBool("footnotes", config.footnotes);
  expectBool("mermaid", config.mermaid);
  expectBool("math", config.math);
  expectBool("frontmatter", config.frontmatter);
  expectBool("allowRemote", config.allowRemote);
  expectBool("formatCode", config.formatCode);

  expectStringArray("chapters", config.chapters, true);
  expectStringArray("appendices", config.appendices, false);

  if (
    config.themeOverrides !== undefined &&
    (typeof config.themeOverrides !== "object" || Array.isArray(config.themeOverrides))
  ) {
    errors.push("'themeOverrides' must be an object of string values");
  } else if (config.themeOverrides) {
    for (const [key, value] of Object.entries(config.themeOverrides)) {
      if (typeof value !== "string") {
        errors.push(`themeOverrides.${key} must be a string`);
      }
    }
  }

  if (config.renderer && config.renderer !== "chromium" && config.renderer !== "lite") {
    errors.push("'renderer' must be 'chromium' or 'lite'");
  }

  if (config.requireChromium && config.renderer === "lite") {
    errors.push("'requireChromium' cannot be true when renderer is 'lite'");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid book.yaml configuration:\n- ${errors.join("\n- ")}`);
  }
}

async function assertFilesExist(paths: string[], label: string) {
  if (paths.length === 0) return;
  const missing: string[] = [];
  await Promise.all(
    paths.map(async (entry) => {
      try {
        await fs.access(entry);
      } catch {
        missing.push(entry);
      }
    })
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing ${label} file${missing.length > 1 ? "s" : ""}:\n- ${missing.join("\n- ")}`
    );
  }
}
