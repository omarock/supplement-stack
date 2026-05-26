#!/usr/bin/env node
/**
 * Reads scripts/originals_images.txt (id|imageUrl|productPath)
 * and REPLACES the existing local imageUrl in products.ts with the iHerb CDN URL.
 * Also updates productPath if scraped path differs.
 *
 * Reason: gives all 100 supplements consistent iHerb CDN imagery + unlocks
 * multi-image gallery via the iherb_gallery scraper.
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "originals_images.txt");
const PRODUCTS_FILE = path.join(__dirname, "..", "src", "lib", "products.ts");

const rows = fs.readFileSync(INPUT_FILE, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    const [id, imageUrl, productPath] = line.split("|");
    return { id, imageUrl, productPath };
  })
  .filter(r => r.imageUrl && r.imageUrl.startsWith("https://"));

let src = fs.readFileSync(PRODUCTS_FILE, "utf8");
let updated = 0;

for (const { id, imageUrl, productPath } of rows) {
  const keyVariants = [`${id}:`, `"${id}":`];
  let regex = null;
  for (const key of keyVariants) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const r = new RegExp(`(${esc}\\s*\\[\\s*\\{[^}]*?)(\\n\\s*\\},?\\s*\\]?)`, "s");
    if (r.test(src)) { regex = r; break; }
  }
  if (!regex) {
    console.warn(`[skip] no entry for ${id}`);
    continue;
  }

  const m = src.match(regex);
  let head = m[1];
  const tail = m[2];

  // Replace existing imageUrl (local /products/...) with iHerb CDN URL
  if (head.includes("imageUrl:")) {
    head = head.replace(/imageUrl:\s*"[^"]+"/, `imageUrl: ${JSON.stringify(imageUrl)}`);
  } else {
    // Insert after brandInk
    head = head.replace(
      /(brandInk:\s*"[^"]+",)/,
      `$1\n    imageUrl: ${JSON.stringify(imageUrl)},`
    );
  }

  // Update productPath if different (keep the original if no scraped diff)
  if (productPath && !head.includes(`productPath: "${productPath}"`)) {
    if (head.includes("productPath:")) {
      head = head.replace(/productPath:\s*"[^"]+"/, `productPath: ${JSON.stringify(productPath)}`);
    }
  }

  src = src.replace(m[0], head + tail);
  updated++;
}

fs.writeFileSync(PRODUCTS_FILE, src);
console.log(`Done. Updated: ${updated}`);
