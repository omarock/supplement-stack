import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, interactionSlug, KIND_META, type InteractionKind } from "@/lib/interactions";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "Supplement Interaction Checker, free & evidence-led | suppdoc.io",
  description: "Free supplement interaction checker. See which supplements work better together, which to space apart, which are redundant, and which need caution, each explained with the evidence. Or paste your whole stack for an instant check.",
  keywords: "supplement interaction checker, supplement interactions, do supplements interact, supplement combinations, which supplements not to take together",
  alternates: { canonical: `${BASE}/interactions` },
  openGraph: { title: "Supplement Interaction Checker, suppdoc.io", description: "Which supplements work together, which to separate, and which are redundant, explained with evidence." },
};

function nameOf(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}

const ORDER: InteractionKind[] = ["caution", "timing", "redundant", "synergy"];

const INDEX_FAQ = [
  { q: "Is there a free supplement interaction checker?", a: "Yes. suppdoc's interaction checker is free, paste your supplements and we flag interactions, redundancies, and timing issues instantly, each explained with the evidence." },
  { q: "Which supplements should not be taken together?", a: "Common ones to separate or reconsider include iron with calcium (timing), two omega-3 sources or CoQ10 with ubiquinol (redundant), and blood-thinning combinations like omega-3 with ginkgo (caution). See the full list below." },
];

export default function InteractionsIndex() {
  const grouped = ORDER.map(kind => ({
    kind,
    items: INTERACTIONS.filter(i => i.kind === kind).sort((x, y) => nameOf(x.a).localeCompare(nameOf(y.a))),
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
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Free tool</div>
            <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Supplement <span style={SI}>interaction</span> checker.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 600, margin: "0 auto 22px", lineHeight: 1.55 }}>
              Which supplements work better together, which to space apart, which are redundant, and which need caution, each explained with the evidence.
            </p>
            <Link href="/audit" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15,
              boxShadow: `0 10px 24px -8px ${TH.sage}80`,
            }}>
              Check your whole stack →
            </Link>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, marginTop: 10 }}>Free · no signup · evidence-led</div>
          </header>

          {grouped.map(group => {
            const m = KIND_META[group.kind];
            return (
              <section key={group.kind} style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: m.hue }} />
                  <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>{m.label}</h2>
                  <span style={{ ...MM, fontSize: 11, color: TH.muted }}>· {group.items.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 10 }}>
                  {group.items.map(it => {
                    const slug = interactionSlug(it.a, it.b);
                    return (
                      <Link key={slug} href={`/interactions/${slug}`} style={{
                        display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                        padding: "14px 16px", textDecoration: "none", color: "inherit",
                        borderLeft: `3px solid ${m.hue}`,
                      }}>
                        <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 3 }}>
                          {nameOf(it.a)} <span style={{ color: TH.mutedDim, fontWeight: 400 }}>+</span> {nameOf(it.b)}
                        </div>
                        <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.45 }}>{it.summary}</div>
                      </Link>
                    );
                  })}
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
            Educational use only, not medical advice. Interaction risk depends on dose, your health, and medications. Consult a qualified clinician before changing your supplements.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
