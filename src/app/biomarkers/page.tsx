import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BIOMARKERS } from "@/lib/biomarkers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const CAT_LABEL: Record<string, string> = {
  vitamins: "Vitamins", minerals: "Minerals", metabolic: "Metabolic", lipids: "Lipids",
  thyroid: "Thyroid", inflammation: "Inflammation", hormones: "Hormones", blood: "Blood / iron",
};

export const metadata: Metadata = {
  title: "Biomarker Guide, what your blood test means | suppdoc.io",
  description: "Plain-English guides to common blood biomarkers, vitamin D, ferritin, B12, HbA1c, cholesterol, TSH and more. See optimal ranges and the evidence-led supplements that help.",
  keywords: "blood test biomarkers, what does my blood test mean, biomarker optimal range, supplements for low ferritin, low vitamin d supplements, hba1c explained",
  alternates: { canonical: "https://www.suppdoc.io/biomarkers" },
};

export default function BiomarkersIndex() {
  const cats = [...new Set(BIOMARKERS.map(b => b.category))];
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Biomarker guide</div>
            <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 50px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              What your <span style={SI}>blood test</span> means.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, maxWidth: 580, margin: "0 auto 22px", lineHeight: 1.55 }}>
              Plain-English guides to common biomarkers, optimal ranges and the evidence-led supplements that help. Or upload your labs for a personalised read.
            </p>
            <Link href="/bloodwork" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15,
              boxShadow: `0 10px 24px -8px ${TH.sage}80`,
            }}>Analyze my bloodwork →</Link>
          </header>

          {cats.map(cat => (
            <section key={cat} style={{ marginBottom: 26 }}>
              <h2 style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>{CAT_LABEL[cat] ?? cat}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: 10 }}>
                {BIOMARKERS.filter(b => b.category === cat).map(b => (
                  <Link key={b.key} href={`/biomarkers/${b.key.replace(/_/g, "-")}`} style={{
                    display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14,
                    padding: "14px 16px", textDecoration: "none", color: "inherit",
                  }}>
                    <div style={{ ...D, fontSize: 15.5, color: TH.ink, marginBottom: 3 }}>{b.label}</div>
                    <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.45 }}>{b.blurb.split(".")[0]}.</div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
