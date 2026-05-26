// Apply gallery_single_image_fix.txt → products.ts
// Adds imageUrls[] array to products that previously only had imageUrl.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "scripts/gallery_single_image_fix.txt");
const PRODUCTS = path.join(ROOT, "src/lib/products.ts");

const lines = fs.readFileSync(INPUT, "utf8").trim().split("\n");
const map = {};
for (const line of lines) {
  const [id, urls] = line.split("|");
  const arr = urls.split(";").filter(Boolean);
  if (arr.length > 1) map[id] = arr;
}

let src = fs.readFileSync(PRODUCTS, "utf8");
let updated = 0;

for (const [id, urls] of Object.entries(map)) {
  // First URL is primary (we keep imageUrl as-is); rest become imageUrls
  const additional = urls.slice(1);
  if (additional.length === 0) continue;

  // Find the block for this id
  const escaped = id.replace(/[-]/g, "\\-");
  const headRe = new RegExp("^  " + escaped + ":\\s*\\[", "m");
  const headMatch = headRe.exec(src);
  if (!headMatch) {
    console.log("✗ No block found for", id);
    continue;
  }
  // Use a tight window — first product's imageUrl is within ~800 chars of block head
  const windowEnd = Math.min(headMatch.index + 1500, src.length);
  const blockText = src.slice(headMatch.index, windowEnd);
  // Look for imageUrls within the FIRST product object only.
  // Compact form `[{...}]` ends with `}],` at 2-space indent; multi-product ends with `\n    },`
  const firstObjEnd = blockText.search(/\r?\n\s{2,4}\}[\],]/);
  const firstObjText = firstObjEnd > 0 ? blockText.slice(0, firstObjEnd) : blockText;
  if (/imageUrls:/.test(firstObjText)) {
    console.log("• Already has imageUrls:", id);
    continue;
  }
  // Inject imageUrls right after the imageUrl line in the first product
  const imgLineRe = /(imageUrl:\s*"[^"]+",?)\r?\n/;
  if (!imgLineRe.test(blockText)) {
    console.log("✗ No imageUrl line in block:", id);
    continue;
  }
  // Detect newline style of the file
  const nl = src.includes("\r\n") ? "\r\n" : "\n";
  const replaced = blockText.replace(imgLineRe, (_, group) => {
    const newImageUrls = "imageUrls: [" + additional.map(u => JSON.stringify(u)).join(",") + "],";
    const sep = group.endsWith(",") ? "" : ",";
    return group + sep + nl + "      " + newImageUrls + nl;
  });
  src = src.slice(0, headMatch.index) + replaced + src.slice(windowEnd);
  updated++;
  console.log("✓ Updated", id, "→ +" + additional.length, "gallery images");
}

fs.writeFileSync(PRODUCTS, src);
console.log("\nTotal updated:", updated);
