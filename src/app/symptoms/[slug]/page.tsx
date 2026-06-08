import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { BIOMARKERS } from "@/lib/biomarkers";
import { SYMPTOMS, SYMPTOM_SLUGS, symptomFor, symptomIndexable, CATEGORY_META } from "@/lib/symptoms";
import ReviewedBy from "@/components/ReviewedBy";
import RelatedContent from "@/components/RelatedContent";
import ShopCTA from "@/components/ShopCTA";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

function ingName(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}
function bmLabel(key: string): string {
  return BIOMARKERS.find(b => b.key === key)?.label ?? key;
}
const bmHref = (key: string) => `/biomarkers/${key.replace(/_/g, "-")}`;

export function generateStaticParams() {
  return SYMPTOM_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = symptomFor(slug);
  if (!s) return { title: "Supplements for symptoms, suppdoc.io" };
  const title = `Supplements for ${s.label.toLowerCase()}, suppdoc.io`;
  const description = `${s.summary}`.slice(0, 155);
  return {
    title,
    description,
    keywords: `supplements for ${s.label.toLowerCase()}, ${s.label.toLowerCase()} deficiency, what deficiency causes ${s.label.toLowerCase()}, vitamins for ${s.label.toLowerCase()}, ${s.label.toLowerCase()} supplements`,
    alternates: { canonical: `${BASE}/symptoms/${slug}` },
    openGraph: { title, description },
    robots: symptomIndexable(s) ? undefined : { index: false, follow: true },
  };
}

export default async function SymptomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = symptomFor(slug);
  if (!s) notFound();

  const m = CATEGORY_META[s.category];
  const shopId = s.nutrients.find(id => SUPPLEMENT_DB.some(x => x.id === id));
  const related = SYMPTOM_SLUGS
    .filter(k => k !== slug && SYMPTOMS[k].category === s.category)
    .slice(0, 6)
    .map(k => ({ href: `/symptoms/${k}`, label: SYMPTOMS[k].label }));

  const faq = [
    { q: `What supplements help with ${s.label.toLowerCase()}?`, a: `${s.summary} The nutrients most often linked are ${s.nutrients.map(ingName).join(", ")}.` },
    { q: `Which deficiencies are associated with ${s.label.toLowerCase()}?`, a: s.detail },
    { q: `When should I see a doctor about ${s.label.toLowerCase()}?`, a: s.redFlags },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: `Supplements for ${s.label}`,
        description: s.summary,
        url: `${BASE}/symptoms/${slug}`,
        lastReviewed: new Date().toISOString().slice(0, 10),
        author: authorSchema(),
        ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}),
        about: { "@type": "MedicalSignOrSymptom", name: s.label },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Symptoms", item: `${BASE}/symptoms` },
          { "@type": "ListItem", position: 2, name: s.label, item: `${BASE}/symptoms/${slug}` },
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
            <Link href="/symptoms" style={{ color: TH.sageDeep, textDecoration: "none" }}>Symptoms</Link>
            <span style={{ color: TH.mutedDim }}> / {s.label}</span>
          </nav>

          {/* Answer-first H1 */}
          <h1 style={{ ...D, fontSize: "clamp(27px, 5vw, 40px)", lineHeight: 1.07, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            Supplements for <span style={SI}>{s.label.toLowerCase()}</span>
          </h1>

          <ReviewedBy />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 16px", borderRadius: 999,
            background: m.bg, border: `1px solid ${m.hue}33`, marginBottom: 18,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: m.hue }} />
            <span style={{ ...D, fontSize: 14, color: m.hue }}>{m.label}</span>
          </div>

          <p style={{ fontSize: 19, color: TH.ink, lineHeight: 1.5, margin: "0 0 8px", fontWeight: 500 }}>{s.summary}</p>
          <p style={{ fontSize: 16, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 26px" }}>{s.detail}</p>

          {/* Nutrients commonly linked */}
          <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Nutrients commonly linked</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))", gap: 10, marginBottom: 26 }}>
            {s.nutrients.map(id => (
              <Link key={id} href={`/ingredients/${id}`} style={{
                display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                padding: "14px 16px", textDecoration: "none", color: "inherit", borderLeft: `3px solid ${m.hue}`,
              }}>
                <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 2 }}>{ingName(id)}</div>
                <span style={{ fontSize: 12.5, color: TH.sageDeep, fontWeight: 600 }}>See the guide →</span>
              </Link>
            ))}
          </div>

          {/* Direct purchase path for the top related nutrient */}
          {shopId && (
            <div style={{ marginBottom: 26 }}>
              <ShopCTA supplementId={shopId} heading={`Shop the top pick for ${s.label.toLowerCase()}`} />
            </div>
          )}

          {/* Biomarkers to check */}
          {s.biomarkers.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Biomarkers worth checking</h2>
              <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 12px" }}>
                These are the blood tests most relevant here. Knowing your numbers tells you whether a supplement is the right answer.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {s.biomarkers.map(key => (
                  <Link key={key} href={bmHref(key)} style={{
                    padding: "8px 14px", background: TH.surface, border: `1px solid ${TH.edge}`,
                    borderRadius: 999, textDecoration: "none", color: TH.inkSoft, fontSize: 13.5, fontWeight: 600,
                  }}>{bmLabel(key)}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Red flags, when to see a doctor */}
          <div style={{ background: "#fef2f2", border: "1px solid #b91c1c22", borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ ...MM, fontSize: 10.5, color: "#b91c1c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>When to see a doctor</div>
            <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{s.redFlags}</p>
          </div>

          {s.lifestyle && (
            <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "16px 20px", marginBottom: 28 }}>
              <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Beyond supplements</div>
              <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{s.lifestyle}</p>
            </div>
          )}

          {/* FAQ */}
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

          {related.length > 0 && (
            <RelatedContent groups={[{ title: `More ${m.label.toLowerCase()} symptoms`, items: related }]} />
          )}

          {/* CTA, route to bloodwork (test) + quiz (personalise) */}
          <div style={{ background: TH.inkBg, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center", marginBottom: 22 }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Find out what's actually low</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Upload your bloodwork and we'll read the relevant markers, or take the quiz for a personalised stack.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/bloodwork" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999,
                background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
              }}>Analyse my bloodwork →</Link>
              <Link href="/quiz" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999,
                background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
              }}>Take the quiz</Link>
            </div>
          </div>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center" }}>
            Educational use only, not medical advice, diagnosis, or treatment. Symptoms have many possible causes, and the nutrients here are commonly associated with this symptom, not a guaranteed fix. Always consult a qualified clinician, especially if symptoms are severe, persistent, or new.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
