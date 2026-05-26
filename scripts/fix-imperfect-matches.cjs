#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const PRODUCTS_FILE = path.join(__dirname, "..", "src", "lib", "products.ts");

let src = fs.readFileSync(PRODUCTS_FILE, "utf8");

const fixes = [
  {
    id: "boswellia",
    productPath: "/pr/now-foods-boswellia-extract-120-veg-capsules/429",
    imageUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now04614/v/85.jpg",
    newBrand: "NOW Foods",
    newProductName: "Boswellia Extract 500mg",
  },
  {
    id: "phosphatidylcholine",
    productPath: "/pr/bodybio-pc-liposomal-phospholipid-complex-60-softgels-650-mg-per-softgel/105887",
    imageUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/dio/dio91580/v/73.jpg",
  },
  {
    id: "bcaa",
    productPath: "/pr/xtend-7g-bcaa-italian-blood-orange-2-82-lbs-1-28-kg/75075",
    imageUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/sci/sci02166/v/86.jpg",
  },
  {
    id: "beetroot",
    productPath: "/pr/evlution-nutrition-beetmode-concentrated-beet-crystals-black-cherry-6-88-oz-195-g/97836",
    imageUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/evl/evl02255/v/40.jpg",
    newBrand: "EVLution Nutrition",
    newProductName: "BeetMode Concentrated Beet Crystals",
  },
  {
    id: "l-citrulline",
    productPath: "/pr/now-foods-l-citrulline-pure-powder-4-oz-113-g/15501",
    imageUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now00214/v/47.jpg",
  },
];

let updated = 0;
for (const fix of fixes) {
  const keyVariants = [`${fix.id}:`, `"${fix.id}":`];
  let regex = null;
  for (const key of keyVariants) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const r = new RegExp(`(${esc}\\s*\\[\\s*\\{[^}]*?)(\\n\\s*\\},?\\s*\\]?)`, "s");
    if (r.test(src)) { regex = r; break; }
  }
  if (!regex) { console.warn("[skip]", fix.id); continue; }
  const m = src.match(regex);
  let head = m[1];
  const tail = m[2];

  if (head.includes("productPath:")) {
    head = head.replace(/productPath:\s*"[^"]+"/, `productPath: ${JSON.stringify(fix.productPath)}`);
  } else if (head.includes("badge:")) {
    head = head.replace(/(badge:\s*"[^"]+",)/, `$1\n    productPath: ${JSON.stringify(fix.productPath)},`);
  }

  if (head.includes("imageUrl:")) {
    head = head.replace(/imageUrl:\s*"[^"]+"/, `imageUrl: ${JSON.stringify(fix.imageUrl)}`);
  } else {
    head = head.replace(/(brandInk:\s*"[^"]+",)/, `$1\n    imageUrl: ${JSON.stringify(fix.imageUrl)},`);
  }

  if (fix.newBrand) {
    head = head.replace(/brand:\s*"[^"]+"/, `brand: ${JSON.stringify(fix.newBrand)}`);
  }
  if (fix.newProductName) {
    head = head.replace(/productName:\s*"[^"]+"/, `productName: ${JSON.stringify(fix.newProductName)}`);
  }

  src = src.replace(m[0], head + tail);
  updated++;
}

fs.writeFileSync(PRODUCTS_FILE, src);
console.log("Fixed:", updated);
