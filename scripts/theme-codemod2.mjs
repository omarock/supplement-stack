// Dark-mode codemod, pass 2: the ink-as-background cases the simple pass missed.
//   A) ternary backgrounds:   background: cond ? TH.ink : x   ->  ...TH.inkBg...
//   B) dark gradient bands:    linear-gradient(${TH.ink} 0%   ->  ${TH.inkBg} 0%
//   C) white-bg + ink text:    background:"#fff", color: TH.ink -> color: TH.inkBg
// All three keep these surfaces dark / their text dark in BOTH themes (no invisible text).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:\\Users\\X1\\Desktop\\AI Supplement Stack Generator\\supplement-stack\\src";
const EXCLUDE = new Set(["lib\\theme.ts", "lib\\email-templates.ts", "lib\\newsletter.ts"]);
const excluded = (rel) => rel.endsWith("opengraph-image.tsx") || EXCLUDE.has(rel);
const files = readdirSync(SRC, { recursive: true }).filter((f) => /\.(ts|tsx)$/.test(f) && !excluded(f));

const totals = { ternary: 0, gradient: 0, white: 0, files: 0 };
for (const rel of files) {
  const p = join(SRC, rel);
  const orig = readFileSync(p, "utf8");
  let s = orig;

  // A) ternary background containing TH.ink (the `?` requirement + no comma in the
  //    span means a sibling `color:` ternary on the same line is never touched).
  s = s.replace(/background:([^;},\n]*\?[^;},\n]*)\bTH\.ink\b/g, (_m, mid) => { totals.ternary++; return "background:" + mid + "TH.inkBg"; });

  // B) gradient stop `${TH.ink} 0%`
  s = s.replace(/\$\{TH\.ink\}(\s+0%)/g, (_m, tail) => { totals.gradient++; return "${TH.inkBg}" + tail; });

  // C) literal white background paired with ink text
  s = s.replace(/(background:\s*"(?:#fff|#ffffff|white)",\s*color:\s*)TH\.ink\b/g, (_m, head) => { totals.white++; return head + "TH.inkBg"; });

  if (s !== orig) { writeFileSync(p, s); totals.files++; console.log("updated", rel); }
}
console.log("DONE", JSON.stringify(totals));
