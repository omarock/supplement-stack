// Apply fresh iHerb productPath values to products.ts for the 9 broken/discontinued URLs.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS = path.join(ROOT, "src/lib/products.ts");

const REPLACEMENTS = {
  "rhodiola":          "/pr/now-foods-rhodiola-500-mg-120-veg-capsules/123463",
  "lions-mane":        "/pr/host-defense-mushrooms-lion-s-mane-60-capsules-0-5-g-per-capsule/21455",
  "glucosamine":       "/pr/now-foods-glucosamine-chondroitin-with-msm-90-capsules/37832",
  "elderberry":        "/pr/sambucol-black-elderberry-immune-syrup-original-formula-4-fl-oz-120-ml/68251",
  "probiotic":         "/pr/garden-of-life-dr-formulated-probiotics-once-daily-30-vegetarian-capsules/64433",
  "digestive-enzymes": "/pr/enzymedica-digest-gold-with-atpro-maximum-strength-240-capsules/16790",
  "coq10":             "/pr/doctor-s-best-high-absorption-coq10-100-mg-60-veggie-caps/20",
  "vit-c":             "/pr/now-foods-c-1000-with-rose-hips-100-tablets/39672",
  "zinc":              "/pr/thorne-zinc-picolinate-30-mg-60-capsules/103185",
};

let src = fs.readFileSync(PRODUCTS, "utf8");
let updated = 0;

for (const [id, newPath] of Object.entries(REPLACEMENTS)) {
  const escaped = id.replace(/[-]/g, "\\-");
  // Match both `  id:` and `  "id":` styles
  const headRe = new RegExp('^  "?' + escaped + '"?:\\s*\\[', "m");
  const h = headRe.exec(src);
  if (!h) { console.log("✗ no block for", id); continue; }

  // Get just the block extent (up to first `}]` after head)
  const tail = src.slice(h.index);
  const end = /\}\s*\]/.exec(tail);
  if (!end) { console.log("✗ no end for", id); continue; }
  const blockEnd = h.index + end.index + 2;
  const blockText = src.slice(h.index, blockEnd);

  // Find the FIRST productPath in this block (top product = primary)
  const pathRe = /(productPath:\s*")([^"]+)(")/;
  const m = pathRe.exec(blockText);
  if (!m) { console.log("✗ no productPath in block:", id); continue; }

  const newBlock = blockText.slice(0, m.index)
    + m[1] + newPath + m[3]
    + blockText.slice(m.index + m[0].length);

  src = src.slice(0, h.index) + newBlock + src.slice(blockEnd);
  updated++;
  console.log(`✓ ${id} → ${newPath}`);
}

fs.writeFileSync(PRODUCTS, src);
console.log(`\nTotal updated: ${updated}/${Object.keys(REPLACEMENTS).length}`);
