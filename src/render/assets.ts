import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

export async function loadMermaidScript(): Promise<string> {
	const mermaidPath = require.resolve("mermaid/dist/mermaid.min.js");
	return fs.readFile(mermaidPath, "utf8");
}

export function getKatexCssHref(): string {
	const cssPath = require.resolve("katex/dist/katex.min.css");
	return pathToFileURL(cssPath).toString();
}
