// Apply scrape35_results.txt to products.ts
// Only applies entries from the safelist (matched correctly during scrape).
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "scripts/scrape35_results.txt");
const PRODUCTS = path.join(ROOT, "src/lib/products.ts");

// IDs where the scraped product matched the correct ingredient.
// Excluded the ones where iHerb's search returned a wrong product:
// nmn (horny goat weed), fisetin (same), uridine (soap), pterostilbene (Life Ext Mix
// multivit), bilberry (same), passionflower (gummies blend), theacrine (fat burner
// blend), artichoke (ginkgo!), calcium (no result).
const SAFE = new Set([
  "nr", "spermidine", "apigenin", "tmg", "tributyrin", "lactoferrin", "dgl",
  "pycnogenol", "huperzine", "tocotrienols", "ceramides", "hmb", "tribulus",
  "tryptophan", "gaba", "bergamot", "dandelion", "chasteberry", "glutathione",
  "astragalus", "mucuna", "eleuthero", "schisandra", "chaga", "potassium", "silica",
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
  const windowEnd = Math.min(h.index + 1500, src.length);
  const blockText = src.slice(h.index, windowEnd);

  // Already has imageUrl? skip
  if (/imageUrl:/.test(blockText)) {
    console.log("• already has image:", row.id);
    continue;
  }

  // Inject imageUrl + imageUrls + (optionally) update productPath after the searchQuery line
  // Find the searchQuery line
  const sqRe = /(searchQuery:\s*"[^"]+",?)\r?\n/;
  if (!sqRe.test(blockText)) {
    console.log("✗ no searchQuery line:", row.id);
    continue;
  }
  const imageUrl = JSON.stringify(row.primary);
  const gallery = row.gallery.length > 0
    ? `imageUrls: [${row.gallery.map(u => JSON.stringify(u)).join(",")}],${nl}      `
    : "";
  // Also patch productPath if missing
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
