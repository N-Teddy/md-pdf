import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const srcThemes = path.join(root, "src", "themes");
const distThemes = path.join(root, "dist", "themes");

await fs.mkdir(distThemes, { recursive: true });
await copyDir(srcThemes, distThemes);

async function copyDir(from, to) {
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      const ext = path.extname(entry.name);
      if (ext === ".ts" || ext === ".tsx" || ext === ".map") continue;
      await fs.copyFile(srcPath, destPath);
    }
  }
}
