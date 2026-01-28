const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help") || args.length === 0) {
	console.log("md2pdf (scaffold)\n\nUsage: md2pdf <input.md> -o <output.pdf>");
	process.exit(0);
}

console.error("md2pdf CLI is scaffolded and not implemented yet. Phase 3 will add rendering.");
process.exit(1);
