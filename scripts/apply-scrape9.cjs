// Apply scrape9_results.txt → products.ts for the 7 confident matches.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "scripts/scrape9_results.txt");
const PRODUCTS = path.join(ROOT, "src/lib/products.ts");

// Excluded: theacrine (wrong product — creatine), uridine (multi-ingredient
// Qualia Night, not pure uridine).
const SAFE = new Set([
  "nmn", "fisetin", "pterostilbene", "bilberry", "passionflower", "artichoke", "calcium",
]);

const lines = fs.readFileSync(INPUT, "utf8").trim().split("\n");
const rows = [];
for (const line of lines) {
  const parts = line.split("|");
  if (parts.length < 4) continue;
  const [id, status, productPath, urlsRaw] = parts;
  if (status !== "OK") continue;
  if (!SAFE.has(id)) continue;
  const urls = urlsRaw.split(";").filter(Boolean);
  if (urls.length === 0) continue;
  rows.push({ id, productPath, primary: urls[0], gallery: urls.slice(1, 4) });
}

let src = fs.readFileSync(PRODUCTS, "utf8");
const nl = src.includes("\r\n") ? "\r\n" : "\n";
let updated = 0;

for (const row of rows) {
  const escaped = row.id.replace(/[-]/g, "\\-");
  const headRe = new RegExp("^  " + escaped + ":\\s*\\[", "m");
  const h = headRe.exec(src);
  if (!h) { console.log("✗ no block for", row.id); continue; }
  // Find the closing `}]` of THIS block's array. The combination only occurs
  // at the end of an object-in-array, never inside other syntax.
  const tail = src.slice(h.index);
  const endMatch = /\}\s*\]/.exec(tail);
  const blockLen = endMatch ? endMatch.index + 2 : 1500;
  const windowEnd = h.index + Math.min(blockLen, 1500);
  const blockText = src.slice(h.index, windowEnd);
  if (/imageUrl:/.test(blockText)) {
    console.log("• already has image:", row.id);
    continue;
  }
  const sqRe = /(searchQuery:\s*"[^"]+",?)\r?\n/;
  if (!sqRe.test(blockText)) {
    console.log("✗ no searchQuery line:", row.id);
    continue;
  }
  const imageUrl = JSON.stringify(row.primary);
  const gallery = row.gallery.length > 0
    ? `imageUrls: [${row.gallery.map(u => JSON.stringify(u)).join(",")}],${nl}      `
    : "";
  const hasPath = /productPath:/.test(blockText);
  const pathLine = !hasPath && row.productPath
    ? `productPath: ${JSON.stringify(row.productPath)},${nl}    `
    : "";

  const replaced = blockText.replace(sqRe, (m, group) => {
    const sep = group.endsWith(",") ? "" : ",";
    return group + sep + nl
      + (pathLine ? "    " + pathLine.trim() + nl : "")
      + `      imageUrl: ${imageUrl},${nl}`
      + (gallery ? `      ${gallery}` : "");
  });

  src = src.slice(0, h.index) + replaced + src.slice(windowEnd);
  updated++;
  console.log(`✓ ${row.id} → primary + ${row.gallery.length} gallery`);
}

fs.writeFileSync(PRODUCTS, src);
console.log(`\nTotal updated: ${updated}/${rows.length} safelisted`);
