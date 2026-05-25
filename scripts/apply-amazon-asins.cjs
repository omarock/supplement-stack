#!/usr/bin/env node
/**
 * Reads scripts/amazon_asins.txt (lines of `id|ASIN`)
 * and inserts `amazonAsin: "..."` into the matching bestseller entry in
 * src/lib/products.ts (the first object in each id's array).
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "amazon_asins.txt");
const PRODUCTS_FILE = path.join(__dirname, "..", "src", "lib", "products.ts");

const pairs = fs.readFileSync(INPUT_FILE, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    const [id, asin] = line.split("|");
    return { id, asin };
  })
  .filter(p => p.asin && /^[A-Z0-9]{10}$/.test(p.asin));

let src = fs.readFileSync(PRODUCTS_FILE, "utf8");
let updated = 0;
let skipped = 0;

for (const { id, asin } of pairs) {
  const keyVariants = [`${id}:`, `"${id}":`];
  let regex = null;
  let matchedKey = null;
  for (const key of keyVariants) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const r = new RegExp(`(${esc}\\s*\\[\\s*\\{[^}]*?)(\\n\\s*\\},?\\s*\\]?)`, "s");
    if (r.test(src)) {
      regex = r;
      matchedKey = key;
      break;
    }
  }
  if (!regex) {
    console.warn(`[skip] no entry for ${id}`);
    skipped++;
    continue;
  }

  const m = src.match(regex);
  const [whole, head, tail] = m;
  if (head.includes("amazonAsin:")) {
    skipped++;
    continue;
  }

  // Insert amazonAsin right after badge: line
  let newHead = head.replace(
    /(badge:\s*"[^"]+",)/,
    `$1\n    amazonAsin: ${JSON.stringify(asin)},`
  );

  if (newHead === head) {
    // No badge: line found, insert before the closing
    newHead = head + `\n    amazonAsin: ${JSON.stringify(asin)},`;
  }

  src = src.replace(whole, newHead + tail);
  updated++;
}

fs.writeFileSync(PRODUCTS_FILE, src);
console.log(`Done. Updated: ${updated} / Skipped: ${skipped}`);
