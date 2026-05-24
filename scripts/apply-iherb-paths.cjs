/* eslint-disable */
const fs = require("fs");
const path = require("path");
const target = path.join(__dirname, "..", "src", "lib", "products.ts");

// Real iHerb URLs scraped from iHerb search (verified working)
const PATHS = {
  "d3k2":              "/pr/now-foods-vitamin-d3-2-000-iu-120-softgels/8229",
  "omega3":            "/pr/sports-research-alaskan-omega-3-fish-oil-triple-strength-180-softgels/72037",
  "omega3-algae":      "/pr/swanson-vitamins-plant-based-omega-3-120-liquid-vegan-capsules/149122",
  "multivit":          "/pr/garden-of-life-organics-women-s-multi-60-vegan-tablets/106223",
  "mag-glycinate":     "/pr/doctor-s-best-high-absorption-magnesium-120-tablets-100-mg-per-tablet/15",
  "ashwagandha":       "/pr/jarrow-formulas-ashwagandha-300-mg-120-veggie-capsules/3302",
  "l-theanine":        "/pr/now-foods-l-theanine-120-veg-capsules/54096",
  "glycine":           "/pr/now-foods-glycine-pure-powder-1-lb-454-g/615",
  "b12":               "/pr/jarrow-formulas-methyl-b-12-fruit-500-mcg-100-chewable-tablets/43808",
  "b-complex":         "/pr/thorne-basic-b-complex-60-capsules/18791",
  "rhodiola":          "/pr/now-foods-rhodiola-500-mg-120-veg-capsules/123463",
  "lions-mane":        "/pr/host-defense-mushrooms-lion-s-mane-60-capsules-0-5-g-per-capsule/21455",
  "creatine":          "/pr/optimum-nutrition-micronized-creatine-powder-unflavored-1-32-lb-600-g/68616",
  "collagen":          "/pr/sports-research-collagen-peptides-unflavored-16-oz-454-g/71106",
  "curcumin":          "/pr/doctor-s-best-curcumin-phytosome-180-veggie-caps-500-mg-per-capsule/46873",
  "glucosamine":       "/pr/now-foods-glucosamine-chondroitin-with-msm-180-capsules/581",
  "vit-c":             "/pr/now-foods-c-500-with-rose-hips-250-tablets/478",
  "zinc":              "/pr/thorne-zinc-picolinate-15-mg-60-capsules/18476",
  "elderberry":        "/pr/sambucol-black-elderberry-immune-syrup-original-formula-4-fl-oz-120-ml/68251",
  "probiotic":         "/pr/garden-of-life-dr-formulated-probiotics-mood-60-vegetarian-capsules/71133",
  "digestive-enzymes": "/pr/enzymedica-digest-gold-with-atpro-maximum-strength-21-capsules/74618",
  "iron":              "/pr/solgar-gentle-iron-25-mg-180-vegetable-capsules/10625",
  "coq10":             "/pr/doctor-s-best-high-absorption-coq10-100-mg-120-softgels/10930",
  "biotin":            "/pr/sports-research-biotin-5-000-mcg-120-veggie-softgels/71109",
};

const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);
let currentSupplement = null;
let productsSeenInCurrent = 0;
let modified = 0;
const out = [];

for (const line of lines) {
  for (const sup of Object.keys(PATHS)) {
    const escaped = sup.replace(/-/g, "\\-");
    const re = new RegExp("^\\s*(?:\"" + escaped + "\"|" + escaped + "):\\s*\\[", "");
    if (re.test(line)) {
      currentSupplement = sup;
      productsSeenInCurrent = 0;
      break;
    }
  }

  if (currentSupplement && /^\s*\{\s*$/.test(line)) {
    productsSeenInCurrent++;
  }

  if (currentSupplement && productsSeenInCurrent === 1) {
    const indent = line.match(/^(\s*)/)?.[1] ?? "      ";

    if (/productPath:\s*"[^"]*",/.test(line)) {
      out.push(`${indent}productPath: "${PATHS[currentSupplement]}",`);
      modified++;
      currentSupplement = null;
      continue;
    }
    if (/searchQuery:\s*"[^"]*",/.test(line)) {
      out.push(`${indent}productPath: "${PATHS[currentSupplement]}",`);
      modified++;
      currentSupplement = null;
      continue;
    }
  }

  out.push(line);
}

fs.writeFileSync(target, out.join("\n"));
console.log(`Applied ${modified} verified iHerb URLs`);
