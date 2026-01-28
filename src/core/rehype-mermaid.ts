import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

export function rehypeMermaid() {
  return (tree: Root) => {
    walkTree(tree as unknown as Element, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName !== "pre") return;
      const code = node.children[0] as Element | undefined;
      if (!code || code.tagName !== "code") return;
      const className = Array.isArray(code.properties?.className)
        ? code.properties?.className
        : [];
      const isMermaid = className.some((c) => String(c).includes("language-mermaid"));
      if (!isMermaid) return;
      const diagram = toString(code);
      const mermaidDiv: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: diagram }]
      };
      parent.children[index] = mermaidDiv;
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
