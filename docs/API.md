# API

## Primary Function
```ts
export type ConvertInput =
  | { inputPath: string }
  | { input: string; baseDir?: string };

export interface HeaderFooterOptions {
  title?: string;
  pageNumbers?: boolean;
  templateHtml?: string;
}

export interface ConvertOptions {
  outputPath?: string;           // If omitted, return Buffer
  pageSize?: "A4" | "Letter" | string;
  margin?: string;               // "top,right,bottom,left"
  theme?: string;                // built-in theme name
  themeFile?: string;            // custom CSS path
  coverPath?: string;            // Markdown cover
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

export async function convertMarkdownToPdf(
  input: ConvertInput,
  options?: ConvertOptions
): Promise<Buffer | void>;
```

## Behavior
- If `outputPath` is provided, writes the PDF and resolves `void`.
- If `outputPath` is omitted, resolves with a `Buffer`.
- If `allowRemote` is false, any remote images or external URLs in CSS are rejected.

## Example
```ts
import { convertMarkdownToPdf } from "md-pdf";

const pdfBuffer = await convertMarkdownToPdf(
  { inputPath: "./docs/guide.md" },
  {
    pageSize: "A4",
    margin: "1in,1in,1in,1in",
    theme: "default",
    mermaid: true,
    math: true,
    footer: { pageNumbers: true }
  }
);

// Save to disk
await fs.promises.writeFile("./guide.pdf", pdfBuffer);
```

