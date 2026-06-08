import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { BIOMARKERS } from "@/lib/biomarkers";
import { directionParams, directionFor } from "@/lib/biomarker-directions";
import ReviewedBy from "@/components/ReviewedBy";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

const keyOf = (marker: string) => marker.replace(/-/g, "_");
function ingName(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}
function bmLabel(key: string): string {
  return BIOMARKERS.find(b => b.key === key)?.label ?? key;
}

export function generateStaticParams() {
  return directionParams().map(p => ({ marker: p.marker.replace(/_/g, "-"), direction: p.direction }));
}

export async function generateMetadata({ params }: { params: Promise<{ marker: string; direction: string }> }): Promise<Metadata> {
  const { marker, direction } = await params;
  const info = directionFor(keyOf(marker), direction);
  if (!info) return { title: "Biomarker, suppdoc.io" };
  const title = `${info.title}: causes, symptoms & what to do | suppdoc.io`;
  const description = info.summary.slice(0, 155);
  const label = bmLabel(keyOf(marker)).toLowerCase();
  return {
    title,
    description,
    keywords: `${direction} ${label}, ${direction} ${label} causes, ${direction} ${label} symptoms, what does ${direction} ${label} mean, how to ${direction === "low" ? "raise" : "lower"} ${label}`,
    alternates: { canonical: `${BASE}/biomarkers/${marker}/${direction}` },
    openGraph: { title, description },
  };
}

export default async function DirectionPage({ params }: { params: Promise<{ marker: string; direction: string }> }) {
  const { marker, direction } = await params;
  const key = keyOf(marker);
  const info = directionFor(key, direction);
  if (!info) notFound();

  const label = bmLabel(key);
  const verb = direction === "low" ? "raise" : "lower";
  const hue = "#b91c1c";

  const faq = [
    { q: `What does ${info.title.toLowerCase()} mean?`, a: `${info.summary} ${info.detail}` },
    { q: `What causes ${direction} ${label.toLowerCase()}?`, a: info.causes.join("; ") + "." },
    ...(info.nutrients.length ? [{ q: `How do I ${verb} my ${label.toLowerCase()}?`, a: `${info.action}` }] : []),
    { q: `When should I see a doctor?`, a: info.seeDoctor },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: info.title,
        description: info.summary,
        url: `${BASE}/biomarkers/${marker}/${direction}`,
        lastReviewed: new Date().toISOString().slice(0, 10),
        author: authorSchema(),
        ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}),
        about: { "@type": "MedicalSignOrSymptom", name: info.title },
      },
      { "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Biomarkers", item: `${BASE}/biomarkers` },
          { "@type": "ListItem", position: 2, name: label, item: `${BASE}/biomarkers/${marker}` },
          { "@type": "ListItem", position: 3, name: direction === "low" ? "Low" : "High", item: `${BASE}/biomarkers/${marker}/${direction}` },
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
            <Link href="/biomarkers" style={{ color: TH.sageDeep, textDecoration: "none" }}>Biomarkers</Link>
            <span style={{ color: TH.mutedDim }}> / </span>
            <Link href={`/biomarkers/${marker}`} style={{ color: TH.sageDeep, textDecoration: "none" }}>{label}</Link>
            <span style={{ color: TH.mutedDim }}> / {direction === "low" ? "Low" : "High"}</span>
          </nav>

          <h1 style={{ ...D, fontSize: "clamp(26px, 5vw, 40px)", lineHeight: 1.07, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            {direction === "low" ? "Low" : "High"} <span style={SI}>{label.toLowerCase()}</span>
          </h1>

          <ReviewedBy />

          {info.medical && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 16px", borderRadius: 999, background: "#fef2f2", border: "1px solid #b91c1c33", marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: hue }} />
              <span style={{ ...D, fontSize: 14, color: hue }}>A medical finding, review with a doctor</span>
            </div>
          )}

          <p style={{ fontSize: 19, color: TH.ink, lineHeight: 1.5, margin: "0 0 8px", fontWeight: 500 }}>{info.summary}</p>
          <p style={{ fontSize: 16, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 26px" }}>{info.detail}</p>

          {/* Causes + symptoms */}
          <div style={{ display: "grid", gridTemplateColumns: "var(--bm-cols)", gap: 14, marginBottom: 26 }}>
            <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px" }}>
              <h2 style={{ ...D, fontSize: 17, color: TH.ink, margin: "0 0 10px" }}>Common causes</h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.6 }}>
                {info.causes.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
              </ul>
            </div>
            <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px" }}>
              <h2 style={{ ...D, fontSize: 17, color: TH.ink, margin: "0 0 10px" }}>Associated symptoms</h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.6 }}>
                {info.symptoms.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
              </ul>
            </div>
          </div>

          {/* Nutrients (only when they genuinely help this direction) */}
          {info.nutrients.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Nutrients that can help</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))", gap: 10 }}>
                {info.nutrients.map(id => (
                  <Link key={id} href={`/ingredients/${id}`} style={{ display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px", textDecoration: "none", color: "inherit", borderLeft: `3px solid ${TH.sage}` }}>
                    <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 2 }}>{ingName(id)}</div>
                    <span style={{ fontSize: 12.5, color: TH.sageDeep, fontWeight: 600 }}>See the guide →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* What to do */}
          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>What to do</div>
            <p style={{ fontSize: 15.5, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{info.action}</p>
          </div>

          {/* See a doctor */}
          <div style={{ background: "#fef2f2", border: "1px solid #b91c1c22", borderRadius: 16, padding: "16px 20px", marginBottom: 28 }}>
            <div style={{ ...MM, fontSize: 10.5, color: hue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>When to see a doctor</div>
            <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.55, margin: 0 }}>{info.seeDoctor}</p>
          </div>

          {/* Back to the full explainer */}
          <Link href={`/biomarkers/${marker}`} style={{ display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px", textDecoration: "none", color: "inherit", marginBottom: 28 }}>
            <div style={{ ...MM, fontSize: 10, color: TH.mutedDim, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Full marker</div>
            <div style={{ ...D, fontSize: 16, color: TH.ink }}>{label}: ranges, what it measures &amp; both directions</div>
            <span style={{ fontSize: 12.5, color: TH.sageDeep, fontWeight: 600 }}>Read the {label} guide →</span>
          </Link>

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

          {/* CTA */}
          <div style={{ background: TH.inkBg, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center", marginBottom: 22 }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Have your full results?</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Upload your bloodwork and we'll read every marker, flag what's off, and match evidence-led, targeted support.</p>
            <Link href="/bloodwork" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999, background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5 }}>Analyse my bloodwork →</Link>
          </div>

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center" }}>
            Educational use only, not medical advice or diagnosis. Reference ranges vary by lab, age, sex, and medication, and a single result is read in context. Always review your results with a qualified clinician.
          </p>
        </div>
      </main>
      <SiteFooter />
      <style>{`:root{--bm-cols:1fr 1fr}@media(max-width:620px){:root{--bm-cols:1fr}}`}</style>
    </div>
  );
}
