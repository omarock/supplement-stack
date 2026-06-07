// One-shot generator for the Product Hunt 240x240 thumbnail.
// Renders the official Suppdoc sprout mark (from SuppdocLogo.tsx) onto a
// simple branded background, at exactly 240x240, using sharp (vector -> PNG).
// Run from the supplement-stack folder so sharp resolves:  node scripts/make-ph-logo.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\growth\\product-hunt-assets";
mkdirSync(OUT, { recursive: true });

// Gradient + shape defs copied verbatim from the live SDMark component so the
// thumbnail is pixel-identical to the site logo, just larger.
const markDefs = `
    <linearGradient id="stem" gradientUnits="userSpaceOnUse" x1="20" y1="36" x2="20" y2="12">
      <stop offset="0%" stop-color="#3f7a52"/>
      <stop offset="100%" stop-color="#5ba373"/>
    </linearGradient>
    <linearGradient id="lfl" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#5ba373"/>
      <stop offset="100%" stop-color="#a8c97a"/>
    </linearGradient>
    <linearGradient id="lfr" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#5ba373"/>
      <stop offset="100%" stop-color="#e8a04a"/>
    </linearGradient>
    <radialGradient id="bud" cx="0.35" cy="0.3" r="0.75">
      <stop offset="0%" stop-color="#ffe0a8"/>
      <stop offset="60%" stop-color="#e8a04a"/>
      <stop offset="100%" stop-color="#b5751e"/>
    </radialGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#f5c280" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f5c280" stop-opacity="0"/>
    </radialGradient>`;

const markBody = `
    <circle cx="20" cy="10" r="8" fill="url(#glow)"/>
    <path d="M 20 36 Q 20 24 20 12" stroke="url(#stem)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill="url(#lfl)"/>
    <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill="url(#lfr)"/>
    <circle cx="20" cy="10" r="3.6" fill="url(#bud)"/>
    <circle cx="19" cy="9" r="1.2" fill="rgba(255,255,255,0.5)"/>`;

// Centre the 40x40 mark in a 240 square: scale 5, translate so the sprout's
// visual centre (20,21) lands at (120,120). Leaves ~45px breathing margin.
function svg({ bgDefs = "", bgFill }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>${bgDefs}${markDefs}
  </defs>
  <rect width="240" height="240" fill="${bgFill}"/>
  <g transform="translate(20,15) scale(5)">${markBody}
  </g>
</svg>`;
}

const variants = [
  { name: "cream", svg: svg({ bgFill: "#f6f5f1" }) },
  { name: "white", svg: svg({ bgFill: "#ffffff" }) },
  {
    name: "ink",
    svg: svg({
      bgDefs: `
    <radialGradient id="bgHalo" cx="0.5" cy="0.32" r="0.85">
      <stop offset="0%" stop-color="#16365f"/>
      <stop offset="100%" stop-color="#0a2540"/>
    </radialGradient>`,
      bgFill: "url(#bgHalo)",
    }),
  },
];

for (const v of variants) {
  const out = join(OUT, `suppdoc-ph-${v.name}-240.png`);
  await sharp(Buffer.from(v.svg)).png().toFile(out);
  console.log("wrote", out);
}

// Final square logo (chosen background: ink / deep navy) in every size the
// directories and Product Hunt ask for. The viewBox keeps it crisp at any size.
const inkSvg = variants.find((v) => v.name === "ink").svg;
for (const size of [240, 400, 512]) {
  const out = join(OUT, `suppdoc-logo-square-${size}.png`);
  await sharp(Buffer.from(inkSvg)).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}
console.log("done");
