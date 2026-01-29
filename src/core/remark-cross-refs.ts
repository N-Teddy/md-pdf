import type { Root, Parent } from "mdast";

const REF_RE = /@ref\(([^)]+)\)/g;
const SKIP_PARENTS = new Set(["code", "inlineCode", "link"]);

export function remarkCrossRefs() {
  return (tree: Root) => {
    walkTree(tree as unknown as Parent);
  };
}

function walkTree(node: Parent) {
  if (!node || typeof node !== "object") return;
  const children = (node as { children?: unknown[] }).children;
  if (!Array.isArray(children)) return;

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i] as Parent & { type?: string; value?: string };
    if (!child || typeof child !== "object") continue;

    if (child.type === "text" && typeof child.value === "string" && !SKIP_PARENTS.has(node.type)) {
      const replaced = replaceRefs(child.value);
      if (replaced) {
        children.splice(i, 1, ...replaced);
        i += replaced.length - 1;
        continue;
      }
    }

    if ((child as { children?: unknown[] }).children) {
      walkTree(child as Parent);
    }
  }
}

function replaceRefs(value: string) {
  REF_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  const nodes: any[] = [];

  while ((match = REF_RE.exec(value))) {
    const [full, idRaw] = match;
    const id = String(idRaw).trim();
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    nodes.push({
      type: "link",
      url: `#${id}`,
      children: [{ type: "text", value: id }]
    });
    lastIndex = match.index + full.length;
  }

  if (nodes.length === 0) return null;
  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }

  return nodes;
}
