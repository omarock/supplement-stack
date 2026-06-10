// Extract the brand -> {brandBg, brandInk} colors already used in products.ts so
// newly-added entries reuse the site's existing per-brand tints.
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/lib/products.ts", import.meta.url), "utf8");
const map = {};
for (const m of src.matchAll(/brand:\s*"([^"]+)"[\s\S]{0,500}?brandBg:\s*"([^"]+)",\s*brandInk:\s*"([^"]+)"/g)) {
  const [, brand, bg, ink] = m;
  if (!map[brand]) map[brand] = { bg, ink, n: 0 };
  map[brand].n++;
}
const want = ["Organic India","Real Mushrooms","Swanson","Swanson Vitamins","Solgar","California Gold Nutrition","NOW Foods","Paradise Herbs","Nutricost","Life Extension","Nature's Way","Source Naturals","Gaia Herbs","Doctor's Best","Jarrow Formulas"];
for (const b of want) console.log(`${b.padEnd(26)} => ${map[b] ? JSON.stringify({bg:map[b].bg,ink:map[b].ink}) : "(none)"}`);
