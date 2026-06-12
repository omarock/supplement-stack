import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITORS } from "@/lib/competitors";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export const metadata: Metadata = {
  title: "suppdoc.io vs the alternatives, honest comparisons | suppdoc.io",
  description: "Honest head-to-head comparisons of suppdoc.io vs Persona Nutrition, Ritual, HUM, Thorne, my-stack.ai, Examine.com, Hims & Hers, and Care/of. What each does best.",
  keywords: "suppdoc vs persona, ritual alternative, hum nutrition review, supplement service comparison, care of alternative",
  alternates: { canonical: "/compare" },
};

export default function CompareIndex() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        <section style={{
          padding: "var(--section-pad-y) var(--section-pad-x) 40px",
          maxWidth: 1100, margin: "0 auto", textAlign: "center",
        }}>
          <h1 style={{
            ...D, fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            How does suppdoc <span style={SI}>compare</span>?
          </h1>
          <p style={{
            fontSize: 18, color: TH.inkSoft, maxWidth: 640, margin: "0 auto",
            lineHeight: 1.55,
          }}>
            Honest head-to-heads against the other personalised supplement services. We credit competitors where they&apos;re stronger and own the areas where we differ.
          </p>
        </section>

        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: 16,
          }}>
            {COMPETITORS.map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}`} style={{
                display: "block", textDecoration: "none", color: "inherit",
                padding: "22px 24px",
                background: TH.surface, border: `1px solid ${TH.edge}`,
                borderRadius: 18,
                transition: "border-color .15s, transform .15s, box-shadow .15s",
                height: "100%",
              }}>
                <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
                  vs {c.name}
                </div>
                <h2 style={{ ...D, fontSize: 20, color: TH.ink, letterSpacing: "-0.02em", margin: "0 0 6px", lineHeight: 1.2 }}>
                  suppdoc vs {c.name}
                </h2>
                <p style={{ fontSize: 13.5, color: TH.muted, lineHeight: 1.5, margin: "0 0 14px" }}>
                  {c.tagline}
                </p>
                <p style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>
                  {c.oneLineVerdict}
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, color: TH.sageDeep,
                }}>
                  Read the comparison
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
