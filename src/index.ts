export type { ConvertInput, ConvertOptions, HeaderFooterOptions } from "./types.js";
import type { ConvertInput, ConvertOptions } from "./types.js";
import { convertMarkdownToPdfInternal } from "./core/convert.js";

export async function convertMarkdownToPdf(
	input: ConvertInput,
	options: ConvertOptions = {}
): Promise<Buffer | void> {
	return convertMarkdownToPdfInternal(input, options);
}
