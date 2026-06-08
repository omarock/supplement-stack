// Dark-mode codemod. Three safe, deterministic transforms over src so the inline
// styles work with theme-aware CSS variables:
//   1) `${TH.x}HH` (alpha-append hex) -> color-mix(in srgb, ${TH.x} P%, transparent)
//      (var() cannot be alpha-appended; color-mix is the theme-safe equivalent)
//   2) `background: TH.ink` -> `background: TH.inkBg`  (keep navy bands/buttons dark in both themes)
//   3) `color: TH.surface`  -> `color: "#fff"`         (white text on colored surfaces stays light)
// Excludes theme.ts, OG images and emails (those render where var()/color-mix are unsupported).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\supplement-stack\\src";
const EXCLUDE = new Set(["lib\\theme.ts", "lib\\email-templates.ts", "lib\\newsletter.ts"]);
const excluded = (rel) => rel.endsWith("opengraph-image.tsx") || EXCLUDE.has(rel);

const files = readdirSync(SRC, { recursive: true })
  .filter((f) => /\.(ts|tsx)$/.test(f) && !excluded(f));

const totals = { alpha: 0, inkbg: 0, surface: 0, files: 0 };

for (const rel of files) {
  const p = join(SRC, rel);
  const orig = readFileSync(p, "utf8");
  let s = orig;

  // 1) alpha-append hex -> color-mix
  s = s.replace(/\$\{TH\.(\w+)\}([0-9a-fA-F]{2})(?![0-9a-fA-F])/g, (_m, name, hex) => {
    totals.alpha++;
    const pct = Math.round((parseInt(hex, 16) / 255) * 100);
    return "color-mix(in srgb, ${TH." + name + "} " + pct + "%, transparent)";
  });

  // 2) background ink -> inkBg  (plain + template form)
  s = s.replace(/background:(\s*)TH\.ink\b/g, (_m, sp) => { totals.inkbg++; return "background:" + sp + "TH.inkBg"; });
  s = s.replace(/background:(\s*)\$\{TH\.ink\}/g, (_m, sp) => { totals.inkbg++; return "background:" + sp + "${TH.inkBg}"; });

  // 3) color: TH.surface -> white
  s = s.replace(/color:(\s*)TH\.surface\b/g, (_m, sp) => { totals.surface++; return "color:" + sp + '"#fff"'; });

  if (s !== orig) { writeFileSync(p, s); totals.files++; console.log("updated", rel); }
}

console.log("DONE", JSON.stringify(totals));
