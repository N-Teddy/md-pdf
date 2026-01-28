import type { MdPdfPlugin } from "./types.js";

export function tocPlugin(): MdPdfPlugin {
  return { name: "toc", hooks: {} };
}

export function footnotesPlugin(): MdPdfPlugin {
  return { name: "footnotes", hooks: {} };
}

export function frontmatterPlugin(): MdPdfPlugin {
  return { name: "frontmatter", hooks: {} };
}

export function mermaidPlugin(): MdPdfPlugin {
  return { name: "mermaid", hooks: {} };
}

export function mathPlugin(): MdPdfPlugin {
  return { name: "math", hooks: {} };
}
