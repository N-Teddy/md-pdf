import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

export function rehypeMermaid() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent) => {
			if (!parent || typeof index !== "number") return;
			if (node.tagName !== "pre") return;
			const code = node.children[0] as Element | undefined;
			if (!code || code.tagName !== "code") return;
			const className = Array.isArray(code.properties?.className) ? code.properties?.className : [];
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
