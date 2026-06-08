// Logo exploration v3: MODERN & VIBRANT app-icons, NO nature.
// Gradient rounded tile + white symbol. Symbols: S monogram, capsule, tablet,
// checkmark (evidence), progress curve (tracking), molecule (science).
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\logo-concepts";
mkdirSync(OUT, { recursive: true });

export const CONCEPTS = [
  {
    id: "mono-s", name: "Monogramme S", grad: "g1",
    defs: `<linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a34a"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>`,
    inner: `<path d="M32 17 A8 8 0 1 0 24 25 A8 8 0 1 1 16 33" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "capsule", name: "Gelule", grad: "g2",
    defs: `<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a34a"/><stop offset="1" stop-color="#86d633"/></linearGradient>`,
    inner: `<g transform="rotate(-38 24 24)">
      <rect x="9" y="19" width="30" height="10" rx="5" fill="none" stroke="#fff" stroke-width="2.6"/>
      <path d="M24 19 H14 A5 5 0 0 0 14 29 H24 Z" fill="#fff"/>
    </g>`,
  },
  {
    id: "tablet", name: "Comprime", grad: "g3",
    defs: `<linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>`,
    inner: `<circle cx="24" cy="24" r="13" fill="#fff"/>
      <line x1="24" y1="12.5" x2="24" y2="35.5" stroke="rgba(8,30,50,0.16)" stroke-width="2.2"/>`,
  },
  {
    id: "check", name: "Coche", grad: "g4",
    defs: `<linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#84cc16"/></linearGradient>`,
    inner: `<path d="M14 25 L21 32 L34 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "curve", name: "Courbe progres", grad: "g5",
    defs: `<linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>`,
    inner: `<path d="M13 33 L20 27 L26 30 L35 16" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="35" cy="16" r="3.4" fill="#fff"/>`,
  },
  {
    id: "molecule", name: "Molecule", grad: "g6",
    defs: `<linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a34a"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>`,
    inner: `<g stroke="#fff" stroke-width="2.4"><line x1="17" y1="30" x2="31" y2="30"/><line x1="17" y1="30" x2="24" y2="17"/><line x1="31" y1="30" x2="24" y2="17"/></g>
      <circle cx="17" cy="30" r="4" fill="#fff"/><circle cx="31" cy="30" r="4" fill="#fff"/><circle cx="24" cy="17" r="4" fill="#fff"/>`,
  },
];

function svg(c, { size = 256 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><defs>${c.defs}</defs><rect width="48" height="48" rx="11" fill="url(#${c.grad})"/>${c.inner}</svg>`;
}

for (const c of CONCEPTS) {
  await sharp(Buffer.from(svg(c))).png().toFile(join(OUT, `${c.id}-256.png`));
  await sharp(Buffer.from(svg(c, { size: 32 }))).resize(32, 32).png().toFile(join(OUT, `${c.id}-32.png`));
  console.log("wrote", c.id);
}
console.log("done");
