// Audit which products still lack a real photo (would fall back to BottleMockup).
// Parses src/lib/products.ts as text (brace-counted) — no TS runtime needed.
//   node scripts/audit-images.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/products.ts", import.meta.url), "utf8");

function sliceBlock(label) {
  const start = src.indexOf(`export const ${label}`);
  if (start === -1) return "";
  // end = next "export const " after start, or end of file
  const next = src.indexOf("\nexport const ", start + 10);
  const fn = src.indexOf("\nexport function ", start + 10);
  const ends = [next, fn].filter((n) => n !== -1);
  const end = ends.length ? Math.min(...ends) : src.length;
  return src.slice(start, end);
}

function firstOption(block) {
  const start = block.indexOf("{");
  if (start === -1) return "";
  let depth = 0;
  for (let i = start; i < block.length; i++) {
    if (block[i] === "{") depth++;
    else if (block[i] === "}") { depth--; if (depth === 0) return block.slice(start, i + 1); }
  }
  return block.slice(start);
}

function analyze(label) {
  const block = sliceBlock(label);
  const keyRe = /\n  ([a-zA-Z0-9_]+):\s*\[/g;
  const keys = [];
  let m;
  while ((m = keyRe.exec(block))) keys.push({ key: m[1], index: m.index + m[0].length });
  const has = [], missing = [];
  for (let i = 0; i < keys.length; i++) {
    const from = keys[i].index;
    const to = i + 1 < keys.length ? keys[i + 1].index : block.length;
    const opt = firstOption(block.slice(from, to));
    const brand = opt.match(/brand:\s*"([^"]+)"/)?.[1] ?? "?";
    const name = opt.match(/productName:\s*"([^"]+)"/)?.[1] ?? "?";
    const productPath = opt.match(/productPath:\s*"([^"]+)"/)?.[1] ?? "";
    const searchQuery = opt.match(/searchQuery:\s*"([^"]+)"/)?.[1] ?? "";
    const info = { key: keys[i].key, brand, name, productPath, searchQuery };
    (/imageUrl:/.test(opt) ? has : missing).push(info);
  }
  return { count: keys.length, has, missing };
}

const results = {};
for (const label of ["PRODUCTS", "EXTRA_PRODUCTS"]) {
  const r = analyze(label);
  results[label] = r;
  console.log(`\n===== ${label}: ${r.count} ingredients | primary HAS image: ${r.has.length} | MISSING: ${r.missing.length}`);
}

// What the RESULTS card actually shows: getPrimaryProduct() reads PRODUCTS only.
// So an ingredient whose key is in EXTRA_PRODUCTS but NOT in PRODUCTS shows a
// mockup as its primary (no curated bestseller with a photo). Those are the real,
// user-visible gaps. EXTRA keys that ARE in PRODUCTS only miss an *alternative* photo.
const prodKeys = new Set([...results.PRODUCTS.has, ...results.PRODUCTS.missing].map((x) => x.key));
const extraOnly = results.EXTRA_PRODUCTS.missing.filter((x) => !prodKeys.has(x.key));
const extraAlsoCurated = results.EXTRA_PRODUCTS.missing.filter((x) => prodKeys.has(x.key));

// Build the work-list: the curated gap (PRODUCTS) + the extra-only gaps.
// Tag each with which map it lives in so the patcher knows where to write.
const worklist = [
  ...results.PRODUCTS.missing.map((x) => ({ ...x, map: "PRODUCTS" })),
  ...extraOnly.map((x) => ({ ...x, map: "EXTRA_PRODUCTS" })),
];

console.log(`\n##### WORKLIST (user-visible mockup primaries to fix): ${worklist.length}`);
console.log("WORKLIST_JSON_START");
console.log(JSON.stringify(worklist, null, 0));
console.log("WORKLIST_JSON_END");

console.log(`\n##### EXTRA missing but ALSO curated (only an ALTERNATIVE lacks a photo, low priority): ${extraAlsoCurated.length}`);
console.log("   " + extraAlsoCurated.map((x) => x.key).join(", "));
