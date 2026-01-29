# API V3

## Programmatic Publishing API
```ts
publishBook(projectPath: string, options: PublishOptions): Promise<Buffer | void>
```

## Batch Processing API
```ts
convertBatch(inputs: ConvertInput[], options: ConvertOptions): Promise<void>
```

## Plugin Registration
```ts
registerPlugin(plugin: MdPdfPlugin): void
```

## Layout/Template API
- `layoutProfiles`: list of supported print profiles
- `resolveTemplate(name)`: load and validate templates

## Streaming + Async Support
- Support stream output for large documents
- Async hooks for asset resolution
