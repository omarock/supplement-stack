import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { REVIEWERS, hasReviewers } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "Our team & clinical reviewers, suppdoc.io",
  description: "The people and clinical reviewers behind suppdoc's evidence-graded supplement guidance, and how our editorial review process works.",
  alternates: { canonical: `${BASE}/team` },
};

export default function TeamPage() {
  const jsonLd = hasReviewers ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#org`,
    name: "suppdoc",
    url: BASE,
    member: REVIEWERS.map(r => ({ "@type": "Person", name: `${r.name}, ${r.credential}`, url: `${BASE}/team/${r.slug}`, ...(r.title ? { jobTitle: r.title } : {}) })),
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <h1 style={{ ...D, fontSize: "clamp(32px, 5.5vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            The people behind the <span style={SI}>evidence</span>.
          </h1>
          <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 32px" }}>
            suppdoc is built by a small team obsessed with cutting through supplement hype. Our evidence content is written to a public{" "}
            <Link href="/editorial" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>editorial standard</Link> and is being moved under named clinical review.
          </p>

          {hasReviewers ? (
            <section>
              <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Clinical reviewers</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
                {REVIEWERS.map(r => (
                  <Link key={r.slug} href={`/team/${r.slug}`} style={{ display: "block", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "20px 22px", textDecoration: "none", color: "inherit" }}>
                    <div style={{ ...D, fontSize: 17, color: TH.ink }}>{r.name}</div>
                    <div style={{ ...MM, fontSize: 12, color: TH.sageDeep, marginTop: 3 }}>{r.credential}{r.title ? ` · ${r.title}` : ""}</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <section style={{ background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "26px 28px" }}>
              <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Building our clinical board</h2>
              <p style={{ fontSize: 15, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>
                We&apos;re recruiting licensed clinicians, a pharmacist (PharmD), a registered dietitian (RD), and a physician (MD), to review our evidence content. As reviewers join, their names, credentials, and the pages they&apos;ve reviewed appear here and on each page byline.
              </p>
              <p style={{ fontSize: 14, color: TH.muted, lineHeight: 1.6, margin: 0 }}>
                Are you a clinician who shares our evidence-first, no-house-brand approach? We&apos;d love to talk:{" "}
                <a href="mailto:hello@suppdoc.io" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>hello@suppdoc.io</a>.
              </p>
            </section>
          )}

          <p style={{ fontSize: 13, color: TH.muted, marginTop: 26 }}>
            See how we grade evidence and disclose conflicts of interest in our{" "}
            <Link href="/editorial" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>editorial standards</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
