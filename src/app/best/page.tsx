import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { GOALS, ingredientsForGoal } from "@/lib/goals";
import type { Supplement } from "@/lib/supplements";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export const metadata: Metadata = {
  title: "Best Supplements for Every Goal, evidence-graded | suppdoc.io",
  description: "Evidence-graded guides to the best supplements for sleep, energy, focus, stress, immunity, longevity and more. Honest, cited, and we don't sell supplements.",
  keywords: "best supplements, best supplements for sleep, best supplements for energy, best supplements for stress, evidence-based supplement guides",
  alternates: { canonical: "https://www.suppdoc.io/best" },
};

// Per-goal visual theme: a glyph + accent so each guide is instantly recognisable.
const GOAL_THEME: Record<string, { glyph: string; accent: string }> = {
  sleep: { glyph: "☾", accent: "#7a6d92" },
  energy: { glyph: "⚡", accent: "#c4944a" },
  focus: { glyph: "◎", accent: "#5ba373" },
  stress: { glyph: "❋", accent: "#a78bfa" },
  anxiety: { glyph: "❋", accent: "#8d6ce8" },
  recovery: { glyph: "↺", accent: "#688a6b" },
  immune: { glyph: "✛", accent: "#5ba373" },
  immunity: { glyph: "✛", accent: "#5ba373" },
  longevity: { glyph: "∞", accent: "#3f7a52" },
  beauty: { glyph: "✦", accent: "#ff8b6b" },
  skin: { glyph: "✦", accent: "#ff8b6b" },
  hair: { glyph: "✦", accent: "#ff8b6b" },
  gut: { glyph: "◍", accent: "#a87a52" },
  joint: { glyph: "◆", accent: "#7eb5d4" },
  heart: { glyph: "♥", accent: "#ff8b6b" },
  mood: { glyph: "☼", accent: "#e8a04a" },
  weight: { glyph: "⟁", accent: "#5ba373" },
  testosterone: { glyph: "♂", accent: "#5d97b8" },
  libido: { glyph: "♥", accent: "#ff8b6b" },
};
function themeFor(slug: string) {
  for (const key of Object.keys(GOAL_THEME)) {
    if (slug.includes(key)) return GOAL_THEME[key];
  }
  return { glyph: "✚", accent: TH.sage };
}

const TIER_META: Record<Supplement["evidence"], { label: string; dots: number }> = {
  "very strong": { label: "Very strong evidence", dots: 3 },
  strong: { label: "Strong evidence", dots: 2 },
  moderate: { label: "Emerging evidence", dots: 1 },
};
function topTier(supps: Supplement[]): Supplement["evidence"] {
  const rank = { "very strong": 3, strong: 2, moderate: 1 } as const;
  return supps.reduce<Supplement["evidence"]>((acc, s) => (rank[s.evidence] > rank[acc] ? s.evidence : acc), "moderate");
}

export default function BestIndex() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 38 }}>
            <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Best supplements for <span style={SI}>your goal</span>.
            </h1>
            <p className="sd-hide-mobile" style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 600, margin: "0 auto", lineHeight: 1.55 }}>
              Evidence-graded picks for what you actually want to improve, each cited, and honest about what works and what doesn&apos;t.
            </p>
            {/* Trust strip */}
            <div className="sd-hide-mobile" style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 22px", marginTop: 22 }}>
              {["Every claim cited", "We don't sell pills", `${GOALS.length} goals covered`].map(t => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: TH.inkSoft, fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.6"><path d="M5 12l5 5 9-11" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </header>

          {/* Answer block (AEO: self-contained, key-phrase first) — kept for desktop/SEO, hidden on mobile to save space */}
          <div className="sd-hide-mobile" style={{ maxWidth: 720, margin: "0 auto 30px", background: TH.surface, border: `1px solid ${TH.edge}`, borderLeft: `3px solid ${TH.sage}`, borderRadius: 14, padding: "16px 20px", textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: TH.ink }}>
              The best supplements for a goal are the few with the strongest evidence for that specific outcome, not the longest list. For each goal we rank ingredients by evidence tier, with dose, timing, and cost, and we flag where lifestyle matters more than any pill. We do not sell supplements, so the ranking stays unbiased.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
            {GOALS.map(g => {
              const supps = ingredientsForGoal(g, 99);
              const top3 = supps.slice(0, 3);
              const tier = TIER_META[topTier(supps)];
              const th = themeFor(g.slug);
              return (
                <Link key={g.slug} href={`/best/${g.slug}`} className="guide-card" style={{
                  position: "relative", display: "flex", flexDirection: "column", gap: 12,
                  background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18,
                  padding: 22, textDecoration: "none", color: "inherit",
                  boxShadow: "0 1px 3px rgba(10,37,64,0.04)",
                }}>
                  {/* Header: glyph tile + evidence tier */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <span style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, color: th.accent, background: `${th.accent}14`,
                    }} aria-hidden>{th.glyph}</span>
                    <span title={tier.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: 999,
                          background: i < tier.dots ? th.accent : TH.edgeStrong,
                        }} />
                      ))}
                    </span>
                  </div>

                  <div>
                    <div style={{ ...D, fontSize: 19, color: TH.ink, letterSpacing: "-0.015em", marginBottom: 5, textTransform: "capitalize" }}>
                      Best for {g.label}
                    </div>
                    <div style={{ fontSize: 13.5, color: TH.muted, lineHeight: 1.5 }}>{g.intro.split(".")[0]}.</div>
                  </div>

                  {/* Top picks preview */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                    {top3.map(s => (
                      <span key={s.id} style={{
                        ...MM, fontSize: 10.5, color: TH.inkSoft, background: TH.bg,
                        border: `1px solid ${TH.edge}`, borderRadius: 999, padding: "3px 9px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140,
                      }}>{s.name}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${TH.edge}` }}>
                    <span style={{ ...MM, fontSize: 11, color: TH.muted }}>{supps.length} researched picks</span>
                    <span className="guide-arrow" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: th.accent, fontSize: 13, fontWeight: 600 }}>
                      See the picks
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .guide-card { transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }
        .guide-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px -16px rgba(10,37,64,0.30); border-color: rgba(10,37,64,0.16); }
        .guide-card:hover .guide-arrow { gap: 9px; }
        .guide-arrow { transition: gap .16s ease; }
      `}</style>
    </div>
  );
}
