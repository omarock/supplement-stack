// One-off: replace the hardcoded monospace literal across the app with the body
// sans font, so the "typewriter/code" look (read as AI-generated) is gone
// site-wide. Node writes UTF-8 without adding a BOM. (founder, 2026-06-15)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const TARGET = '"JetBrains Mono", monospace';
const REPLACEMENT = '"Inter", system-ui, sans-serif';

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(p);
  }
}
walk(ROOT);

let changedFiles = 0;
let totalHits = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (!src.includes(TARGET)) continue;
  const hits = src.split(TARGET).length - 1;
  fs.writeFileSync(f, src.split(TARGET).join(REPLACEMENT), "utf8");
  changedFiles++;
  totalHits += hits;
  console.log(`${String(hits).padStart(2)}  ${path.relative(path.join(__dirname, ".."), f)}`);
}
console.log(`\nDONE: ${totalHits} replacements across ${changedFiles} files`);
