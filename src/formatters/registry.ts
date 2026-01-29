import prettier from "prettier";

export interface FormatterOptions {
  useTabs?: boolean;
  printWidth?: number;
  tabWidth?: number;
}

const PARSER_BY_LANGUAGE: Record<string, prettier.BuiltInParserName> = {
  js: "babel",
  javascript: "babel",
  jsx: "babel",
  ts: "typescript",
  typescript: "typescript",
  tsx: "babel-ts",
  json: "json",
  jsonc: "json",
  html: "html",
  css: "css",
  scss: "scss",
  md: "markdown",
  markdown: "markdown",
  yaml: "yaml",
  yml: "yaml",
  graphql: "graphql"
};

export function normalizeLanguage(lang: string | undefined): string | undefined {
  if (!lang) return undefined;
  const cleaned = lang.split(/\s+/)[0].toLowerCase();
  if (!cleaned) return undefined;
  return cleaned;
}

export function getParserForLanguage(
  lang: string | undefined
): prettier.BuiltInParserName | undefined {
  const normalized = normalizeLanguage(lang);
  if (!normalized) return undefined;
  return PARSER_BY_LANGUAGE[normalized];
}

export async function formatCode(
  code: string,
  lang: string | undefined,
  options: FormatterOptions
): Promise<string | null> {
  const parser = getParserForLanguage(lang);
  if (!parser) return null;

  try {
    const formatted = await prettier.format(code, {
      parser,
      useTabs: options.useTabs ?? true,
      printWidth: options.printWidth,
      tabWidth: options.tabWidth
    });
    return formatted.trimEnd();
  } catch {
    return null;
  }
}
