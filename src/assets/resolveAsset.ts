import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REMOTE_RE = /^https?:\/\//i;

export interface AssetOptions {
  baseDir: string;
  allowRemote: boolean;
  cacheDir: string;
}

export async function resolveAsset(url: string, options: AssetOptions): Promise<string> {
  if (REMOTE_RE.test(url)) {
    if (!options.allowRemote) {
      throw new Error(`Remote assets are disabled: ${url}`);
    }
    return url;
  }

  if (url.startsWith("data:") || url.startsWith("file:")) {
    return url;
  }

  const resolved = path.resolve(options.baseDir, url);
  await fs.access(resolved);
  return pathToFileURL(resolved).toString();
}
