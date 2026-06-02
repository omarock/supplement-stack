import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EvidenceBadge, { type EvidenceTier } from "@/components/EvidenceBadge";
import { BIOMARKERS, BIOMARKER_DETAIL, type BiomarkerDef } from "@/lib/biomarkers";
import { BIOMARKER_DIRECTION } from "@/lib/biomarker-directions";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import ReviewedBy from "@/components/ReviewedBy";
import RelatedContent from "@/components/RelatedContent";
import { goalsForBiomarker, stacksForBiomarker, otherBiomarkers } from "@/lib/related";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

function supp(id: string) {
  return SUPPLEMENT_DB.find(s => s.id === id);
}

export function generateStaticParams() {
  return BIOMARKERS.map(b => ({ marker: b.key.replace(/_/g, "-") }));
}

function findByParam(marker: string): BiomarkerDef | undefined {
  const key = marker.replace(/-/g, "_");
  return BIOMARKERS.find(b => b.key === key);
}

export async function generateMetadata({ params }: { params: Promise<{ marker: string }> }): Promise<Metadata> {
  const { marker } = await params;
  const b = findByParam(marker);
  if (!b) return { title: "Biomarker, suppdoc.io" };
  const title = `${b.label}: what it means & how to optimize, suppdoc.io`;
  const description = `${b.blurb} See the optimal range and the evidence-led supplements that help.`.slice(0, 155);
  return {
    title, description,
    keywords: `${b.label}, ${b.label} low, ${b.label} optimal range, supplements for ${b.label}, ${b.aliases.join(", ")}`,
    alternates: { canonical: `${BASE}/biomarkers/${marker}` },
    openGraph: { title, description },
  };
}

function rangeBands(b: BiomarkerDef): { label: string; range: string; hue: string }[] {
  const u = b.unit;
  const bands: { label: string; range: string; hue: string }[] = [];
  if (b.lowerIsBetter) {
    const okMax = b.optimalMax ?? b.borderlineHigh;
    if (okMax !== undefined) bands.push({ label: "Optimal", range: `under ${okMax} ${u}`, hue: "#3f7a52" });
    if (b.borderlineHigh !== undefined && b.high !== undefined) bands.push({ label: "Borderline", range: `${b.borderlineHigh}-${b.high} ${u}`, hue: "#b5751e" });
    if (b.high !== undefined) bands.push({ label: "High", range: `over ${b.high} ${u}`, hue: "#b91c1c" });
  } else {
    if (b.low !== undefined) bands.push({ label: "Low", range: `under ${b.low} ${u}`, hue: "#b91c1c" });
    if (b.borderlineLow !== undefined) bands.push({ label: "Borderline low", range: `${b.low ?? "?"}-${b.borderlineLow} ${u}`, hue: "#b5751e" });
    if (b.optimalMin !== undefined && b.optimalMax !== undefined) bands.push({ label: "Optimal", range: `${b.optimalMin}-${b.optimalMax} ${u}`, hue: "#3f7a52" });
    if (b.high !== undefined) bands.push({ label: "High", range: `over ${b.high} ${u}`, hue: "#b91c1c" });
  }
  return bands;
}

export default async function BiomarkerPage({ params }: { params: Promise<{ marker: string }> }) {
  const { marker } = await params;
  const b = findByParam(marker);
  if (!b) notFound();

  const bands = rangeBands(b);
  const detail = BIOMARKER_DETAIL[b.key];
  const lowSupps = (b.supplementsForLow ?? []).map(supp).filter(Boolean);
  const highSupps = (b.supplementsForHigh ?? []).map(supp).filter(Boolean);
  const actionSupps = b.lowerIsBetter ? highSupps : lowSupps;
  const actionVerb = b.lowerIsBetter ? "lower" : "raise";
  const outOfRange = b.lowerIsBetter ? "high" : "low";

  const faq = [
    { q: `What does a ${outOfRange} ${b.label} mean?`, a: `${detail?.causes?.length ? `Common drivers include ${detail.causes.slice(0, 3).map(c => c.charAt(0).toLowerCase() + c.slice(1)).join("; ")}. ` : ""}A result outside the optimal range is best read in context: discuss it with your clinician, who can weigh the full picture and your lab's own reference range.` },
    actionSupps.length
      ? { q: `What supplements help ${actionVerb} ${b.label}?`, a: `Evidence-led options include ${actionSupps.map(s => s!.name.split(" (")[0]).join(", ")}. They support, but don't replace, diet, lifestyle, and medical care.` }
      : { q: `How is ${b.label} best supported?`, a: `Through diet, lifestyle, and addressing the underlying cause with your clinician. Upload your labs to suppdoc for a tailored read.` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "MedicalWebPage", name: `${b.label}: what it means & how to optimize`, description: b.blurb, url: `${BASE}/biomarkers/${marker}`, lastReviewed: new Date().toISOString().slice(0, 10), author: authorSchema(), ...(reviewedBySchema() ? { reviewedBy: reviewedBySchema() } : {}), about: { "@type": "MedicalSignOrSymptom", name: b.label } },
      { "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Biomarkers", item: `${BASE}/biomarkers` },
        { "@type": "ListItem", position: 2, name: b.label, item: `${BASE}/biomarkers/${marker}` },
      ] },
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
            <span style={{ color: TH.muted }}> / {b.label}</span>
          </nav>

          <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            {b.label}: what it <span style={SI}>means</span>.
          </h1>
          <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>{b.blurb}</p>
          <ReviewedBy />
          <div style={{ height: 10 }} />

          {/* Range bands */}
          <section style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px", marginBottom: 24 }}>
            <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Typical reference bands ({b.unit})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bands.map((band, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: band.hue, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: TH.ink, minWidth: 120 }}>{band.label}</span>
                  <span style={{ ...MM, fontSize: 13, color: TH.muted }}>{band.range}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: TH.muted, marginTop: 12, lineHeight: 1.5 }}>
              Ranges vary by laboratory, age, and sex, your lab&apos;s own reference range always takes precedence.
            </div>
          </section>

          {/* High/low split deep-dives */}
          {(BIOMARKER_DIRECTION[b.key]?.low || BIOMARKER_DIRECTION[b.key]?.high) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {BIOMARKER_DIRECTION[b.key]?.low && (
                <Link href={`/biomarkers/${marker}/low`} style={{ flex: "1 1 220px", padding: "13px 16px", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, textDecoration: "none", color: "inherit" }}>
                  <span style={{ ...D, fontSize: 14.5, color: TH.ink }}>What does low {b.label.toLowerCase()} mean?</span>
                  <span style={{ display: "block", fontSize: 12.5, color: TH.sageDeep, fontWeight: 600, marginTop: 2 }}>Causes, symptoms &amp; what to do →</span>
                </Link>
              )}
              {BIOMARKER_DIRECTION[b.key]?.high && (
                <Link href={`/biomarkers/${marker}/high`} style={{ flex: "1 1 220px", padding: "13px 16px", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, textDecoration: "none", color: "inherit" }}>
                  <span style={{ ...D, fontSize: 14.5, color: TH.ink }}>What does high {b.label.toLowerCase()} mean?</span>
                  <span style={{ display: "block", fontSize: 12.5, color: TH.sageDeep, fontWeight: 600, marginTop: 2 }}>Causes, symptoms &amp; what to do →</span>
                </Link>
              )}
            </div>
          )}

          {/* In-depth, curated per-marker context */}
          {detail && (
            <section style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              {detail.causes.length > 0 && (
                <div>
                  <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Common causes</h2>
                  <ul style={{ margin: 0, paddingLeft: 20, color: TH.inkSoft, fontSize: 15, lineHeight: 1.6 }}>
                    {detail.causes.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
                  </ul>
                </div>
              )}
              {detail.symptoms.length > 0 && (
                <div>
                  <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 10px", letterSpacing: "-0.02em" }}>What it can feel like</h2>
                  <ul style={{ margin: 0, paddingLeft: 20, color: TH.inkSoft, fontSize: 15, lineHeight: 1.6 }}>
                    {detail.symptoms.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                  </ul>
                </div>
              )}
              {detail.whoShouldTest && (
                <div>
                  <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Who should test</h2>
                  <p style={{ margin: 0, color: TH.inkSoft, fontSize: 15, lineHeight: 1.6 }}>{detail.whoShouldTest}</p>
                </div>
              )}
            </section>
          )}

          {/* Supplements that help */}
          {actionSupps.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Supplements that help {actionVerb} {b.label}
              </h2>
              <p style={{ fontSize: 13, color: TH.muted, margin: "0 0 14px" }}>Evidence-led, and only a piece of the picture, diet, lifestyle, and your clinician matter most.</p>
              {detail?.mechanism && <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>{detail.mechanism}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {actionSupps.map(s => (
                  <Link key={s!.id} href={`/ingredients/${s!.id}`} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px",
                    textDecoration: "none", color: "inherit",
                  }}>
                    <span>
                      <span style={{ display: "block", ...D, fontSize: 15.5, color: TH.ink }}>{s!.name.split(" (")[0]}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: TH.muted, marginTop: 2 }}>{s!.purpose}</span>
                    </span>
                    <EvidenceBadge tier={s!.evidence as EvidenceTier} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA to bloodwork */}
          <div style={{ background: TH.ink, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center", marginBottom: 22 }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>See your own {b.label}</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Upload your blood test, we read {b.label.toLowerCase()} and your other markers, then match evidence-led supplements.</p>
            <Link href="/bloodwork" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
            }}>Analyze my bloodwork →</Link>
          </div>

          <RelatedContent groups={[
            { title: "Best for your goal", items: goalsForBiomarker(b) },
            { title: "Research-backed stacks", items: stacksForBiomarker(b) },
            { title: "Related biomarkers", items: otherBiomarkers(b) },
          ]} />

          {/* FAQ */}
          <section style={{ marginBottom: 22 }}>
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

          <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center" }}>
            Educational use only, not medical advice or diagnosis. Always interpret lab results with a qualified clinician.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
