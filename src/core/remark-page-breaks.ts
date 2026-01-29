import { visit } from "unist-util-visit";
import type { Root, Paragraph, Text } from "mdast";

const PAGE_BREAK = "__MD2PDF_PAGE_BREAK__";
const SECTION_BREAK = "__MD2PDF_SECTION_BREAK__";

export function remarkPageBreaks() {
  return (tree: Root) => {
    visit(tree, "html", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      const value = String((node as { value?: string }).value ?? "").trim();
      if (value === "<!-- page-break -->") {
        parent.children[index] = paragraphWithToken(PAGE_BREAK);
      } else if (value === "<!-- section-break -->") {
        parent.children[index] = paragraphWithToken(SECTION_BREAK);
      }
    });
  };
}

function paragraphWithToken(token: string): Paragraph {
  return {
    type: "paragraph",
    children: [{ type: "text", value: token } as Text]
  };
}

export const PAGE_BREAK_TOKEN = PAGE_BREAK;
export const SECTION_BREAK_TOKEN = SECTION_BREAK;
