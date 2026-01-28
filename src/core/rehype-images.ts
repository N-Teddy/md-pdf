import path from "node:path";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import { toFileUrl, resolveFrom } from "../utils/paths.js";

export interface RehypeImageOptions {
	baseDir: string;
	allowRemote: boolean;
}

const REMOTE_RE = /^https?:\/\//i;

export function rehypeImages(options: RehypeImageOptions) {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "img") return;
			const src = node.properties?.src;
			if (typeof src !== "string") return;

			if (REMOTE_RE.test(src)) {
				if (!options.allowRemote) {
					throw new Error(`Remote images are disabled: ${src}`);
				}
				return;
			}

			if (src.startsWith("data:") || src.startsWith("file:")) {
				return;
			}

			const resolved = resolveFrom(options.baseDir, src);
			node.properties = node.properties ?? {};
			node.properties.src = toFileUrl(path.resolve(resolved));
		});
	};
}
