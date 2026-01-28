import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toFileUrl } from "../utils/paths.js";

export interface ThemeTemplates {
  header?: string;
  footer?: string;
  cover?: string;
}

export interface LoadThemeOptions {
  theme?: string;
  themeFile?: string;
  themeDir?: string;
  themeOverrides?: Record<string, string>;
}

export interface ThemeLoadResult {
  css: string;
  templates: ThemeTemplates;
}

export async function loadTheme(options: LoadThemeOptions): Promise<ThemeLoadResult> {
  const themeName = options.theme ?? "default";
  let cssPath: string;
  let baseDir: string;
  let templateDir: string | undefined;

  if (options.themeDir) {
    baseDir = path.resolve(options.themeDir);
    cssPath = path.join(baseDir, "theme.css");
    templateDir = path.join(baseDir, "templates");
  } else if (options.themeFile) {
    cssPath = path.resolve(options.themeFile);
    baseDir = path.dirname(cssPath);
  } else {
    if (themeName !== "default") {
      throw new Error(`Unknown theme: ${themeName}`);
    }
    baseDir = resolveThemePath(".");
    cssPath = resolveThemePath("default.css");
    templateDir = resolveThemePath("templates");
  }

  let css = await fs.readFile(cssPath, "utf8");

  const fontDir = path.join(baseDir, "fonts");
  if (fsSync.existsSync(fontDir)) {
    const fontUrl = toFileUrl(fontDir);
    css = css.replace(/__FONT_DIR__/g, fontUrl);
  } else {
    css = css.replace(/__FONT_DIR__/g, "");
  }

  if (options.themeOverrides && Object.keys(options.themeOverrides).length > 0) {
    const overrides = Object.entries(options.themeOverrides)
      .map(([key, value]) => {
        const name = key.startsWith("--") ? key : `--${key}`;
        return `${name}: ${value};`;
      })
      .join(" ");
    css = `${css}\n:root { ${overrides} }\n`;
  }

  const templates: ThemeTemplates = {
    header: templateDir ? await readIfExists(path.join(templateDir, "header.html")) : undefined,
    footer: templateDir ? await readIfExists(path.join(templateDir, "footer.html")) : undefined,
    cover: templateDir ? await readIfExists(path.join(templateDir, "cover.html")) : undefined
  };

  return { css, templates };
}

async function readIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function resolveThemePath(relativePath: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = findPackageRoot(here);
  const distPath = path.resolve(root, "dist", "themes", relativePath);
  if (fsSync.existsSync(distPath)) return distPath;
  return path.resolve(root, "src", "themes", relativePath);
}

function findPackageRoot(startDir: string): string {
  let current = startDir;
  let searching = true;
  while (searching) {
    const candidate = path.join(current, "package.json");
    if (fsSync.existsSync(candidate)) return current;
    const parent = path.dirname(current);
    if (parent === current) {
      searching = false;
    } else {
      current = parent;
    }
  }
  return startDir;
}
