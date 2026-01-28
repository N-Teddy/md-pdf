import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { convertMarkdownToPdf } from "../index.js";

const program = new Command();

program
	.name("md2pdf")
	.description("Convert Markdown to print-ready PDF")
	.argument("<input>", "Markdown file, glob, or folder")
	.option("-o, --output <file>", "Output PDF file (single input)")
	.option("--out-dir <dir>", "Output directory for multiple inputs")
	.option("--theme <name>", "Built-in theme name", "default")
	.option("--theme-file <path>", "Custom theme CSS file")
	.option("--cover <path>", "Markdown file for cover page")
	.option("--page-size <size>", "A4, Letter, or custom e.g. 8.5in x 11in", "A4")
	.option("--margin <sizes>", "top,right,bottom,left", "1in,1in,1in,1in")
	.option("--toc", "Generate table of contents", false)
	.option("--mermaid", "Enable Mermaid diagrams", false)
	.option("--math", "Enable KaTeX math", false)
	.option("--allow-remote", "Allow remote images/assets", false)
	.option("--title <title>", "Header title")
	.option("--no-page-numbers", "Disable footer page numbers")
	.action(async (inputArg, opts) => {
		try {
			const inputs = await resolveInputs(inputArg);
			if (inputs.length === 0) {
				console.error(`No inputs found for: ${inputArg}`);
				process.exit(4);
			}

			const outputSingle = opts.output;
			const outputDir = opts.outDir;

			if (inputs.length > 1 && !outputDir) {
				console.error("Multiple inputs require --out-dir");
				process.exit(1);
			}

			if (inputs.length === 1 && !outputSingle && !outputDir) {
				console.error("Provide --output for single input or --out-dir for batch");
				process.exit(1);
			}

			for (const inputPath of inputs) {
				try {
					await fs.access(inputPath);
				} catch {
					console.error(`File not found: ${inputPath}`);
					process.exit(4);
				}
			}

			for (const inputPath of inputs) {
				const outputPath = outputSingle
					? outputSingle
					: path.join(outputDir, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);

				await convertMarkdownToPdf(
					{ inputPath },
					{
						outputPath,
						pageSize: opts.pageSize,
						margin: opts.margin,
						theme: opts.theme,
						themeFile: opts.themeFile,
						coverPath: opts.cover,
						toc: opts.toc,
						mermaid: opts.mermaid,
						math: opts.math,
						allowRemote: opts.allowRemote,
						header: opts.title ? { title: opts.title } : undefined,
						footer: { pageNumbers: opts.pageNumbers }
					}
				);

				if (!outputSingle) {
					console.log(`Generated ${outputPath}`);
				}
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(message);
			process.exit(2);
		}
	});

program.parse(process.argv);

async function resolveInputs(inputArg: string): Promise<string[]> {
	const isGlob = /[*?{}()[\]]/.test(inputArg);

	if (isGlob) {
		return fg(inputArg, { onlyFiles: true, absolute: true });
	}

	const resolved = path.resolve(inputArg);
	try {
		const stat = await fs.stat(resolved);
		if (stat.isDirectory()) {
			return fg(path.join(resolved, "**/*.md"), { onlyFiles: true, absolute: true });
		}
	} catch {
		// fallthrough
	}

	return [resolved];
}
