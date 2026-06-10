// Extract EXTRA_PRODUCTS alternative options (lacking imageUrl) for the CORE
// foundation ingredients, so we can capture real photos for just those.
//   node scripts/extract-alt-targets.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/lib/products.ts", import.meta.url), "utf8");

const CORE = [
  "d3k2", "omega3", "magnesium", "mag-glycinate", "mag-citrate", "mag-threonate",
  "ashwagandha", "zinc", "b12", "b-complex", "vit-c", "creatine", "probiotic",
  "melatonin", "collagen", "iron", "coq10", "curcumin", "multivit", "glycine",
];

const s = src.indexOf("export const EXTRA_PRODUCTS");
const fn = src.indexOf("\nexport function ", s);
const block = src.slice(s, fn === -1 ? src.length : fn);

function options(arr) {
  const o = []; let d = 0, st = -1;
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (c === "{") { if (d === 0) st = i; d++; }
    else if (c === "}") { d--; if (d === 0 && st >= 0) { o.push(arr.slice(st, i + 1)); st = -1; } }
  }
  return o;
}

const keyRe = /\n  ([a-zA-Z0-9_]+):\s*\[/g;
const keys = []; let m;
while ((m = keyRe.exec(block))) keys.push({ key: m[1], index: m.index + m[0].length });

const targets = [];
const presentKeys = new Set();
for (let i = 0; i < keys.length; i++) {
  if (!CORE.includes(keys[i].key)) continue;
  presentKeys.add(keys[i].key);
  const from = keys[i].index, to = i + 1 < keys.length ? keys[i + 1].index : block.length;
  const seg = block.slice(from, to);
  const arrEnd = seg.indexOf("\n  ],");
  const arr = arrEnd >= 0 ? seg.slice(0, arrEnd) : seg;
  for (const opt of options(arr)) {
    if (/imageUrl:/.test(opt)) continue;
    targets.push({
      key: keys[i].key,
      brand: opt.match(/brand:\s*"([^"]+)"/)?.[1] ?? "",
      name: opt.match(/productName:\s*"([^"]+)"/)?.[1] ?? "",
      sq: opt.match(/searchQuery:\s*"([^"]+)"/)?.[1] ?? "",
      pp: opt.match(/productPath:\s*"([^"]+)"/)?.[1] ?? "",
    });
  }
}
console.log(`CORE keys present: ${[...presentKeys].join(", ")}`);
console.log(`Alternative options missing a photo: ${targets.length}`);
console.log("TARGETS_JSON_START");
console.log(JSON.stringify(targets));
console.log("TARGETS_JSON_END");
