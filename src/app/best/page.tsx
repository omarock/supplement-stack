import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { GOALS } from "@/lib/goals";
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

export default function BestIndex() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Guides</div>
            <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Best supplements for <span style={SI}>your goal</span>.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 580, margin: "0 auto", lineHeight: 1.55 }}>
              Evidence-graded picks for what you actually want to improve, each cited, and honest about what works and what doesn&apos;t.
            </p>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: 12 }}>
            {GOALS.map(g => (
              <Link key={g.slug} href={`/best/${g.slug}`} style={{
                display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16,
                padding: "18px 20px", textDecoration: "none", color: "inherit",
              }}>
                <div style={{ ...D, fontSize: 17, color: TH.ink, marginBottom: 4 }}>Best for {g.label}</div>
                <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.45 }}>{g.intro.split(".")[0]}.</div>
                <span style={{ display: "inline-block", marginTop: 10, color: TH.sageDeep, fontSize: 13, fontWeight: 600 }}>See the picks →</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
