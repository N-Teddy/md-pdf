import fs from "node:fs/promises";
import path from "node:path";
import fsSync from "node:fs";
import { fileURLToPath } from "node:url";
import { toFileUrl } from "../utils/paths.js";

export async function loadThemeCss(theme: string | undefined, themeFile?: string): Promise<string> {
	if (themeFile) {
		return fs.readFile(themeFile, "utf8");
	}

	const themeName = theme ?? "default";
	if (themeName !== "default") {
		throw new Error(`Unknown theme: ${themeName}`);
	}

	const themePath = resolveThemePath("default.css");
	const css = await fs.readFile(themePath, "utf8");
	const fontDir = resolveThemePath("fonts");
	const fontUrl = toFileUrl(fontDir);
	return css.replace(/__FONT_DIR__/g, fontUrl);
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
	while (true) {
		const candidate = path.join(current, "package.json");
		if (fsSync.existsSync(candidate)) return current;
		const parent = path.dirname(current);
		if (parent === current) return startDir;
		current = parent;
	}
}
