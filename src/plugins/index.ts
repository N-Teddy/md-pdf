import type { MdPdfPlugin } from "./types.js";

export function createPlugin(name: string, hooks: MdPdfPlugin["hooks"]): MdPdfPlugin {
  return { name, hooks };
}
