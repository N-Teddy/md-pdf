import { chromium } from "playwright";
import { buildHeaderFooterTemplates } from "./headerFooter.js";

export interface RenderPdfOptions {
	html: string;
	baseUrl: string;
	pageSize: string;
	margin: string;
	header?: { title?: string } | undefined;
	footer?: { pageNumbers?: boolean } | undefined;
	allowRemote: boolean;
	timeoutMs: number;
	mermaid: boolean;
}

export async function renderPdf(options: RenderPdfOptions): Promise<Buffer> {
	const browser = await chromium.launch({
		headless: true
	});

	const blockedRequests: string[] = [];

	try {
		const context = await browser.newContext({
			deviceScaleFactor: 1,
			timezoneId: "UTC"
		});

		const page = await context.newPage();
		page.setDefaultTimeout(options.timeoutMs);

		if (!options.allowRemote) {
			await page.route("**/*", (route) => {
				const url = route.request().url();
				if (url.startsWith("http://") || url.startsWith("https://")) {
					blockedRequests.push(url);
					return route.abort();
				}
				return route.continue();
			});
		}

		await page.setContent(options.html);
		await page.emulateMedia({ media: "print" });
		await page.evaluate(() => (document as any).fonts?.ready ?? Promise.resolve());

		if (options.mermaid) {
			await page.evaluate(async () => {
				const mermaid = (window as any).mermaid;
				if (!mermaid) return;
				mermaid.initialize({
					startOnLoad: false,
					theme: "neutral",
					securityLevel: "strict",
					deterministicIds: true
				});
				await mermaid.run({ querySelector: ".mermaid" });
			});
			await page.evaluate(() => (document as any).fonts?.ready ?? Promise.resolve());
		}

		const { headerTemplate, footerTemplate, displayHeaderFooter } = buildHeaderFooterTemplates({
			header: options.header,
			footer: options.footer
		});

		const pdfOptions: any = {
			printBackground: true,
			displayHeaderFooter,
			headerTemplate,
			footerTemplate,
			margin: parseMargin(options.margin)
		};

		const pageSize = options.pageSize.trim();
		if (pageSize.includes("x")) {
			const [width, height] = pageSize.split("x").map((v) => v.trim());
			pdfOptions.width = width;
			pdfOptions.height = height;
	} else {
		pdfOptions.format = pageSize;
	}

		const pdf = await page.pdf(pdfOptions);

		await context.close();

		if (blockedRequests.length > 0) {
			throw new Error(`Remote resources blocked: ${blockedRequests[0]}`);
		}

		return pdf;
	} finally {
		await browser.close();
	}
}

function parseMargin(margin: string) {
	const parts = margin.split(",").map((part) => part.trim());
	const top = parts[0] || "1in";
	const right = parts[1] || top;
	const bottom = parts[2] || top;
	const left = parts[3] || right;

	return { top, right, bottom, left };
}
