// Dark-mode codemod, pass 3: content templates that use a LOCAL `const th = {...}`
// hardcoded palette (ingredient/product/stacks/journal/library/me/results/etc.)
// plus a couple of product components. Makes them theme-aware:
//   1) inside `const th = {...}`: map each value to var(--c-*) BY KEY
//      (paper->surface, ink->text, burgundy->ink-bg, line->edge, sageGlow->accent-glow...)
//   2) usage `background: th.ink` -> `background: th.burgundy`  (ink is text-only now)
//   3) usage `color: th.bg`       -> `color: "#fff"`            (light text on dark buttons)
//   4) residual raw brand hex by property context (color/fill -> text var; background -> bg var)
//   5) raw navy border rgba -> var(--c-edge)
// Only touches files that define a local `th` palette (+ ProductImageGallery). Excludes
// OG images, emails, BottleMockup, theme.ts (var()/color-mix unsupported or not wanted there).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\supplement-stack\\src";
const HARD_EXCLUDE = (rel) =>
  rel.endsWith("opengraph-image.tsx") ||
  rel === "lib\\theme.ts" || rel === "lib\\email-templates.ts" || rel === "lib\\newsletter.ts" ||
  rel === "components\\BottleMockup.tsx";

const TEXT = { "#0a2540": "--c-ink", "#3c4858": "--c-ink-soft", "#6b7280": "--c-muted", "#5b6573": "--c-muted", "#3f7a52": "--c-sage-deep", "#5ba373": "--c-sage", "#e8a04a": "--c-amber", "#b5751e": "--c-amber-deep", "#a0a8b3": "--c-muted-dim", "#ff8b6b": "--c-coral", "#a78bfa": "--c-lavender" };
const BG = { "#0a2540": "--c-ink-bg", "#f6f5f1": "--c-bg", "#f0eee8": "--c-bg", "#ffffff": "--c-surface", "#fff": "--c-surface", "white": "--c-surface", "#5ba373": "--c-sage", "#3f7a52": "--c-sage-deep", "#e8a04a": "--c-amber" };
const KEY = { bg: "--c-bg", bgWarm: "--c-bg", paper: "--c-surface", card: "--c-surface", ink: "--c-ink", inkSoft: "--c-ink-soft", inkMute: "--c-muted", muted: "--c-muted", sub: "--c-muted", sage: "--c-sage", sageDeep: "--c-sage-deep", sageGlow: "--c-accent-glow", glow: "--c-accent-glow", amber: "--c-amber", amberDeep: "--c-amber-deep", coral: "--c-coral", lavender: "--c-lavender", burgundy: "--c-ink-bg", burgundyDeep: "--c-ink-bg", line: "--c-edge", lineStrong: "--c-edge-strong" };

const files = readdirSync(SRC, { recursive: true }).filter((f) => /\.(ts|tsx)$/.test(f) && !HARD_EXCLUDE(f));
const totals = { files: 0, key: 0, inkbg: 0, bgtext: 0, text: 0, bg: 0, edge: 0 };

for (const rel of files) {
  const p = join(SRC, rel);
  const orig = readFileSync(p, "utf8");
  const hasLocalTh = /const th = \{/.test(orig);
  if (!hasLocalTh && !rel.endsWith("ProductImageGallery.tsx")) continue;
  let s = orig;

  // 1) th palette: map values by key, only inside the `const th = { ... };` block
  s = s.replace(/const th = \{[\s\S]*?\};/, (block) =>
    block.replace(/(\b\w+)(\s*:\s*)"([^"]+)"/g, (m, k, sep, val) => {
      if (KEY[k]) { totals.key++; return k + sep + '"var(' + KEY[k] + ')"'; }
      return m;
    })
  );

  // 2) background: th.ink -> th.burgundy
  s = s.replace(/background:(\s*)th\.ink\b/g, (_m, sp) => { totals.inkbg++; return "background:" + sp + "th.burgundy"; });
  // 3) color: th.bg -> white
  s = s.replace(/color:(\s*)th\.bg\b/g, (_m, sp) => { totals.bgtext++; return "color:" + sp + '"#fff"'; });

  // 4) raw brand hex by property
  s = s.replace(/(color|fill):(\s*)"(#[0-9a-fA-F]{3,6})"/g, (m, prop, sp, hex) => {
    const v = TEXT[hex.toLowerCase()]; if (!v) return m; totals.text++; return prop + ":" + sp + '"var(' + v + ')"';
  });
  s = s.replace(/(background|backgroundColor):(\s*)"(#[0-9a-fA-F]{3,6}|white)"/g, (m, prop, sp, hex) => {
    const v = BG[hex.toLowerCase()]; if (!v) return m; totals.bg++; return prop + ":" + sp + '"var(' + v + ')"';
  });

  // 5) raw navy border rgba -> edge tokens
  s = s.replace(/solid rgba\(10,\s*37,\s*64,\s*0\.08\)/g, () => { totals.edge++; return "solid var(--c-edge)"; });
  s = s.replace(/solid rgba\(10,\s*37,\s*64,\s*0\.14\)/g, () => { totals.edge++; return "solid var(--c-edge-strong)"; });

  if (s !== orig) { writeFileSync(p, s); totals.files++; console.log("updated", rel); }
}
console.log("DONE", JSON.stringify(totals));
