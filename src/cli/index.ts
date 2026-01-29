import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import chokidar from "chokidar";
import { convertMarkdownToPdf } from "../index.js";
import { loadConfig } from "../config/loadConfig.js";

const program = new Command();

program.name("md2pdf").description("Convert Markdown to print-ready PDF");

program
  .command("init")
  .description("Scaffold a config file and theme folder")
  .option("--force", "Overwrite existing files", false)
  .action(async (opts) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, "md2pdf.config.json");
    const themeDir = path.join(cwd, "themes", "custom");

    const exists = await fileExists(configPath);
    if (exists && !opts.force) {
      console.error("Config already exists. Use --force to overwrite.");
      process.exit(1);
    }

    await fs.mkdir(path.join(themeDir, "templates"), { recursive: true });

    await fs.writeFile(
      configPath,
      JSON.stringify(
        {
          themeDir: "./themes/custom",
          pageSize: "A4",
          margin: "1in,1in,1in,1in",
          toc: true,
          footnotes: true,
          mermaid: true,
          math: true,
          frontmatter: true,
          renderer: "chromium"
        },
        null,
        2
      )
    );

    await fs.writeFile(
      path.join(themeDir, "theme.css"),
      `:root {\n  --font-body: "Noto Serif";\n  --font-heading: "Noto Sans";\n}\n\nbody {\n  font-family: var(--font-body), serif;\n}\n`
    );

    await fs.writeFile(
      path.join(themeDir, "templates", "header.html"),
      `<style>\n  .hf-root { font-size: 9px; color: #666; padding: 0 12px; }\n  .hf-title { text-align: left; }\n</style>\n<div class="hf-root">\n  <div class="hf-title">{{title}}</div>\n</div>\n`
    );

    await fs.writeFile(
      path.join(themeDir, "templates", "footer.html"),
      `<style>\n  .hf-root { font-size: 9px; color: #666; padding: 0 12px; }\n  .hf-page { text-align: right; }\n</style>\n<div class="hf-root">\n  <div class="hf-page">\n    <span class="pageNumber"></span> / <span class="totalPages"></span>\n  </div>\n</div>\n`
    );

    console.log(`Created ${configPath}`);
    console.log(`Created ${themeDir}`);
  });

const renderCommand = new Command("render")
  .argument("[input]", "Markdown file, glob, or folder")
  .option("-o, --output <file>", "Output PDF file (single input)")
  .option("--out-dir <dir>", "Output directory for multiple inputs")
  .option("--theme <name>", "Built-in theme name")
  .option("--theme-file <path>", "Custom theme CSS file")
  .option("--theme-dir <path>", "Custom theme directory")
  .option("--cover <path>", "Markdown file for cover page")
  .option("--page-size <size>", "A4, Letter, or custom e.g. 8.5in x 11in")
  .option("--margin <sizes>", "top,right,bottom,left")
  .option("--toc", "Generate table of contents")
  .option("--footnotes", "Enable footnotes")
  .option("--mermaid", "Enable Mermaid diagrams")
  .option("--math", "Enable KaTeX math")
  .option("--frontmatter", "Enable frontmatter parsing")
  .option("--format-code", "Format code blocks (chromium only)")
  .option("--formatter-print-width <n>", "Prettier print width", Number.parseInt)
  .option("--formatter-tabs", "Use tabs for formatted code")
  .option("--theme-map <path>", "JSON map of language -> theme")
  .option("--allow-remote", "Allow remote images/assets")
  .option("--renderer <name>", "Renderer: chromium or lite")
  .option("--title <title>", "Header title")
  .option("--no-page-numbers", "Disable footer page numbers")
  .option("--config <path>", "Config file path")
  .action(async (inputArg, opts, cmd) => {
    await runConversion({ inputArg, opts, cmd, watch: false });
  });

program
  .command("watch")
  .description("Watch files and re-render on changes")
  .argument("[input]", "Markdown file, glob, or folder")
  .option("--out-dir <dir>", "Output directory for multiple inputs")
  .option("--config <path>", "Config file path")
  .option("--renderer <name>", "Renderer: chromium or lite")
  .action(async (inputArg, opts, cmd) => {
    await runConversion({ inputArg, opts, cmd, watch: true });
  });

program.addCommand(renderCommand, { isDefault: true });

program.parse(process.argv);

async function runConversion({
  inputArg,
  opts,
  cmd,
  watch
}: {
  inputArg: string | undefined;
  opts: Record<string, any>;
  cmd: Command;
  watch: boolean;
}) {
  const cwd = process.cwd();
  const configResult = await loadConfig(cwd, opts.config);
  const config = configResult.config ?? {};

  const cliOptions = pickCliOptions(cmd, opts, [
    "output",
    "outDir",
    "theme",
    "themeFile",
    "themeDir",
    "cover",
    "pageSize",
    "margin",
    "toc",
    "footnotes",
    "mermaid",
    "math",
    "frontmatter",
    "formatCode",
    "formatterPrintWidth",
    "formatterTabs",
    "themeMap",
    "allowRemote",
    "renderer",
    "title",
    "pageNumbers"
  ]);

  const resolvedInput = inputArg ?? config.inputs ?? "";
  if (!resolvedInput || (Array.isArray(resolvedInput) && resolvedInput.length === 0)) {
    console.error("No input provided and no config.inputs found.");
    process.exit(1);
  }

  const inputList = Array.isArray(resolvedInput) ? resolvedInput : [resolvedInput];
  const inputSets = await Promise.all(inputList.map((input) => resolveInputs(input)));
  const inputs = Array.from(new Set(inputSets.flat())).sort();
  if (inputs.length === 0) {
    console.error(`No inputs found for: ${Array.isArray(resolvedInput) ? resolvedInput.join(", ") : resolvedInput}`);
    process.exit(4);
  }

  const outDir = cliOptions.outDir ?? config.outDir;
  const outputSingle = cliOptions.output ?? config.output;
  const formatterFromConfig = config.formatter ?? {};
  const formatter = mergeFormatterOptions(formatterFromConfig, cliOptions);
  const themeByLanguage = await loadThemeMap(cliOptions.themeMap, config.themeByLanguage);

  if (inputs.length > 1 && !outDir) {
    console.error("Multiple inputs require --out-dir or config.outDir");
    process.exit(1);
  }

  if (inputs.length === 1 && !outputSingle && !outDir) {
    console.error("Provide --output for single input or --out-dir for batch");
    process.exit(1);
  }

  const runOnce = async () => {
    for (const inputPath of inputs) {
      await assertFileExists(inputPath);

      const outputPath = outputSingle
        ? outputSingle
        : path.join(outDir, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);

      await convertMarkdownToPdf(
        { inputPath },
        {
          outputPath,
          pageSize: cliOptions.pageSize ?? config.pageSize,
          margin: cliOptions.margin ?? config.margin,
          theme: cliOptions.theme ?? config.theme,
          themeFile: cliOptions.themeFile ?? config.themeFile,
          themeDir: cliOptions.themeDir ?? config.themeDir,
          coverPath: cliOptions.cover ?? config.coverPath,
          toc: cliOptions.toc ?? config.toc,
          footnotes: cliOptions.footnotes ?? config.footnotes,
          mermaid: cliOptions.mermaid ?? config.mermaid,
          math: cliOptions.math ?? config.math,
          frontmatter: cliOptions.frontmatter ?? config.frontmatter,
          formatCode: cliOptions.formatCode ?? config.formatCode,
          formatter,
          themeByLanguage,
          allowRemote: cliOptions.allowRemote ?? config.allowRemote,
          renderer: cliOptions.renderer ?? config.renderer,
          fallbackRenderer: config.fallbackRenderer,
          header: cliOptions.title ? { title: cliOptions.title } : config.header,
          footer: {
            pageNumbers:
              cliOptions.pageNumbers !== undefined
                ? cliOptions.pageNumbers
                : config.footer?.pageNumbers
          },
          plugins: config.plugins
        }
      );

      if (!outputSingle) {
        console.log(`Generated ${outputPath}`);
      }
    }
  };

  if (!watch) {
    await runOnce();
    return;
  }

  console.log("Watching for changes...");
  const watcher = chokidar.watch(inputs, { ignoreInitial: true });
  let timer: NodeJS.Timeout | undefined;

  watcher.on("all", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      runOnce().catch((err) => console.error(err));
    }, 300);
  });
}

function pickCliOptions(cmd: Command, opts: Record<string, any>, keys: string[]) {
  const result: Record<string, any> = {};
  for (const key of keys) {
    const source = cmd.getOptionValueSource(key as any);
    if (source === "cli") {
      result[key] = opts[key];
    }
  }
  return result;
}

async function resolveInputs(inputArg: string): Promise<string[]> {
  const isGlob = /[*?{}()[\]]/.test(inputArg);

  if (isGlob) {
    const files = await fg(inputArg, { onlyFiles: true, absolute: true });
    return files.sort();
  }

  const resolved = path.resolve(inputArg);
  try {
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      const files = await fg(path.join(resolved, "**/*.md"), { onlyFiles: true, absolute: true });
      return files.sort();
    }
  } catch {
    // fallthrough
  }

  return [resolved];
}

async function assertFileExists(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    console.error(`File not found: ${filePath}`);
    process.exit(4);
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function mergeFormatterOptions(
  base: { useTabs?: boolean; printWidth?: number; tabWidth?: number },
  cliOptions: Record<string, any>
) {
  const result = { ...base };
  if (cliOptions.formatterPrintWidth !== undefined) {
    const value = Number(cliOptions.formatterPrintWidth);
    if (Number.isFinite(value)) {
      result.printWidth = value;
    }
  }
  if (cliOptions.formatterTabs !== undefined) {
    result.useTabs = Boolean(cliOptions.formatterTabs);
  }
  return result;
}

async function loadThemeMap(
  cliPath: string | undefined,
  configMap: Record<string, string> | undefined
) {
  let cliMap: Record<string, string> | undefined;
  if (cliPath) {
    const raw = await fs.readFile(path.resolve(cliPath), "utf8");
    cliMap = JSON.parse(raw) as Record<string, string>;
  }
  if (!configMap && !cliMap) return undefined;
  return { ...(configMap ?? {}), ...(cliMap ?? {}) };
}
