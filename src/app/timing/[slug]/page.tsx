import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { TIMING, TIMING_IDS, timingFor, timingIndexable, WINDOW_META } from "@/lib/timing";
import ReviewedBy from "@/components/ReviewedBy";
import RelatedContent from "@/components/RelatedContent";
import ShopCTA from "@/components/ShopCTA";
import { goalsForIngredient, biomarkersForIngredient, interactionsForIngredient } from "@/lib/related";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

function nameOf(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}
function doseOf(id: string): string | undefined {
  return SUPPLEMENT_DB.find(s => s.id === id)?.dose;
}

export function generateStaticParams() {
  return TIMING_IDS.map(id => ({ slug: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = timingFor(slug);
  if (!t) return { title: "Supplement timing, suppdoc.io" };
  const name = nameOf(slug);
  const title = `Best time to take ${name}, suppdoc.io`;
  const description = `${t.summary} ${t.detail}`.slice(0, 155);
  return {
    title,
    description,
    keywords: `best time to take ${name}, when to take ${name}, ${name} morning or night, ${name} with or without food, ${name} timing`,
    alternates: { canonical: `${BASE}/timing/${slug}` },
    openGraph: { title, description },
    // Same gate as the sitemap so the two can never disagree.
    robots: timingIndexable(t) ? undefined : { index: false, follow: true },
  };
}

export default async function TimingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = timingFor(slug);
  if (!t) notFound();

  const name = nameOf(slug);
  const dose = doseOf(slug);
  const m = WINDOW_META[t.window];

  const faq = [
    { q: `When is the best time to take ${name}?`, a: `${t.summary} ${t.howTo}` },
    { q: `Should I take ${name} with or without food?`, a: `${t.food}. ${t.detail}` },
    ...(t.avoid ? [{ q: `Anything to watch out for with ${name} timing?`, a: t.avoid }] : []),
  ];

  // A few other timing guides for internal linking (prefer the same time-of-day window).
  const moreTiming = TIMING_IDS
    .filter(id => id !== slug)
    .sort((a, b) => (TIMING[b].window === t.window ? 1 : 0) - (TIMING[a].window === t.window ? 1 : 0))
    .slice(0, 6)
    .map(id => ({ href: `/timing/${id}`, label: `When to take ${nameOf(id)}` }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: `Best time to take ${name}`,
        description: t.summary,
        url: `${BASE}/timing/${slug}`,
        lastReviewed: new Date().toISOString().slice(0, 10),
        author: authorSchema(),
        ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}),
        about: { "@type": "Substance", name },
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
          { "@type": "ListItem", position: 1, name: "Supplement timing", item: `${BASE}/timing` },
          { "@type": "ListItem", position: 2, name: `Best time to take ${name}`, item: `${BASE}/timing/${slug}` },
        ],
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main-content" style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <nav style={{ ...MM, fontSize: 11, color: TH.muted, marginBottom: 18 }}>
            <Link href="/timing" style={{ color: TH.sageDeep, textDecoration: "none" }}>Supplement timing</Link>
            <span style={{ color: TH.mutedDim }}> / {name}</span>
          </nav>

          {/* Answer-first: H1 + verdict (for AI extraction + featured snippets) */}
          <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            Best time to take <span style={SI}>{name}</span>
          </h1>

          <ReviewedBy />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 16px", borderRadius: 999,
            background: m.bg, border: `1px solid ${m.hue}33`, marginBottom: 18,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: m.hue }} />
            <span style={{ ...D, fontSize: 14, color: m.hue }}>{t.bestTime}</span>
          </div>

          <p style={{ fontSize: 19, color: TH.ink, lineHeight: 1.5, margin: "0 0 8px", fontWeight: 500 }}>{t.summary}</p>
          <p style={{ fontSize: 16, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 24px" }}>{t.detail}</p>

          {/* Quick-facts row: when · food · dose */}
          <div style={{ display: "grid", gridTemplateColumns: "var(--timing-facts-cols)", gap: 12, marginBottom: 24 }}>
            <Fact label="When" value={m.verdict} hue={m.hue} />
            <Fact label="With food?" value={t.food} hue={TH.sageDeep} />
            {dose && <Fact label="Typical dose" value={dose} hue={TH.amberDeep} />}
          </div>

          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>How to take it</div>
            <p style={{ fontSize: 15.5, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{t.howTo}</p>
          </div>

          {t.avoid && (
            <div style={{ background: "color-mix(in srgb, var(--c-destructive) 12%, transparent)", border: "1px solid #b91c1c22", borderRadius: 16, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ ...MM, fontSize: 10.5, color: "var(--c-destructive)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Watch out</div>
              <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{t.avoid}</p>
            </div>
          )}

          {/* Shop the recommended product (direct buy path) + full guide link */}
          <div style={{ marginBottom: 28 }}>
            <ShopCTA supplementId={slug} heading={`Shop ${name}`} />
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
            { title: `More timing guides`, items: moreTiming },
            { title: `${name} interactions`, items: interactionsForIngredient(slug).slice(0, 6) },
            { title: `Best supplements for…`, items: goalsForIngredient(slug) },
            { title: "Related biomarkers", items: biomarkersForIngredient(slug) },
          ]} />

          {/* CTA to the quiz */}
          <div style={{ background: TH.inkBg, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center", marginBottom: 22 }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Build a stack with the timing built in</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Answer a few questions and get a personalised stack, each pick with its dose, timing, and what to take it with.</p>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
            }}>Take the free quiz →</Link>
          </div>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center" }}>
            Educational use only, not medical advice. The right timing and dose depend on your health, your other supplements, and any medications. Always consult a qualified clinician, especially if you take prescription drugs or are pregnant or nursing.
          </p>
        </div>
      </main>
      <SiteFooter />
      <style>{`
        :root { --timing-facts-cols: repeat(3, 1fr); }
        @media (max-width: 560px) { :root { --timing-facts-cols: 1fr; } }
      `}</style>
    </div>
  );
}

function Fact({ label, value, hue }: { label: string; value: string; hue: string }) {
  return (
    <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ ...MM, fontSize: 9.5, color: TH.mutedDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color: hue, fontWeight: 600, lineHeight: 1.35 }}>{value}</div>
    </div>
  );
}
