import { toString } from "hast-util-to-string";
import { fromHtml } from "hast-util-from-html";
import type { Root, Element } from "hast";
import { createHighlighter, type Highlighter } from "shiki";

export interface ShikiOptions {
  defaultTheme: string;
  themeByLanguage?: Record<string, string>;
}

const highlighterCache = new Map<string, { highlighter: Highlighter; themes: Set<string> }>();

export function rehypeShiki(options: ShikiOptions) {
  return async (tree: Root) => {
    const { highlighter, themes } = await getHighlighter(options.defaultTheme, options.themeByLanguage);

    const tasks: Array<Promise<void>> = [];

    walkTree(tree as unknown as Element, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName !== "pre") return;

      const code = node.children[0] as Element | undefined;
      if (!code || code.tagName !== "code") return;

      const className = Array.isArray(code.properties?.className) ? code.properties?.className : [];
      const langClass = className.find((c) => String(c).startsWith("language-"));
      const rawLang = langClass ? String(langClass).replace("language-", "") : "text";
      const lang = normalizeLanguage(rawLang);

      const codeText = toString(code);

      const themeForLang = resolveTheme(options.defaultTheme, options.themeByLanguage, lang, themes);

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
            theme: themeForLang
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

async function getHighlighter(defaultTheme: string, themeByLanguage?: Record<string, string>) {
  const themeList = buildThemeList(defaultTheme, themeByLanguage);
  const key = themeList.join("|");

  const cached = highlighterCache.get(key);
  if (cached) return cached;

  try {
    const highlighter = await createHighlighter({ themes: themeList, langs: [] });
    const entry = { highlighter, themes: new Set(themeList) };
    highlighterCache.set(key, entry);
    return entry;
  } catch {
    const highlighter = await createHighlighter({ themes: [defaultTheme], langs: [] });
    const entry = { highlighter, themes: new Set([defaultTheme]) };
    highlighterCache.set(defaultTheme, entry);
    return entry;
  }
}

function buildThemeList(defaultTheme: string, themeByLanguage?: Record<string, string>) {
  const set = new Set<string>([defaultTheme]);
  if (themeByLanguage) {
    for (const value of Object.values(themeByLanguage)) {
      if (value) set.add(value);
    }
  }
  return Array.from(set).sort();
}

function resolveTheme(
  defaultTheme: string,
  themeByLanguage: Record<string, string> | undefined,
  lang: string,
  themes: Set<string>
) {
  const mapped = themeByLanguage?.[lang];
  if (mapped && themes.has(mapped)) return mapped;
  return themes.has(defaultTheme) ? defaultTheme : Array.from(themes)[0];
}

function normalizeLanguage(lang: string) {
  const cleaned = lang.split(/\s+/)[0].toLowerCase();
  if (!cleaned) return "text";

  const aliases: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    yml: "yaml"
  };

  return aliases[cleaned] ?? cleaned;
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
