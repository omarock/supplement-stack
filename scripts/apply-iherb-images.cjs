#!/usr/bin/env node
/**
 * Reads /tmp/iherb_images.txt (lines of `id|imageUrl|productPath`)
 * and inserts `imageUrl: "..."` and `productPath: "..."` into the matching
 * bestseller entry in src/lib/products.ts (the first object in each id's array).
 *
 * Skips entries that already have an imageUrl set (so we don't clobber the
 * original 24 supplements that have local images).
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "iherb_images.txt");
const PRODUCTS_FILE = path.join(__dirname, "..", "src", "lib", "products.ts");

const raw = fs.readFileSync(INPUT_FILE, "utf8");
const pairs = raw
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    const [id, imageUrl, productPath] = line.split("|");
    return { id, imageUrl, productPath };
  })
  .filter(p => p.imageUrl && p.imageUrl.startsWith("https://"));

let src = fs.readFileSync(PRODUCTS_FILE, "utf8");
let updated = 0;
let skipped = 0;
const skippedIds = [];

for (const { id, imageUrl, productPath } of pairs) {
  // Key in products.ts can be `nac:` (unquoted) or `"5-htp":` (quoted, for hyphenated)
  const keyVariants = [`${id}:`, `"${id}":`];

  let entryRegex = null;
  let matchedKey = null;
  for (const key of keyVariants) {
    // Match the bestseller block: from `key: [{ ... }` until the first closing `}` that closes that object.
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKey}\\s*\\[\\{[^}]*?)(\\n\\s*\\},?\\s*\\]?)`, "s");
    if (regex.test(src)) {
      entryRegex = regex;
      matchedKey = key;
      break;
    }
  }

  if (!entryRegex || !matchedKey) {
    console.warn(`[skip] no entry found for id="${id}"`);
    skipped++;
    skippedIds.push(id);
    continue;
  }

  // Check if it already has imageUrl
  const m = src.match(entryRegex);
  if (!m) {
    console.warn(`[skip] regex matched but couldn't capture body for id="${id}"`);
    skipped++;
    skippedIds.push(id);
    continue;
  }

  const [whole, head, tail] = m;
  if (head.includes("imageUrl:")) {
    // Don't overwrite — these are the original 24 with curated local images
    skipped++;
    skippedIds.push(id + " (already had imageUrl)");
    continue;
  }

  // Build the insertion. Put productPath before brandBg if not already present;
  // imageUrl right after brandInk.
  let newHead = head;

  // Add productPath if not present
  if (!newHead.includes("productPath:")) {
    // Insert after the badge: line (which every entry has)
    newHead = newHead.replace(
      /(badge:\s*"[^"]+",)\s*\n(\s*)(searchQuery:)/,
      `$1\n$2productPath: ${JSON.stringify(productPath)},\n$2$3`
    );
  }

  // Add imageUrl after brandInk
  if (!newHead.includes("imageUrl:")) {
    newHead = newHead.replace(
      /(brandInk:\s*"[^"]+",)/,
      `$1\n    imageUrl: ${JSON.stringify(imageUrl)},`
    );
  }

  const replacement = newHead + tail;
  src = src.replace(whole, replacement);
  updated++;
  console.log(`[ok] ${id} → ${imageUrl.slice(0, 80)}...`);
}

fs.writeFileSync(PRODUCTS_FILE, src);

console.log("");
console.log(`Done. Updated: ${updated} / Skipped: ${skipped}`);
if (skippedIds.length) {
  console.log(`Skipped: ${skippedIds.join(", ")}`);
}
