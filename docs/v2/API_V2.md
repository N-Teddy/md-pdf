# API V2

## Updated API Surface
V2 keeps `convertMarkdownToPdf` and adds optional plugin registration and renderer selection.

```ts
export interface ConvertOptionsV2 {
  outputPath?: string;
  pageSize?: string;
  margin?: string;
  theme?: string;
  themeDir?: string;
  themeOverrides?: Record<string, string>;
  toc?: boolean;
  footnotes?: boolean;
  mermaid?: boolean;
  math?: boolean;
  frontmatter?: boolean;
  allowRemote?: boolean;
  renderer?: "chromium" | "lite";
  fallbackRenderer?: "lite" | "none";
  plugins?: MdPdfPlugin[];
  experimental?: Record<string, boolean>;
}

export async function convertMarkdownToPdf(
  input: ConvertInput,
  options?: ConvertOptionsV2
): Promise<Buffer | void>;
```

## Backward Compatibility
- MVP options remain supported.
- Deprecated fields (if any) will log a warning for one minor version before removal.

## Examples

Simple:
```ts
await convertMarkdownToPdf({ inputPath: "./doc.md" }, { outputPath: "./doc.pdf" });
```

With plugins:
```ts
await convertMarkdownToPdf(
  { inputPath: "./doc.md" },
  {
    plugins: [tocPlugin(), footnotesPlugin()],
    renderer: "chromium"
  }
);
```

Batch conversion (planned helper):
```ts
await convertBatch([
  { inputPath: "a.md", outputPath: "a.pdf" },
  { inputPath: "b.md", outputPath: "b.pdf" }
]);
```
