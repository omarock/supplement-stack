/**
 * Remove every em dash (—, U+2014) AND en dash (–, U+2013), plus their HTML
 * entities (&mdash; / &ndash;), from the website source. Founder preference:
 * neither dash may appear anywhere in the UI.
 *
 * Replacement rules (ordered):
 *   " — " (spaced em, prose)    -> ", "   (reads as a clause break)
 *   " &mdash; "                 -> ", "
 *   remaining "—" / "&mdash;"   -> "-"    (placeholders, e.g. empty cells)
 *   "–" / "&ndash;" (en, ranges)-> "-"    ("$20 – $50" -> "$20 - $50")
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const EXT = /\.(tsx?|jsx?|css|md|txt)$/;
const EM = "—"; // —
const EN = "–"; // –

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
const DASH_RE = new RegExp(`${EM}|${EN}|&mdash;|&ndash;`, "g");

for (const f of files) {
  const orig = fs.readFileSync(f, "utf8");
  const before = (orig.match(DASH_RE) || []).length;
  if (before === 0) continue;

  let s = orig
    .replace(new RegExp(` ${EM} `, "g"), ", ")  // spaced em dash -> comma
    .replace(/ &mdash; /g, ", ")
    .replace(new RegExp(EM, "g"), "-")           // remaining em dash -> hyphen
    .replace(/&mdash;/g, "-")
    .replace(new RegExp(EN, "g"), "-")           // en dash -> hyphen
    .replace(/&ndash;/g, "-");

  if (s !== orig) {
    fs.writeFileSync(f, s, "utf8");
    changedFiles++;
    total += before;
    console.log(`  ${path.relative(ROOT, f)}  (${before})`);
  }
}

console.log(`\nRemoved ${total} em/en dash(es) across ${changedFiles} file(s).`);
