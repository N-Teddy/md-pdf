import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import chokidar from "chokidar";
import prompts from "prompts";
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

program
  .command("wizard")
  .description("Interactive setup to generate PDFs")
  .action(async () => {
    await runWizard();
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

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  if (isInteractive()) {
    runWizard().catch((err) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(2);
    });
  } else {
    console.error("No args provided. Run in a TTY for interactive mode or pass CLI flags.");
    program.outputHelp();
    process.exit(1);
  }
} else {
  program.parse(process.argv);
}

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

async function runWizard() {
  if (!isInteractive()) {
    console.error("Interactive wizard requires a TTY.");
    process.exit(1);
  }

  const onCancel = () => {
    console.error("Wizard cancelled.");
    process.exit(1);
  };

  const inputAnswer = await prompts(
    {
      type: "text",
      name: "input",
      message: "Enter input path (file, folder, or glob)",
      validate: async (value) => {
        if (!value) return "Input is required";
        const inputs = await resolveInputs(value);
        return inputs.length > 0 ? true : "No inputs found for this input";
      }
    },
    { onCancel }
  );

  if (!inputAnswer.input) {
    process.exit(1);
  }

  const inputs = await resolveInputs(inputAnswer.input);
  const multiple = inputs.length > 1;

  const outputAnswer = await prompts(
    {
      type: "text",
      name: multiple ? "outDir" : "output",
      message: multiple ? "Enter output directory" : "Enter output PDF path",
      initial: multiple
        ? "./output"
        : path.join(
            path.dirname(inputs[0]),
            `${path.basename(inputs[0], path.extname(inputs[0]))}.pdf`
          ),
      validate: (value) => (value ? true : "Output path is required")
    },
    { onCancel }
  );

  const rendererAnswer = await prompts(
    {
      type: "select",
      name: "renderer",
      message: "Choose renderer",
      choices: [
        { title: "Chromium (print-ready)", value: "chromium" },
        { title: "Lite (fallback)", value: "lite" }
      ],
      initial: 0
    },
    { onCancel }
  );

  const themeModeAnswer = await prompts(
    {
      type: "select",
      name: "themeMode",
      message: "Theme source",
      choices: [
        { title: "Default theme", value: "default" },
        { title: "Custom theme file", value: "file" },
        { title: "Custom theme directory", value: "dir" }
      ],
      initial: 0
    },
    { onCancel }
  );

  let themeFile: string | undefined;
  let themeDir: string | undefined;
  if (themeModeAnswer.themeMode === "file") {
    const answer = await prompts(
      {
        type: "text",
        name: "themeFile",
        message: "Path to theme CSS file",
        validate: async (value) => {
          if (!value) return "Theme file path is required";
          try {
            await fs.access(path.resolve(value));
            return true;
          } catch {
            return "Theme file not found";
          }
        }
      },
      { onCancel }
    );
    themeFile = answer.themeFile;
  } else if (themeModeAnswer.themeMode === "dir") {
    const answer = await prompts(
      {
        type: "text",
        name: "themeDir",
        message: "Path to theme directory",
        validate: async (value) => {
          if (!value) return "Theme directory is required";
          try {
            const stat = await fs.stat(path.resolve(value));
            return stat.isDirectory() ? true : "Theme path must be a directory";
          } catch {
            return "Theme directory not found";
          }
        }
      },
      { onCancel }
    );
    themeDir = answer.themeDir;
  }

  const featureAnswers = await prompts(
    [
      {
        type: rendererAnswer.renderer === "chromium" ? "toggle" : null,
        name: "formatCode",
        message: "Format code blocks? (chromium only)",
        initial: true,
        active: "yes",
        inactive: "no"
      },
      { type: "toggle", name: "toc", message: "Generate table of contents?", initial: false },
      { type: "toggle", name: "footnotes", message: "Enable footnotes?", initial: true },
      { type: "toggle", name: "mermaid", message: "Enable Mermaid diagrams?", initial: false },
      { type: "toggle", name: "math", message: "Enable math (KaTeX)?", initial: false },
      { type: "toggle", name: "frontmatter", message: "Enable frontmatter?", initial: true },
      { type: "toggle", name: "allowRemote", message: "Allow remote assets?", initial: false }
    ],
    { onCancel }
  );

  const coverAnswer = await prompts(
    {
      type: "text",
      name: "coverPath",
      message: "Cover page markdown (optional)",
      validate: async (value) => {
        if (!value) return true;
        try {
          await fs.access(path.resolve(value));
          return true;
        } catch {
          return "Cover file not found";
        }
      }
    },
    { onCancel }
  );

  const headerAnswer = await prompts(
    {
      type: "text",
      name: "title",
      message: "Header title (optional)"
    },
    { onCancel }
  );

  const footerAnswer = await prompts(
    {
      type: "toggle",
      name: "pageNumbers",
      message: "Show page numbers in footer?",
      initial: true,
      active: "yes",
      inactive: "no"
    },
    { onCancel }
  );

  const saveAnswer = await prompts(
    {
      type: "toggle",
      name: "saveConfig",
      message: "Save these options to md2pdf.config.json?",
      initial: false,
      active: "yes",
      inactive: "no"
    },
    { onCancel }
  );

  if (saveAnswer.saveConfig) {
    const configPath = path.join(process.cwd(), "md2pdf.config.json");
    const exists = await fileExists(configPath);
    if (exists) {
      const overwrite = await prompts(
        {
          type: "toggle",
          name: "overwrite",
          message: "Config file exists. Overwrite?",
          initial: false,
          active: "yes",
          inactive: "no"
        },
        { onCancel }
      );
      if (!overwrite.overwrite) {
        console.log("Keeping existing config file.");
      } else {
        await writeWizardConfig(configPath, {
          inputs: inputAnswer.input,
          output: outputAnswer.output,
          outDir: outputAnswer.outDir,
          renderer: rendererAnswer.renderer,
          theme: themeModeAnswer.themeMode === "default" ? "default" : undefined,
          themeFile,
          themeDir,
          coverPath: coverAnswer.coverPath || undefined,
          toc: featureAnswers.toc,
          footnotes: featureAnswers.footnotes,
          mermaid: featureAnswers.mermaid,
          math: featureAnswers.math,
          frontmatter: featureAnswers.frontmatter,
          allowRemote: featureAnswers.allowRemote,
          formatCode: featureAnswers.formatCode,
          header: headerAnswer.title ? { title: headerAnswer.title } : undefined,
          footer: { pageNumbers: footerAnswer.pageNumbers }
        });
      }
    } else {
      await writeWizardConfig(configPath, {
        inputs: inputAnswer.input,
        output: outputAnswer.output,
        outDir: outputAnswer.outDir,
        renderer: rendererAnswer.renderer,
        theme: themeModeAnswer.themeMode === "default" ? "default" : undefined,
        themeFile,
        themeDir,
        coverPath: coverAnswer.coverPath || undefined,
        toc: featureAnswers.toc,
        footnotes: featureAnswers.footnotes,
        mermaid: featureAnswers.mermaid,
        math: featureAnswers.math,
        frontmatter: featureAnswers.frontmatter,
        allowRemote: featureAnswers.allowRemote,
        formatCode: featureAnswers.formatCode,
        header: headerAnswer.title ? { title: headerAnswer.title } : undefined,
        footer: { pageNumbers: footerAnswer.pageNumbers }
      });
      console.log(`Saved ${configPath}`);
    }
  }

  for (const inputPath of inputs) {
    await assertFileExists(inputPath);
    const outputPath = outputAnswer.output
      ? outputAnswer.output
      : path.join(
          outputAnswer.outDir,
          `${path.basename(inputPath, path.extname(inputPath))}.pdf`
        );

    await convertMarkdownToPdf(
      { inputPath },
      {
        outputPath,
        theme: themeModeAnswer.themeMode === "default" ? "default" : undefined,
        themeFile,
        themeDir,
        coverPath: coverAnswer.coverPath || undefined,
        toc: featureAnswers.toc,
        footnotes: featureAnswers.footnotes,
        mermaid: featureAnswers.mermaid,
        math: featureAnswers.math,
        frontmatter: featureAnswers.frontmatter,
        allowRemote: featureAnswers.allowRemote,
        renderer: rendererAnswer.renderer,
        formatCode: rendererAnswer.renderer === "chromium" ? featureAnswers.formatCode : false,
        header: headerAnswer.title ? { title: headerAnswer.title } : undefined,
        footer: { pageNumbers: footerAnswer.pageNumbers }
      }
    );

    console.log(`Generated ${outputPath}`);
  }
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

async function writeWizardConfig(
  configPath: string,
  config: Record<string, unknown>
) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
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
