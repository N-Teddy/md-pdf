import type { Renderer } from "./types.js";
import { ChromiumRenderer } from "./chromium.js";
import { LiteRenderer } from "./lite.js";

export function getRenderer(name: "chromium" | "lite"): Renderer {
  if (name === "lite") {
    return new LiteRenderer();
  }
  return new ChromiumRenderer();
}
