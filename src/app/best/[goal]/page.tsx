import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EvidenceBadge, { type EvidenceTier } from "@/components/EvidenceBadge";
import { GOALS, goalBySlug, ingredientsForGoal } from "@/lib/goals";
import { STACKS } from "@/lib/stacks";
import ReviewedBy from "@/components/ReviewedBy";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export function generateStaticParams() {
  return GOALS.map(g => ({ goal: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ goal: string }> }): Promise<Metadata> {
  const { goal } = await params;
  const g = goalBySlug(goal);
  if (!g) return { title: "Best supplements, suppdoc.io" };
  const title = `${g.h1} (2026, evidence-graded), suppdoc.io`;
  const description = `${g.intro}`.slice(0, 155);
  return {
    title, description,
    keywords: `best supplements for ${g.label}, supplements for ${g.label}, ${g.label} supplements`,
    alternates: { canonical: `${BASE}/best/${g.slug}` },
    openGraph: { title: g.h1, description },
  };
}

export default async function BestForGoalPage({ params }: { params: Promise<{ goal: string }> }) {
  const { goal } = await params;
  const g = goalBySlug(goal);
  if (!g) notFound();

  const items = ingredientsForGoal(g, 10);
  const stack = g.stackSlug ? STACKS.find(s => s.slug === g.stackSlug) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "MedicalWebPage", name: g.h1, description: g.intro, url: `${BASE}/best/${g.slug}`, lastReviewed: new Date().toISOString().slice(0, 10), author: authorSchema(), ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}) },
      {
        "@type": "ItemList", name: g.h1,
        itemListElement: items.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: `${BASE}/ingredients/${s.id}` })),
      },
      { "@type": "FAQPage", mainEntity: g.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Best supplements", item: `${BASE}/best` },
        { "@type": "ListItem", position: 2, name: g.h1, item: `${BASE}/best/${g.slug}` },
      ] },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <nav style={{ ...MM, fontSize: 11, color: TH.muted, marginBottom: 18 }}>
            <Link href="/best" style={{ color: TH.sageDeep, textDecoration: "none" }}>Best supplements</Link>
            <span style={{ color: TH.mutedDim }}> / {g.label}</span>
          </nav>

          <h1 style={{ ...D, fontSize: "clamp(30px, 5.5vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            Best supplements for <span style={SI}>{g.label}</span>.
          </h1>
          <p style={{ fontSize: 17, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 14px", maxWidth: 620 }}>{g.intro}</p>
          <ReviewedBy />
          <div style={{ ...MM, fontSize: 11, color: TH.muted, margin: "10px 0 26px" }}>Each pick is evidence-graded · we don&apos;t sell supplements</div>

          {/* Ranked list */}
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((s, i) => (
              <li key={s.id}>
                <Link href={`/ingredients/${s.id}`} style={{
                  display: "flex", gap: 14, alignItems: "flex-start", background: TH.surface,
                  border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "16px 18px", textDecoration: "none", color: "inherit",
                }}>
                  <span style={{ ...D, fontSize: 22, color: TH.mutedDim, lineHeight: 1, minWidth: 26 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ ...D, fontSize: 16.5, color: TH.ink }}>{s.name.split(" (")[0]}</span>
                      <EvidenceBadge tier={s.evidence as EvidenceTier} size="sm" />
                    </span>
                    <span style={{ display: "block", fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.5, marginTop: 6 }}>{s.why}</span>
                    <span style={{ display: "block", ...MM, fontSize: 11, color: TH.muted, marginTop: 6 }}>
                      {s.dose} · {s.timing} · ~${s.monthlyCost}/mo
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
            {stack && (
              <Link href={`/stacks/${stack.slug}`} style={ctaPrimary()}>See the full {g.label} stack →</Link>
            )}
            <Link href="/quiz" style={ctaSecondary()}>Get a personalised stack →</Link>
            <Link href="/audit" style={ctaSecondary()}>Check your current stack →</Link>
          </div>

          {/* FAQ */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Common questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {g.faq.map((f, i) => (
                <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TH.ink, marginBottom: 6 }}>{f.q}</div>
                  <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </section>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center", marginTop: 30 }}>
            Educational use only, not medical advice. Always consult a qualified clinician before starting supplements, especially if you take medication or are pregnant or nursing.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ctaPrimary(): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: TH.ink, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14 };
}
function ctaSecondary(): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: "transparent", color: TH.ink, textDecoration: "none", border: `1px solid ${TH.edge}`, fontSize: 14, fontWeight: 500 };
}
