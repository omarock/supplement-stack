// Count ALL product options (not just primaries) that still lack a real image.
//   node scripts/audit-alt-images.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/lib/products.ts", import.meta.url), "utf8");

function sliceBlock(label) {
  const s = src.indexOf(`export const ${label}`);
  const next = src.indexOf("\nexport const ", s + 10);
  const fn = src.indexOf("\nexport function ", s + 10);
  const ends = [next, fn].filter((n) => n !== -1);
  return src.slice(s, ends.length ? Math.min(...ends) : src.length);
}
// top-level {..} option objects inside an ingredient's array
function options(arr) {
  const opts = []; let depth = 0, start = -1;
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (c === "{") { if (depth === 0) start = i; depth++; }
    else if (c === "}") { depth--; if (depth === 0 && start >= 0) { opts.push(arr.slice(start, i + 1)); start = -1; } }
  }
  return opts;
}

let totalOpts = 0, withImg = 0; const missing = [];
for (const label of ["PRODUCTS", "EXTRA_PRODUCTS"]) {
  const block = sliceBlock(label);
  const keyRe = /\n  ([a-zA-Z0-9_]+):\s*\[/g;
  const keys = []; let m;
  while ((m = keyRe.exec(block))) keys.push({ key: m[1], index: m.index + m[0].length });
  for (let i = 0; i < keys.length; i++) {
    const from = keys[i].index, to = i + 1 < keys.length ? keys[i + 1].index : block.length;
    const seg = block.slice(from, to);
    const arrEnd = seg.indexOf("\n  ],");
    const arr = arrEnd >= 0 ? seg.slice(0, arrEnd) : seg;
    for (const opt of options(arr)) {
      totalOpts++;
      if (/imageUrl:/.test(opt)) withImg++;
      else {
        const b = opt.match(/brand:\s*"([^"]+)"/)?.[1] ?? "?";
        const n = opt.match(/productName:\s*"([^"]+)"/)?.[1] ?? "?";
        missing.push({ label, key: keys[i].key, brand: b, name: n, hasSearch: /searchQuery:/.test(opt) });
      }
    }
  }
}
console.log(`Total options across PRODUCTS+EXTRA: ${totalOpts}`);
console.log(`  with real image: ${withImg}`);
console.log(`  MISSING (BottleMockup): ${missing.length}`);
const byLabel = missing.reduce((a, x) => ((a[x.label] = (a[x.label] || 0) + 1), a), {});
console.log("  by map:", JSON.stringify(byLabel));
const ingredients = new Set(missing.map((x) => x.key));
console.log(`  spanning ${ingredients.size} ingredients`);
