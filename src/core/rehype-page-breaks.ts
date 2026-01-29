import type { Root, Element } from "hast";
import { PAGE_BREAK_TOKEN, SECTION_BREAK_TOKEN } from "./remark-page-breaks.js";

export function rehypePageBreaks() {
  return (tree: Root) => {
    walkTree(tree as unknown as Element, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName !== "p") return;
      const child = node.children?.[0];
      if (!child || child.type !== "text") return;
      const value = String(child.value ?? "").trim();
      if (value === PAGE_BREAK_TOKEN) {
        parent.children[index] = createBreak("page-break");
      } else if (value === SECTION_BREAK_TOKEN) {
        parent.children[index] = createBreak("section-break");
      }
    });
  };
}

function createBreak(className: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: [className] },
    children: []
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
