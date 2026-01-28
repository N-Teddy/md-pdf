import { chromium } from "playwright";
import type { PDFOptions } from "playwright";
import type { RenderOptions, Renderer } from "./types.js";

export class ChromiumRenderer implements Renderer {
  name = "chromium" as const;

  async render(options: RenderOptions): Promise<Buffer> {
    const browser = await chromium.launch({ headless: true });
    const blockedRequests: string[] = [];

    try {
      const context = await browser.newContext({
        deviceScaleFactor: 1,
        timezoneId: "UTC",
        locale: "en-US"
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

      await page.setContent(options.html, { waitUntil: "load", baseURL: options.baseUrl });
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

      const pdfOptions: PDFOptions = {
        printBackground: true,
        displayHeaderFooter: options.headerFooter.displayHeaderFooter,
        headerTemplate: options.headerFooter.headerTemplate,
        footerTemplate: options.headerFooter.footerTemplate,
        margin: parseMargin(options.margin)
      };

      const pageSize = options.pageSize.trim();
      if (pageSize.includes("x")) {
        const [width, height] = pageSize.split("x").map((v) => v.trim());
        pdfOptions.width = width;
        pdfOptions.height = height;
      } else {
        pdfOptions.format = pageSize as PDFOptions["format"];
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
}

function parseMargin(margin: string) {
  const parts = margin.split(",").map((part) => part.trim());
  const top = parts[0] || "1in";
  const right = parts[1] || top;
  const bottom = parts[2] || top;
  const left = parts[3] || right;

  return { top, right, bottom, left };
}
