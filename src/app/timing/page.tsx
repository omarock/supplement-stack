import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { TIMING, TIMING_IDS, WINDOW_META, type TimingWindow } from "@/lib/timing";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "Best Time to Take Your Supplements (full guide) | suppdoc.io",
  description: "When to take every supplement: morning or night, with or without food, before or after meals. Evidence-led timing for magnesium, vitamin D, creatine, iron, omega-3, ashwagandha and 80+ more.",
  keywords: "best time to take supplements, when to take supplements, supplement timing, morning or night supplements, supplements with or without food, supplement schedule",
  alternates: { canonical: `${BASE}/timing` },
  openGraph: { title: "Best Time to Take Your Supplements, suppdoc.io", description: "When to take every supplement, morning or night, with or without food, explained with the evidence." },
};

function nameOf(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}

// Display order, by time of day.
const ORDER: TimingWindow[] = ["morning", "with-meals", "pre-workout", "anytime", "split", "evening", "bedtime"];

const INDEX_FAQ = [
  { q: "Does it matter what time of day you take supplements?", a: "For some, a lot. Fat-soluble vitamins (D, K, E, A) and omega-3 absorb far better with a fat-containing meal. Stimulating ones (rhodiola, B12, tyrosine) suit the morning, while calming ones (magnesium glycinate, glycine, melatonin) suit the evening. Iron needs an empty stomach with vitamin C and away from coffee and calcium. For creatine and beta-alanine, daily consistency matters far more than the hour." },
  { q: "Which supplements should be taken at night?", a: "Magnesium glycinate, glycine, melatonin, 5-HTP, and valerian are best in the evening or before bed, because they are calming or cue sleep. Ashwagandha also suits the evening for stress and sleep." },
  { q: "Which supplements should be taken with food?", a: "Anything fat-soluble: vitamin D3, K2, E, A, omega-3, CoQ10, curcumin, and most carotenoids. Take them with a meal that contains fat. Iron and rhodiola are the main ones that work better on an empty stomach." },
];

export default function TimingIndex() {
  const grouped = ORDER.map(window => ({
    window,
    items: TIMING_IDS.filter(id => TIMING[id].window === window).sort((a, b) => nameOf(a).localeCompare(nameOf(b))),
  })).filter(g => g.items.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: INDEX_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 30 }}>
            <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Best time to take <span style={SI}>your supplements</span>.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 620, margin: "0 auto 22px", lineHeight: 1.55 }}>
              Morning or night, with or without food, before or after meals. Practical, evidence-led timing for {TIMING_IDS.length} supplements.
            </p>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15,
              boxShadow: `0 10px 24px -8px color-mix(in srgb, ${TH.sage} 50%, transparent)`,
            }}>
              Get a stack with timing built in →
            </Link>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, marginTop: 10 }}>Free · no signup · evidence-led</div>
          </header>

          {/* Answer block (AEO: self-contained, key-phrase first) */}
          <div style={{ maxWidth: 720, margin: "0 auto 26px", background: TH.surface, border: `1px solid ${TH.edge}`, borderLeft: `3px solid ${TH.sage}`, borderRadius: 14, padding: "16px 20px", textAlign: "left" }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", marginBottom: 8 }}>THE SHORT ANSWER</div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: TH.ink }}>
              The best time to take a supplement depends on what it is. Fat-soluble vitamins (D, K, E, A) and omega-3 absorb best with a meal that contains fat. Stimulating ingredients suit the morning, calming ones like magnesium glycinate suit the evening, and iron works best on an empty stomach with vitamin C.
            </p>
          </div>

          {grouped.map(group => {
            const m = WINDOW_META[group.window];
            return (
              <section key={group.window} style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: m.hue }} />
                  <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>{m.label}</h2>
                  <span style={{ ...MM, fontSize: 11, color: TH.muted }}>· {group.items.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 10 }}>
                  {group.items.map(id => (
                    <Link key={id} href={`/timing/${id}`} style={{
                      display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                      padding: "14px 16px", textDecoration: "none", color: "inherit",
                      borderLeft: `3px solid ${m.hue}`,
                    }}>
                      <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 3 }}>
                        When to take {nameOf(id)}
                      </div>
                      <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.45 }}>{TIMING[id].bestTime}</div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <section style={{ marginTop: 8, marginBottom: 24 }}>
            <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Common questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INDEX_FAQ.map((f, i) => (
                <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TH.ink, marginBottom: 6 }}>{f.q}</div>
                  <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </section>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center", marginTop: 10 }}>
            Educational use only, not medical advice. Timing and dose depend on your health and medications. Consult a qualified clinician before changing your supplements.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
