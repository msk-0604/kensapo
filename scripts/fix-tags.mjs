import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const BAD_CLOSE = "</" + "mo" + "tion>";
const GOOD_CLOSE = "</" + "di" + "v>";
const BAD_OPEN = "<" + "mo" + "tion ";
const GOOD_OPEN = "<" + "di" + "v ";

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    if (statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) files.push(p);
  }
  return files;
}

const root = join(import.meta.dirname, "..");
for (const file of walk(root)) {
  const c = readFileSync(file, "utf8");
  const fixed = c.replaceAll(BAD_CLOSE, GOOD_CLOSE).replaceAll(BAD_OPEN, GOOD_OPEN);
  if (fixed !== c) {
    writeFileSync(file, fixed);
    console.log("fixed", file);
  }
}
