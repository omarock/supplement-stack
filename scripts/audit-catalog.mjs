// Audit the ingredient catalog for duplicate ids or names (data-quality check).
// Reads supplements.ts as text (no TS execution needed) and reports duplicates.
import { readFileSync } from "node:fs";

const FILE =
  "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\supplement-stack\\src\\lib\\supplements.ts";
const src = readFileSync(FILE, "utf8");

// Each ingredient starts with:  id: "slug", name: "Display Name",
const re = /id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
const ids = new Map();
const names = new Map();
let m;
let total = 0;
while ((m = re.exec(src)) !== null) {
  total++;
  ids.set(m[1], (ids.get(m[1]) || 0) + 1);
  names.set(m[2], (names.get(m[2]) || 0) + 1);
}

const dupIds = [...ids].filter(([, c]) => c > 1);
const dupNames = [...names].filter(([, c]) => c > 1);

console.log("Total ingredient entries:", total);
console.log("Duplicate ids:", dupIds.length ? dupIds : "none");
console.log("Duplicate names:", dupNames.length ? dupNames : "none");
const oliveish = [...names.keys()].filter((n) => /olive|garlic/i.test(n));
console.log("Olive/garlic entries:", oliveish);
