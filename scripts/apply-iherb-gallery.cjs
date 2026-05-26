#!/usr/bin/env node
/**
 * Reads scripts/iherb_gallery.txt (lines of `id|url1,url2,url3,...`)
 * and inserts `imageUrls: [...]` into the matching bestseller entry in
 * src/lib/products.ts. Skips the primary URL (already in imageUrl).
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "iherb_gallery.txt");
const PRODUCTS_FILE = path.join(__dirname, "..", "src", "lib", "products.ts");

const pairs = fs.readFileSync(INPUT_FILE, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    const [id, urlsCsv] = line.split("|");
    // Delimiter is ; (URLs contain commas in their Cloudinary transformation segment)
    const urls = (urlsCsv ?? "").split(";").map(u => u.trim()).filter(Boolean);
    return { id, urls };
  })
  .filter(p => p.urls.length > 0);

let src = fs.readFileSync(PRODUCTS_FILE, "utf8");
let updated = 0;
let skipped = 0;

for (const { id, urls } of pairs) {
  const keyVariants = [`${id}:`, `"${id}":`];
  let regex = null;
  for (const key of keyVariants) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const r = new RegExp(`(${esc}\\s*\\[\\s*\\{[^}]*?)(\\n\\s*\\},?\\s*\\]?)`, "s");
    if (r.test(src)) { regex = r; break; }
  }
  if (!regex) {
    console.warn(`[skip] no entry for ${id}`);
    skipped++;
    continue;
  }

  const m = src.match(regex);
  const [whole, head, tail] = m;
  if (head.includes("imageUrls:")) {
    skipped++;
    continue;
  }

  // Extract the primary imageUrl already in the entry — exclude it from imageUrls
  const primaryMatch = head.match(/imageUrl:\s*"([^"]+)"/);
  const primaryUrl = primaryMatch ? primaryMatch[1] : "";
  const galleryUrls = urls.filter(u => u !== primaryUrl);

  if (galleryUrls.length === 0) {
    skipped++;
    continue;
  }

  // Insert imageUrls after imageUrl
  let newHead;
  if (head.includes("imageUrl:")) {
    newHead = head.replace(
      /(imageUrl:\s*"[^"]+",)/,
      `$1\n    imageUrls: ${JSON.stringify(galleryUrls)},`
    );
  } else {
    // Insert after brandInk
    newHead = head.replace(
      /(brandInk:\s*"[^"]+",)/,
      `$1\n    imageUrls: ${JSON.stringify(galleryUrls)},`
    );
  }

  src = src.replace(whole, newHead + tail);
  updated++;
}

fs.writeFileSync(PRODUCTS_FILE, src);
console.log(`Done. Updated: ${updated} / Skipped: ${skipped}`);
