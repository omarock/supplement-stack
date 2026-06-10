// Validate the 4 locale message files parse and have identical key sets per
// namespace (a missing key in one locale = a leaked English key at runtime).
//   node scripts/check-i18n.mjs
import { readFileSync } from "node:fs";
const locales = ["en", "fr", "de", "es"];
const data = {};
for (const l of locales) {
  try { data[l] = JSON.parse(readFileSync(new URL(`../src/messages/${l}.json`, import.meta.url), "utf8")); }
  catch (e) { console.error(`❌ ${l}.json invalid JSON: ${e.message}`); process.exit(1); }
}
const flat = (o, p = "") => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === "object" && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [`${p}${k}`]);
const keys = Object.fromEntries(locales.map(l => [l, new Set(flat(data[l]))]));
const base = keys.en;
let bad = 0;
for (const l of locales.filter(x => x !== "en")) {
  const missing = [...base].filter(k => !keys[l].has(k));
  const extra = [...keys[l]].filter(k => !base.has(k));
  if (missing.length) { console.log(`❌ ${l}: ${missing.length} keys MISSING vs en: ${missing.slice(0,12).join(", ")}`); bad++; }
  if (extra.length) { console.log(`⚠️  ${l}: ${extra.length} keys EXTRA vs en: ${extra.slice(0,12).join(", ")}`); }
}
const new11 = ["qc.s11title","qc.currentQ","qc.priorityQ","qc.csMulti","qc.csZinc","qc.hpHeart","qc.hpSleep"];
for (const l of locales) {
  const miss = new11.filter(k => !keys[l].has(k));
  console.log(`${l}: total ${keys[l].size} keys | Step11 sample present: ${miss.length === 0 ? "✓ all" : "MISSING " + miss.join(",")}`);
}
console.log(bad === 0 ? "\n✅ All locales have full key parity with en." : `\n❌ ${bad} locale(s) missing keys.`);
