import path from "node:path";
import type { Root, Element } from "hast";
import { toFileUrl, resolveFrom } from "../utils/paths.js";

export interface RehypeImageOptions {
  baseDir: string;
  allowRemote: boolean;
}

const REMOTE_RE = /^https?:\/\//i;

export function rehypeImages(options: RehypeImageOptions) {
  return (tree: Root) => {
    walkTree(tree as unknown as Element, (node) => {
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

function walkTree(
  node: Element,
  visitor: (node: Element, index: number | undefined, parent: Element | undefined) => void,
  parent?: Element,
  index?: number
) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element") {
    visitor(node, index, parent);
  }

  const children = (node as { children?: unknown[] }).children;
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child && typeof child === "object") {
        walkTree(child as Element, visitor, node, i);
      }
    }
  }
}
