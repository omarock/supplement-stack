import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SYMPTOMS, SYMPTOM_SLUGS, CATEGORY_META, type SymptomCategory } from "@/lib/symptoms";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "Supplements for Symptoms & Deficiencies (free guide) | suppdoc.io",
  description: "Tired, foggy, cramping, losing hair? See which nutrient deficiencies are commonly linked to your symptom, which biomarkers to check, and what the evidence says. Free, and we don't sell supplements.",
  keywords: "supplements for symptoms, nutrient deficiency symptoms, what deficiency causes, vitamins for fatigue brain fog hair loss, supplements for tiredness",
  alternates: { canonical: `${BASE}/symptoms` },
  openGraph: { title: "Supplements for Symptoms & Deficiencies, suppdoc.io", description: "Which nutrients are linked to your symptom, which biomarkers to check, and what the evidence says." },
};

const ORDER: SymptomCategory[] = ["energy", "cognitive", "sleep", "mood-stress", "hair-skin-nails", "muscle-joint", "immune", "digestive", "heart-circulation", "hormonal", "bone"];

const INDEX_FAQ = [
  { q: "Can a supplement fix my symptom?", a: "Sometimes, if the symptom is driven by a genuine nutrient shortfall. Many symptoms (fatigue, brain fog, hair loss, cramps) are commonly linked to low iron, B12, vitamin D, or magnesium, and correcting a measured deficiency helps. But symptoms have many causes, so the smartest move is to check the relevant biomarkers first rather than guess." },
  { q: "Which deficiencies cause the most symptoms?", a: "Low iron (fatigue, hair loss, restless legs, cold hands), vitamin B12 (brain fog, tingling, low mood), vitamin D (low mood, weak muscles, frequent colds), and magnesium (cramps, poor sleep, anxiety) are the four that show up most often. They are also cheap and easy to test." },
  { q: "Should I test before supplementing?", a: "For anything that could reflect a deficiency, yes. A simple panel (ferritin, B12, vitamin D, magnesium, thyroid) tells you whether a supplement is the right answer. You can upload your results to the bloodwork tool and we'll read the relevant markers." },
];

export default function SymptomsIndex() {
  const grouped = ORDER.map(category => ({
    category,
    items: SYMPTOM_SLUGS.filter(k => SYMPTOMS[k].category === category).sort((a, b) => SYMPTOMS[a].label.localeCompare(SYMPTOMS[b].label)),
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
            <h1 style={{ ...D, fontSize: "clamp(30px, 5.5vw, 50px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Supplements for <span style={SI}>your symptoms</span>.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 640, margin: "0 auto 22px", lineHeight: 1.55 }}>
              Tired, foggy, cramping, losing hair? See which nutrient deficiencies are commonly linked to your symptom, which biomarkers to check, and what the evidence says.
            </p>
            <Link href="/bloodwork" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15,
              boxShadow: `0 10px 24px -8px color-mix(in srgb, ${TH.sage} 50%, transparent)`,
            }}>
              Check what's actually low →
            </Link>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, marginTop: 10 }}>Free · evidence-led · we don&apos;t sell supplements</div>
          </header>

          {/* Answer block (AEO: self-contained, key-phrase first) */}
          <div style={{ maxWidth: 720, margin: "0 auto 26px", background: TH.surface, border: `1px solid ${TH.edge}`, borderLeft: `3px solid ${TH.sage}`, borderRadius: 14, padding: "16px 20px", textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: TH.ink }}>
              Many everyday symptoms, fatigue, brain fog, hair loss, cramps, and poor sleep, can be linked to a specific nutrient shortfall. Persistent fatigue, for instance, is commonly associated with low iron, vitamin D, B12, or magnesium. These guides map each symptom to the nutrients and the evidence behind them. This is education, not a diagnosis.
            </p>
          </div>

          {grouped.map(group => {
            const m = CATEGORY_META[group.category];
            return (
              <section key={group.category} style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: m.hue }} />
                  <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>{m.label}</h2>
                  <span style={{ ...MM, fontSize: 11, color: TH.muted }}>· {group.items.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 10 }}>
                  {group.items.map(k => (
                    <Link key={k} href={`/symptoms/${k}`} style={{
                      display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                      padding: "14px 16px", textDecoration: "none", color: "inherit", borderLeft: `3px solid ${m.hue}`,
                    }}>
                      <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 3 }}>{SYMPTOMS[k].label}</div>
                      <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.45 }}>{SYMPTOMS[k].nutrients.slice(0, 3).map(id => id.replace(/-/g, " ")).join(", ")}</div>
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
            Educational use only, not medical advice or diagnosis. Symptoms have many causes; consult a qualified clinician, especially for severe, persistent, or new symptoms.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
