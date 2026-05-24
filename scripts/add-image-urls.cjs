/* eslint-disable */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "src", "lib", "products.ts");
const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);

const supplements = [
  "d3k2", "omega3", "omega3-algae", "multivit", "mag-glycinate",
  "ashwagandha", "l-theanine", "glycine", "b12", "b-complex",
  "rhodiola", "lions-mane", "creatine", "collagen", "curcumin",
  "glucosamine", "vit-c", "zinc", "elderberry", "probiotic",
  "digestive-enzymes", "iron", "coq10", "biotin",
];

let currentSupplement = null;
let productsSeenInCurrent = 0;
const out = [];

for (const line of lines) {
  // Detect new supplement section (e.g. `  d3k2: [` or `  "d3k2": [`)
  for (const sup of supplements) {
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

  out.push(line);

  // After the brandInk line of the FIRST product, insert imageUrl
  if (currentSupplement && productsSeenInCurrent === 1 && /brandInk:\s*"[^"]*",\s*$/.test(line)) {
    const indent = line.match(/^(\s*)/)[1];
    out.push(`${indent}imageUrl: "/products/${currentSupplement}.jpg",`);
    console.log("✓ " + currentSupplement);
    currentSupplement = null;
  }
}

fs.writeFileSync(target, out.join("\n"));
console.log("\nDone");
