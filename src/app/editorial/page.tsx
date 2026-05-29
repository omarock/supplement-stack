import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "Editorial standards & how we evaluate evidence — suppdoc.io",
  description: "How suppdoc researches, grades evidence, cites sources, reviews content, discloses conflicts of interest, and uses AI responsibly. Our editorial standards for an evidence-led, honest supplement platform.",
  alternates: { canonical: `${BASE}/editorial` },
};

const TIERS = [
  { label: "Very strong", color: TH.sageDeep, desc: "Multiple high-quality randomised controlled trials and/or meta-analyses converge on a clear effect (e.g. creatine for strength, omega-3 for triglycerides)." },
  { label: "Strong", color: TH.sage, desc: "Consistent RCT evidence with some heterogeneity, or strong mechanistic plus observational support (e.g. magnesium for sleep, vitamin D for deficiency)." },
  { label: "Moderate", color: TH.amberDeep, desc: "Promising but mixed or early human data, small trials, or strong mechanism awaiting larger confirmation (e.g. several adaptogens, NAD⁺ precursors)." },
];

const PRINCIPLES = [
  { h: "We grade the evidence, openly", p: "Every ingredient carries a visible evidence tier — Very strong, Strong, or Moderate — based on the weight and quality of published human research, not marketing claims. When the evidence is thin, we say so." },
  { h: "We cite primary sources", p: "Claims link to the underlying research — meta-analyses, randomised controlled trials, and reputable bodies (PubMed, NIH, the Cochrane reviews, Examine). We prefer human data over mechanism or animal studies, and we note when only the latter exists." },
  { h: "We tell you what NOT to take", p: "An honest platform says when a supplement isn't worth it, when a cheaper option is just as good, and when the right answer is food, sleep, or a doctor — not a pill. We flag redundancy, interactions, and timing issues." },
  { h: "We don't sell our own supplements", p: "suppdoc has no house brand. We earn the same affiliate rate regardless of which product you choose, so a recommendation is never biased toward our own inventory. Affiliate links are disclosed." },
  { h: "We're educational, not medical", p: "Nothing here is medical advice, diagnosis, or treatment. We prompt you to involve a qualified clinician for anything that warrants it — pregnancy, medications, medical conditions, or abnormal lab results." },
  { h: "We use AI responsibly", p: "We use AI to help structure and personalise information at scale, but content is written to this methodology, grounded in cited research, and moving under named clinical review. AI accelerates the work; it does not replace the evidence or the reviewer." },
  { h: "We correct mistakes", p: "If we get something wrong, we fix it and date the update. Each evidence page shows when it was last reviewed. Spot an error? Tell us at hello@suppdoc.io." },
];

export default function EditorialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "Editorial standards & how we evaluate evidence",
        url: `${BASE}/editorial`,
        publisher: { "@id": `${BASE}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${BASE}/#org`,
        name: "suppdoc",
        url: BASE,
        publishingPrinciples: `${BASE}/editorial`,
        description: "Evidence-graded AI supplement platform. We don't sell our own supplements.",
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Editorial standards</div>
          <h1 style={{ ...D, fontSize: "clamp(32px, 5.5vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            How we evaluate the <span style={SI}>evidence</span>.
          </h1>
          <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 32px" }}>
            suppdoc exists because supplement information online is dominated by hype and affiliate spam. These are the standards that make us different — and that you can hold us to.
          </p>

          {/* Evidence tiers */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Our evidence grades</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TIERS.map(t => (
                <div key={t.label} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px", borderLeft: `4px solid ${t.color}` }}>
                  <div style={{ ...D, fontSize: 15.5, color: t.color, marginBottom: 4 }}>{t.label} evidence</div>
                  <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Principles */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Our principles</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {PRINCIPLES.map(pr => (
                <div key={pr.h}>
                  <h3 style={{ ...D, fontWeight: 600, fontSize: 17, color: TH.ink, margin: "0 0 5px" }}>{pr.h}</h3>
                  <p style={{ fontSize: 15, color: TH.inkSoft, lineHeight: 1.6, margin: 0 }}>{pr.p}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Review */}
          <section style={{ background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "24px 26px" }}>
            <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Clinical review</h2>
            <p style={{ fontSize: 15, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>
              We are building a board of licensed clinicians — a pharmacist, a registered dietitian, and a physician — to review our evidence content. Reviewers and their credentials are published on our{" "}
              <Link href="/team" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>team page</Link>, and reviewed pages carry their name and the date of review.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/methodology" style={{ ...MM, fontSize: 12.5, color: TH.sageDeep, textDecoration: "none", border: `1px solid ${TH.edge}`, padding: "8px 14px", borderRadius: 999 }}>Read the full methodology →</Link>
              <Link href="/team" style={{ ...MM, fontSize: 12.5, color: TH.sageDeep, textDecoration: "none", border: `1px solid ${TH.edge}`, padding: "8px 14px", borderRadius: 999 }}>Meet the team →</Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
