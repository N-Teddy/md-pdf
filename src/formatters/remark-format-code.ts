import { visit } from "unist-util-visit";
import { formatCode, FormatterOptions, normalizeLanguage } from "./registry.js";

export interface FormatCodeOptions {
  formatter: FormatterOptions;
}

export function remarkFormatCode(options: FormatCodeOptions) {
  return async (tree: unknown) => {
    const tasks: Array<Promise<void>> = [];

    visit(tree as any, "code", (node: any) => {
      const lang = normalizeLanguage(node.lang);
      if (!lang) return;

      tasks.push(
        (async () => {
          const formatted = await formatCode(node.value, lang, options.formatter);
          if (formatted !== null) {
            node.value = formatted;
          }
        })()
      );
    });

    await Promise.all(tasks);
  };
}
