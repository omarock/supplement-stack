/**
 * Remove every em dash (—, U+2014) and its HTML entity (&mdash;) from the
 * website source. Founder preference: the em dash must never appear in the UI.
 *
 * Replacement rules (ordered):
 *   " — "  (spaced, prose)      -> ", "   (matches the earlier de-em-dash pass)
 *   " &mdash; "                 -> ", "
 *   remaining "—" / "&mdash;"   -> "-"    (UI placeholders like empty cells)
 *
 * En dashes (–, U+2013, used for numeric ranges) are intentionally left alone.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const EXT = /\.(tsx?|jsx?|css|md|txt)$/;
const MDASH = "—";

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) files.push(p);
  }
})(ROOT);

let changedFiles = 0;
let total = 0;

for (const f of files) {
  const orig = fs.readFileSync(f, "utf8");
  const before = (orig.match(/—|&mdash;/g) || []).length;
  if (before === 0) continue;

  let s = orig
    .replace(new RegExp(` ${MDASH} `, "g"), ", ")
    .replace(/ &mdash; /g, ", ")
    .replace(new RegExp(MDASH, "g"), "-")
    .replace(/&mdash;/g, "-");

  if (s !== orig) {
    fs.writeFileSync(f, s, "utf8");
    changedFiles++;
    total += before;
    console.log(`  ${path.relative(ROOT, f)}  (${before})`);
  }
}

console.log(`\nRemoved ${total} em dash(es) across ${changedFiles} file(s).`);
