/**
 * Premium, swipeable showcase of the ready-made stacks. A horizontal rail of
 * gradient-cover cards (no hydration, pure-CSS hover + scroll-snap). Reusable:
 * drop it on /results, the homepage, etc. Featured = top 6 by popularity.
 */
import { type ReactNode } from "react";
import Link from "next/link";
import { STACKS } from "@/lib/stacks";
import { TH, FONTS, D, SI, MM } from "@/lib/theme";

const SERIF = { fontFamily: FONTS.serifItalic, fontStyle: "normal" as const, fontWeight: 400 };
const FEATURED = [...STACKS].sort((a, b) => (a.popularity ?? 99) - (b.popularity ?? 99)).slice(0, 6);

export default function PremadeStacksShowcase({
  eyebrow = "Ready-made stacks",
  title,
  subtitle = "Expert-built blends for one goal, each graded by the same evidence standard as your stack above.",
}: { eyebrow?: string; title?: ReactNode; subtitle?: string } = {}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 22px" }}>
        <div style={{ ...MM, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: TH.sageDeep, marginBottom: 10 }}>{eyebrow}</div>
        <h2 style={{ ...D, fontWeight: 500, fontSize: "clamp(26px, 6vw, 34px)", color: TH.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.12 }}>
          {title ?? (<>Or explore a <span style={{ ...SI, color: TH.sageDeep }}>ready-made</span> stack.</>)}
        </h2>
        <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.55, margin: "10px 0 0" }}>{subtitle}</p>
      </div>

      <div className="sd-stackrail">
        {FEATURED.map(s => (
          <Link key={s.id} href={`/stacks/${s.slug}`} className="sd-stackcard" aria-label={`${s.name}: ${s.tagline}`} style={{
            display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit",
            borderRadius: 18, overflow: "hidden", border: `1px solid ${TH.edge}`,
            background: TH.surface, boxShadow: "0 10px 30px -18px rgba(10,37,64,0.22)",
          }}>
            <div style={{ background: s.coverBg, height: 122, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span aria-hidden style={{ ...SERIF, fontSize: 52, color: s.coverInk, lineHeight: 1 }}>{s.coverGlyph}</span>
              <span style={{ position: "absolute", top: 12, left: 14, ...MM, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: s.coverInk, opacity: 0.82 }}>{s.category}</span>
            </div>
            <div style={{ padding: "15px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ ...D, fontSize: 16.5, color: TH.ink, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: TH.inkSoft, lineHeight: 1.4, marginTop: 5 }}>{s.tagline}</div>
              <div style={{ flex: 1, minHeight: 12 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.02em", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${TH.edge}` }}>
                <span>{s.supplementIds.length} supplements</span>
                <span>{s.monthlyCostRange}/mo</span>
              </div>
              <div style={{ ...MM, fontSize: 11, fontWeight: 600, color: TH.sageDeep, marginTop: 11 }}>View stack &rarr;</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link href="/stacks" style={{ ...MM, fontSize: 12.5, fontWeight: 600, color: TH.ink, textDecoration: "none", borderBottom: `1.5px solid ${TH.sageDeep}`, paddingBottom: 2 }}>
          Browse all {STACKS.length} stacks &rarr;
        </Link>
      </div>

      <style>{`
        .sd-stackrail {
          display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
          padding: 4px 4px 12px; margin: 0 -4px;
          scrollbar-width: thin; -webkit-overflow-scrolling: touch;
        }
        .sd-stackrail::-webkit-scrollbar { height: 6px; }
        .sd-stackrail::-webkit-scrollbar-thumb { background: var(--c-edge-strong); border-radius: 999px; }
        .sd-stackrail > a { flex: 0 0 246px; scroll-snap-align: start; transition: transform .24s cubic-bezier(.2,.7,.2,1), box-shadow .24s ease; }
        .sd-stackrail > a:hover, .sd-stackrail > a:focus-visible { transform: translateY(-5px); box-shadow: 0 24px 48px -22px rgba(10,37,64,0.34) !important; }
        @media (max-width: 520px) { .sd-stackrail > a { flex: 0 0 80%; } }
        @media (prefers-reduced-motion: reduce) { .sd-stackrail > a, .sd-stackrail > a:hover { transform: none; } }
      `}</style>
    </section>
  );
}
