// @ts-nocheck
import PDFDocument from "pdfkit";
import { htmlToText } from "html-to-text";
import type { RenderOptions, Renderer } from "./types.js";

export class LiteRenderer implements Renderer {
  name = "lite" as const;

  async render(options: RenderOptions): Promise<Buffer> {
    const text = htmlToText(options.html, {
      wordwrap: 100,
      selectors: [
        { selector: "h1", options: { uppercase: false } },
        { selector: "h2", options: { uppercase: false } }
      ]
    });

    const doc = new PDFDocument({
      size: parsePageSize(options.pageSize),
      margins: parseMargin(options.margin)
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const result = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(12).text(text, {
      align: "left"
    });

    doc.end();

    return result;
  }
}

function parseMargin(margin: string) {
  const parts = margin.split(",").map((part) => part.trim());
  const top = parts[0] || "72";
  const right = parts[1] || top;
  const bottom = parts[2] || top;
  const left = parts[3] || right;
  return {
    top: toPoints(top),
    right: toPoints(right),
    bottom: toPoints(bottom),
    left: toPoints(left)
  };
}

function parsePageSize(pageSize: string) {
  if (pageSize.includes("x")) {
    const [width, height] = pageSize.split("x").map((v) => v.trim());
    return [toPoints(width), toPoints(height)];
  }
  return pageSize as any;
}

function toPoints(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.endsWith("in")) {
    return parseFloat(normalized.replace("in", "")) * 72;
  }
  if (normalized.endsWith("cm")) {
    return parseFloat(normalized.replace("cm", "")) * (72 / 2.54);
  }
  if (normalized.endsWith("mm")) {
    return parseFloat(normalized.replace("mm", "")) * (72 / 25.4);
  }
  if (normalized.endsWith("pt")) {
    return parseFloat(normalized.replace("pt", ""));
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 72;
}
