import path from "node:path";
import { pathToFileURL } from "node:url";

export function toFileUrl(p: string): string {
	return pathToFileURL(p).toString();
}

export function resolveFrom(baseDir: string, target: string): string {
	if (path.isAbsolute(target)) {
		return target;
	}
	return path.resolve(baseDir, target);
}
