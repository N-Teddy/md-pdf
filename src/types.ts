export type ConvertInput = { inputPath: string } | { input: string; baseDir?: string };

export interface HeaderFooterOptions {
	title?: string;
	pageNumbers?: boolean;
	templateHtml?: string;
}

export interface ConvertOptions {
	outputPath?: string;
	pageSize?: "A4" | "Letter" | string;
	margin?: string;
	theme?: string;
	themeFile?: string;
	coverPath?: string;
	header?: HeaderFooterOptions;
	footer?: HeaderFooterOptions;
	toc?: boolean;
	mermaid?: boolean;
	math?: boolean;
	allowRemote?: boolean;
	remarkPlugins?: any[];
	rehypePlugins?: any[];
	timeoutMs?: number;
	debug?: boolean;
}
