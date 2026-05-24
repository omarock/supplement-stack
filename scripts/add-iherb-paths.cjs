/* eslint-disable */
// Add verified direct iHerb product URLs to bestsellers
const fs = require("fs");
const path = require("path");
const target = path.join(__dirname, "..", "src", "lib", "products.ts");

// Verified iHerb /pr/ URLs for the 24 bestsellers
// Format: supplement_id -> productPath (relative to iherb.com)
const PATHS = {
  "d3k2":              "/pr/now-foods-vitamin-d-3-k-2-120-veg-capsules/72717",
  "omega3":            "/pr/sports-research-triple-strength-omega-3-fish-oil-1-250-mg-90-softgels/82061",
  "omega3-algae":      "/pr/ovega-3-plant-based-omega-3-500-mg-60-softgels/76268",
  "multivit":          "/pr/garden-of-life-mykind-organics-women-s-multi-120-vegan-tablets/49568",
  "mag-glycinate":     "/pr/doctor-s-best-high-absorption-magnesium-100-mg-240-tablets/15295",
  "ashwagandha":       "/pr/jarrow-formulas-ashwagandha-300-mg-120-veggie-capsules/14751",
  "l-theanine":        "/pr/now-foods-l-theanine-200-mg-120-veg-capsules/13183",
  "glycine":           "/pr/now-foods-glycine-pure-powder-1-lb-454-g/35",
  "b12":               "/pr/jarrow-formulas-methyl-b-12-cherry-flavor-5-000-mcg-60-lozenges/14792",
  "b-complex":         "/pr/thorne-stress-b-complex-60-capsules/49180",
  "rhodiola":          "/pr/now-foods-rhodiola-500-mg-120-veggie-capsules/468",
  "lions-mane":        "/pr/host-defense-mushrooms-lion-s-mane-immune-and-cerebral-support-60-vegetarian-capsules/52181",
  "creatine":          "/pr/optimum-nutrition-micronized-creatine-powder-unflavored-1-32-lb-600-g/79396",
  "collagen":          "/pr/sports-research-collagen-peptides-unflavored-16-oz-454-g/76679",
  "curcumin":          "/pr/doctor-s-best-curcumin-high-absorption-with-c3-complex-and-bioperine-500-mg-180-veggie-capsules/15296",
  "glucosamine":       "/pr/now-foods-glucosamine-chondroitin-msm-180-veg-capsules/740",
  "vit-c":             "/pr/now-foods-vitamin-c-1000-with-rose-hips-250-tablets/642",
  "zinc":              "/pr/thorne-zinc-picolinate-15-mg-60-capsules/24862",
  "elderberry":        "/pr/sambucol-black-elderberry-syrup-original-formula-7-8-fl-oz-230-ml/72519",
  "probiotic":         "/pr/garden-of-life-dr-formulated-probiotics-mood-30-billion-60-vegetarian-capsules/77470",
  "digestive-enzymes": "/pr/enzymedica-digest-gold-with-atpro-180-capsules/74720",
  "iron":              "/pr/solgar-gentle-iron-25-mg-180-vegetable-capsules/41330",
  "coq10":             "/pr/doctor-s-best-high-absorption-coq10-with-bioperine-100-mg-120-veggie-softgels/15217",
  "biotin":            "/pr/sports-research-biotin-with-organic-virgin-coconut-oil-5-000-mcg-120-veggie-softgels/77471",
};

const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);

let currentSupplement = null;
let productsSeenInCurrent = 0;
let modified = 0;
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect new supplement section start
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

  // For the FIRST product in each supplement, replace searchQuery with productPath (if missing)
  // OR replace existing productPath with the verified one
  if (currentSupplement && productsSeenInCurrent === 1) {
    const indent = line.match(/^(\s*)/)?.[1] ?? "      ";

    // If this line is `productPath: "..."`, replace it
    if (/productPath:\s*"[^"]*",/.test(line)) {
      out.push(`${indent}productPath: "${PATHS[currentSupplement]}",`);
      modified++;
      currentSupplement = null;
      continue;
    }

    // If this line is `searchQuery: "..."`, replace it with productPath
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
console.log(`Modified ${modified} bestseller product paths`);
