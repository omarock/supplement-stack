// Dark-mode codemod, pass 4: sweep the remaining one-off hardcoded accent colors
// that aren't in the brand palette and read low-contrast in dark.
//   - raw light page wrappers  background:"#f6f5f1",color:"#0a2540" -> var(--c-bg)/var(--c-ink)
//   - danger/error text (#991b1b,#b91c1c) -> var(--c-destructive); error/amber tint bgs -> color-mix
//   - gold/amber/orange/maroon/indigo accent TEXT -> the nearest "-deep" / accent token
// Property-scoped (only color/fill for text, background for surfaces). Excludes OG images,
// emails, theme.ts, BottleMockup (literal hex required there). Leaves Amazon brand colors,
// white text on colored buttons, inputs, and medium data-viz legend colors untouched.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\supplement-stack\\src";
const EXCL = (rel) => rel.endsWith("opengraph-image.tsx") || rel === "lib\\theme.ts" || rel === "lib\\email-templates.ts" || rel === "lib\\newsletter.ts" || rel === "components\\BottleMockup.tsx";

const TEXT = {
  "#991b1b": "var(--c-destructive)", "#b91c1c": "var(--c-destructive)",
  "#92400e": "var(--c-amber-deep)", "#7c4a12": "var(--c-amber-deep)", "#7c5c1f": "var(--c-amber-deep)",
  "#78350f": "var(--c-amber-deep)", "#7a4a10": "var(--c-amber-deep)", "#a87a52": "var(--c-amber-deep)",
  "#c2410c": "var(--c-amber-deep)", "#7d2e3a": "var(--c-sage-deep)", "#4338ca": "var(--c-lavender)",
  "#374151": "var(--c-ink-soft)",
};
const BG = {
  "#fef2f2": "color-mix(in srgb, var(--c-destructive) 12%, transparent)",
  "#fef3c7": "color-mix(in srgb, var(--c-amber) 16%, transparent)",
};

const files = readdirSync(SRC, { recursive: true }).filter((f) => /\.(ts|tsx)$/.test(f) && !EXCL(f));
const totals = { files: 0, wrapper: 0, text: 0, bg: 0, border: 0 };

for (const rel of files) {
  const p = join(SRC, rel);
  const orig = readFileSync(p, "utf8");
  let s = orig;

  // raw light page wrapper (exact pair only)
  s = s.replace(/background: "#f6f5f1", color: "#0a2540"/g, () => { totals.wrapper++; return 'background: "var(--c-bg)", color: "var(--c-ink)"'; });

  // accent text
  s = s.replace(/(color|fill):(\s*)"(#[0-9a-fA-F]{6})"/g, (m, prop, sp, hex) => {
    const v = TEXT[hex.toLowerCase()]; if (!v) return m; totals.text++; return prop + ":" + sp + '"' + v + '"';
  });

  // tint backgrounds
  s = s.replace(/(background|backgroundColor):(\s*)"(#[0-9a-fA-F]{6})"/g, (m, prop, sp, hex) => {
    const v = BG[hex.toLowerCase()]; if (!v) return m; totals.bg++; return prop + ":" + sp + '"' + v + '"';
  });

  // light-red error border
  s = s.replace(/solid #fecaca/g, () => { totals.border++; return "solid color-mix(in srgb, var(--c-destructive) 35%, transparent)"; });

  if (s !== orig) { writeFileSync(p, s); totals.files++; console.log("updated", rel); }
}
console.log("DONE", JSON.stringify(totals));
