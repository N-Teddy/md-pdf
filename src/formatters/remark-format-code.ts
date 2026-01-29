import { formatCode, FormatterOptions, normalizeLanguage } from "./registry.js";

export interface FormatCodeOptions {
  formatter: FormatterOptions;
}

export function remarkFormatCode(options: FormatCodeOptions) {
  return async (tree: unknown) => {
    const tasks: Array<Promise<void>> = [];

    walkTree(tree, (node) => {
      if (!node || typeof node !== "object") return;
      if ((node as any).type !== "code") return;
      const codeNode = node as { lang?: string; value?: string };
      const lang: string = normalizeLanguage(codeNode.lang ?? "text");
      if (typeof codeNode.value !== "string") return;

      tasks.push(
        (async () => {
          const formatted = await formatCode(codeNode.value as string, lang as string, options.formatter);
          if (formatted !== null) {
            codeNode.value = formatted;
          }
        })()
      );
    });

    await Promise.all(tasks);
  };
}

function walkTree(node: unknown, visitor: (node: unknown) => void) {
  if (!node || typeof node !== "object") return;
  visitor(node);
  const children = (node as { children?: unknown[] }).children;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child && typeof child === "object") {
        walkTree(child, visitor);
      }
    }
  }
}
