import { toString } from "hast-util-to-string";
import { fromHtml } from "hast-util-from-html";
import type { Root, Element } from "hast";
import { createHighlighter } from "shiki";

export interface ShikiOptions {
	theme: string;
}

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter(theme: string) {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: [theme],
			langs: []
		});
	}
	return highlighterPromise;
}

export function rehypeShiki(options: ShikiOptions) {
  return async (tree: Root) => {
    const highlighter = await getHighlighter(options.theme);

    const tasks: Array<Promise<void>> = [];

    walkTree(tree as unknown as Element, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName !== "pre") return;

      const code = node.children[0] as Element | undefined;
      if (!code || code.tagName !== "code") return;

			const className = Array.isArray(code.properties?.className) ? code.properties?.className : [];
			const langClass = className.find((c) => String(c).startsWith("language-"));
			const lang = langClass ? String(langClass).replace("language-", "") : "text";

			const codeText = toString(code);

			tasks.push(
				(async () => {
					try {
						if (lang && lang !== "text") {
							await highlighter.loadLanguage(lang);
						}
					} catch {
						// fallback to plain text
					}

					const highlighted = highlighter.codeToHtml(codeText, {
						lang: lang || "text",
						theme: options.theme
					});

					const fragment = fromHtml(highlighted, { fragment: true });
					const replacement = fragment.children[0] as Element | undefined;
          if (replacement) {
            parent.children[index] = replacement;
          }
        })()
      );
    });

    await Promise.all(tasks);
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
