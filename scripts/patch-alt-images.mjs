// Insert real iHerb imageUrl into the matched EXTRA_PRODUCTS alternative options
// (core ingredients). Brace-matched, scoped to the EXTRA_PRODUCTS block.
//   node scripts/patch-alt-images.mjs
import { readFileSync, writeFileSync } from "node:fs";
const url = new URL("../src/lib/products.ts", import.meta.url);
let src = readFileSync(url, "utf8");
const CDN = "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/";

const T = [
  ["Thorne", "Vitamin D + K2 (liquid)", "thr/thr50001/l/107.jpg"],
  ["California Gold Nutrition", "Vitamin D3 + K2", "cgn/cgn02333/l/63.jpg"],
  ["Nordic Naturals", "Ultimate Omega", "nor/nor03790/l/176.jpg"],
  ["California Gold Nutrition", "Omega-3 Premium Fish Oil", "spn/spn02141/l/47.jpg"],
  ["Nutricost", "Ashwagandha KSM-66", "ncs/ncs57401/l/8.jpg"],
  ["Jarrow Formulas", "Ashwagandha (Sensoril)", "jrw/jrw22014/l/53.jpg"],
  ["NOW Foods", "Glycine Powder", "now/now00225/l/32.jpg"],
  ["Thorne", "Glycine", "thr/thr51202/l/55.jpg"],
  ["Optimum Nutrition", "Micronized Creatine Monohydrate", "opn/opn02384/l/68.jpg"],
  ["California Gold Nutrition", "Creatine Monohydrate (Creapure)", "cgn/cgn02283/l/42.jpg"],
  ["Thorne", "Zinc Picolinate 30 mg", "thr/thr00692/l/40.jpg"],
  ["NOW Foods", "Zinc Picolinate 50 mg", "now/now01549/l/28.jpg"],
  ["Jarrow Formulas", "Methyl B-12 1000 mcg", "jrw/jrw18001/l/45.jpg"],
  ["Thorne", "Methylcobalamin (B12)", "thr/thr12502/l/53.jpg"],
  ["Thorne", "Curcumin Phytosome (Meriva)", "thr/thr00484/l/45.jpg"],
  ["Doctor's Best", "Curcumin C3 Complex + BioPerine", "drb/drb00195/l/92.jpg"],
  ["Doctor's Best", "High Absorption CoQ10 100 mg", "drb/drb00069/l/98.jpg"],
  ["Jarrow Formulas", "Co-Q10 100 mg", "jrw/jrw06003/l/81.jpg"],
  ["Vital Proteins", "Collagen Peptides (Unflavored)", "vtp/vtp00508/l/105.jpg"],
  ["California Gold Nutrition", "CollagenUP Marine Collagen", "cgn/cgn01033/l/478.jpg"],
  ["Thorne", "Iron Bisglycinate 25 mg", "thr/thr00345/l/38.jpg"],
  ["Solgar", "Gentle Iron 25 mg", "sol/sol01249/l/127.jpg"],
  ["California Gold Nutrition", "LactoBif 30 Billion CFU", "cgn/cgn00965/l/302.jpg"],
  ["Garden of Life", "Dr. Formulated Probiotics 50 Billion", "gol/gol11831/l/26.jpg"],
  ["Nutricost", "Melatonin 5 mg", "ncs/ncs67272/l/8.jpg"],
  ["Swanson", "Melatonin 5 mg", "swv/swv11811/l/24.jpg"],
  ["NOW Foods", "Melatonin 3 mg", "now/now03258/l/59.jpg"],
  ["Life Extension", "Melatonin 300 mcg", "lex/lex16681/l/129.jpg"],
  ["Garden of Life", "Vitamin Code Multivitamin", "gol/gol11368/l/38.jpg"],
  ["Pure Encapsulations", "O.N.E. Multivitamin", "pes/pes11499/l/11.jpg"],
  ["Optimum Nutrition", "Opti-Men / Opti-Women", "opn/opn05223/l/56.jpg"],
  ["MegaFood", "Multi for Men / Women", "mgf/mgf10320/l/69.jpg"],
];

const exStart = src.indexOf("export const EXTRA_PRODUCTS");
const exEnd = src.indexOf("\nexport function ", exStart);
const head = src.slice(0, exStart);
let block = src.slice(exStart, exEnd === -1 ? src.length : exEnd);
const tail = exEnd === -1 ? "" : src.slice(exEnd);

let patched = 0; const skipped = [];
for (const [brand, name, code] of T) {
  const nm = `productName: "${name}"`;
  let from = 0, done = false;
  while (true) {
    const idx = block.indexOf(nm, from);
    if (idx === -1) break;
    let s = block.lastIndexOf("{", idx), depth = 0, e = -1;
    for (let i = s; i < block.length; i++) { if (block[i] === "{") depth++; else if (block[i] === "}") { depth--; if (depth === 0) { e = i; break; } } }
    const opt = block.slice(s, e + 1);
    if (opt.includes(`brand: "${brand}"`) && !opt.includes("imageUrl:")) {
      const ins = opt.replace(nm + ",", `${nm}, imageUrl: "${CDN}${code}",`);
      if (ins === opt) { skipped.push(`${brand} | ${name} (no comma to anchor)`); break; }
      block = block.slice(0, s) + ins + block.slice(e + 1);
      patched++; done = true; break;
    }
    from = idx + nm.length;
  }
  if (!done) skipped.push(`${brand} | ${name}`);
}
writeFileSync(url, head + block + tail, "utf8");
console.log(`Patched ${patched}/${T.length}`);
if (skipped.length) console.log("SKIPPED:\n  " + skipped.join("\n  "));
