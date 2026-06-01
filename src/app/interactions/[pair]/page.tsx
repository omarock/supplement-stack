import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, interactionSlug, interactionBySlug, KIND_META } from "@/lib/interactions";
import ReviewedBy from "@/components/ReviewedBy";
import RelatedContent from "@/components/RelatedContent";
import { goalsForIngredient, biomarkersForIngredient, otherInteractionsFor } from "@/lib/related";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

function nameOf(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}

export function generateStaticParams() {
  return INTERACTIONS.map(i => ({ pair: interactionSlug(i.a, i.b) }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const it = interactionBySlug(pair);
  if (!it) return { title: "Supplement interaction, suppdoc.io" };
  const a = nameOf(it.a), b = nameOf(it.b);
  const title = `Does ${a} interact with ${b}?, suppdoc.io`;
  const description = `${a} and ${b}: ${it.summary} ${it.advice}`;
  return {
    title,
    description,
    keywords: `${a} and ${b}, does ${a} interact with ${b}, ${a} ${b} together, supplement interactions`,
    alternates: { canonical: `${BASE}/interactions/${pair}` },
    openGraph: { title, description },
  };
}

export default async function InteractionPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const it = interactionBySlug(pair);
  if (!it) notFound();

  const a = nameOf(it.a), b = nameOf(it.b);
  const meta = KIND_META[it.kind];

  const faq = [
    { q: `Can I take ${a} and ${b} together?`, a: `${meta.verdict}. ${it.advice}` },
    { q: `Why do ${a} and ${b} interact?`, a: it.detail },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: `Does ${a} interact with ${b}?`,
        description: it.summary,
        url: `${BASE}/interactions/${pair}`,
        lastReviewed: new Date().toISOString().slice(0, 10),
        author: authorSchema(),
        ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}),
        about: [a, b].map(n => ({ "@type": "Substance", name: n })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(f => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Interactions", item: `${BASE}/interactions` },
          { "@type": "ListItem", position: 2, name: `${a} & ${b}`, item: `${BASE}/interactions/${pair}` },
        ],
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <nav style={{ ...MM, fontSize: 11, color: TH.muted, marginBottom: 18 }}>
            <Link href="/interactions" style={{ color: TH.sageDeep, textDecoration: "none" }}>Interactions</Link>
            <span style={{ color: TH.mutedDim }}> / {a} &amp; {b}</span>
          </nav>

          {/* Answer-first: H1 + verdict (for AI extraction + featured snippets) */}
          <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            Does {a} interact with <span style={SI}>{b}</span>?
          </h1>

          <ReviewedBy />


          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 16px", borderRadius: 999,
            background: meta.bg, border: `1px solid ${meta.hue}33`, marginBottom: 18,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.hue }} />
            <span style={{ ...D, fontSize: 14, color: meta.hue }}>{meta.verdict}</span>
            <span style={{ ...MM, fontSize: 10, color: TH.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>· {it.evidence} evidence</span>
          </div>

          <p style={{ fontSize: 19, color: TH.ink, lineHeight: 1.5, margin: "0 0 8px", fontWeight: 500 }}>{it.summary}</p>
          <p style={{ fontSize: 16, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 24px" }}>{it.detail}</p>

          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px", marginBottom: 28 }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>What to do</div>
            <p style={{ fontSize: 15.5, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{it.advice}</p>
          </div>

          {/* The two ingredients */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[it.a, it.b].map(id => (
              <Link key={id} href={`/ingredients/${id}`} style={{
                display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                padding: "16px 18px", textDecoration: "none", color: "inherit",
              }}>
                <div style={{ ...MM, fontSize: 10, color: TH.mutedDim, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Learn more</div>
                <div style={{ ...D, fontSize: 16, color: TH.ink }}>{nameOf(id)}</div>
                <span style={{ fontSize: 12.5, color: TH.sageDeep, fontWeight: 600 }}>Full guide →</span>
              </Link>
            ))}
          </div>

          {/* FAQ (visible + matches JSON-LD) */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Common questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {faq.map((f, i) => (
                <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TH.ink, marginBottom: 6 }}>{f.q}</div>
                  <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </section>

          <RelatedContent groups={[
            { title: `Best supplements for…`, items: [...goalsForIngredient(it.a), ...goalsForIngredient(it.b)] },
            { title: `More ${a} & ${b} interactions`, items: [...otherInteractionsFor(it.a, pair), ...otherInteractionsFor(it.b, pair)] },
            { title: "Related biomarkers", items: [...biomarkersForIngredient(it.a), ...biomarkersForIngredient(it.b)] },
          ]} />

          {/* CTA to the live checker */}
          <div style={{ background: TH.ink, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center", marginBottom: 22 }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Check your whole stack at once</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Paste everything you take, our free checker flags every interaction, redundancy, and timing issue.</p>
            <Link href="/audit" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
            }}>Run the free interaction checker →</Link>
          </div>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center" }}>
            Educational use only, not medical advice. Interaction risk depends on dose, your health, and any medications. Always consult a qualified clinician, especially if you take prescription drugs or are pregnant or nursing.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
