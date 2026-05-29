/* One-off: replace the AI-tell spaced em dash " — " with ", " across source.
 * Leaves standalone "—" placeholders (no surrounding spaces) intact. */
const fs = require("fs");
const path = require("path");

const ROOTS = ["src", "public"];
const EXT = new Set([".ts", ".tsx", ".css", ".txt", ".md", ".mjs", ".html"]);
const SPACED = / — /g;          // space + em dash (U+2014) + space
const TRAIL = / —(?=\n|$)/g;     // trailing " —" at line end (decorative)
const LEAD = /(^|\n)— /g;        // leading "— " at line start (decorative)

let files = 0, replaced = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== "node_modules") walk(p); continue; }
    if (!EXT.has(path.extname(entry.name))) continue;
    let txt = fs.readFileSync(p, "utf8");
    const before = txt;
    const n = (txt.match(SPACED) || []).length + (txt.match(TRAIL) || []).length + (txt.match(LEAD) || []).length;
    if (n === 0) continue;
    txt = txt.replace(SPACED, ", ").replace(TRAIL, "").replace(LEAD, "$1");
    if (txt !== before) { fs.writeFileSync(p, txt, "utf8"); files++; replaced += n; console.log(`  ${p}: ${n}`); }
  }
}

for (const r of ROOTS) if (fs.existsSync(r)) walk(r);
console.log(`\nDone: ${replaced} em dashes replaced across ${files} files.`);
