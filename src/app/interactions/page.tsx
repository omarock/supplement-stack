import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, interactionSlug, KIND_META, type InteractionKind } from "@/lib/interactions";
import InteractionChecker from "@/components/InteractionChecker";
import EmailCapture from "@/components/EmailCapture";
import { buildCheckerData, checkerStats } from "@/lib/checker";
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
  const { options, data } = buildCheckerData();
  const stats = checkerStats();
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
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 620, margin: "0 auto 14px", lineHeight: 1.55 }}>
              Pick any two of {stats.ingredients} supplements and see whether they work better together, should be spaced apart, are redundant, or need caution, each explained with the evidence. {stats.pairs} interactions and counting.
            </p>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, marginBottom: 22 }}>Free · no signup · evidence-led</div>
          </header>

          {/* Answer block (AEO: self-contained, key-phrase first) */}
          <div style={{ maxWidth: 720, margin: "0 auto 26px", background: TH.surface, border: `1px solid ${TH.edge}`, borderLeft: `3px solid ${TH.sage}`, borderRadius: 14, padding: "16px 20px", textAlign: "left" }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", marginBottom: 8 }}>THE SHORT ANSWER</div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: TH.ink }}>
              Supplement interactions fall into four types: synergy (take them together), timing (space them apart), redundant (pick one), and caution (check with a clinician). For example, vitamin C boosts iron absorption, calcium blocks it, and CoQ10 with ubiquinol is redundant. Paste your full stack below to check yours free.
            </p>
          </div>

          {/* Interactive checker (the linkable tool) */}
          <div style={{ maxWidth: 620, margin: "0 auto 16px" }}>
            <InteractionChecker options={options} data={data} />
          </div>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Link href="/audit" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
              boxShadow: `0 10px 24px -8px ${TH.sage}80`,
            }}>
              Or check your whole stack at once →
            </Link>
          </div>

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

          {/* Embed (link-earning): bloggers paste this; the widget carries a backlink */}
          <section style={{ marginTop: 8, marginBottom: 30 }}>
            <div style={{ background: TH.ink, color: "#fff", borderRadius: 18, padding: "26px 26px" }}>
              <h2 style={{ ...D, fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Add this checker to your site, free</h2>
              <p style={{ fontSize: 14.5, opacity: 0.85, margin: "0 0 14px", lineHeight: 1.55, maxWidth: 620 }}>
                Run a health, nutrition, or fitness site? Embed the interaction checker for your readers at no cost. Just paste this snippet where you want it to appear.
              </p>
              <pre style={{
                ...MM, fontSize: 12.5, color: "#dbe7ff", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "14px 16px",
                overflowX: "auto", margin: "0 0 12px", whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>{`<iframe src="${BASE}/embed/interaction-checker" width="100%" height="440" style="border:0;border-radius:16px;max-width:620px" title="Supplement Interaction Checker by suppdoc.io" loading="lazy"></iframe>
<p style="font:13px system-ui,sans-serif;margin:8px 0 0;color:#6b7280">Powered by <a href="${BASE}/interactions" target="_blank" rel="noopener">suppdoc.io Supplement Interaction Checker</a></p>`}</pre>
              <p style={{ fontSize: 12.5, opacity: 0.7, margin: 0 }}>
                Free to embed with attribution. <Link href="/embed/interaction-checker" style={{ color: "#a9c8ff", textDecoration: "none", fontWeight: 600 }}>Preview the widget →</Link>
              </p>
            </div>
          </section>

          <section style={{ marginTop: 8, marginBottom: 30 }}>
            <EmailCapture source="interactions" headline="One safe-stacking tip a week" sub="A short weekly brief on what works together, what to separate, and what to skip. Evidence-led, no spam." cta="Get the brief" />
          </section>

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
