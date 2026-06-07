import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AuditClient from "./AuditClient";
import { TH } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Supplement Audit & Interaction Checker (free), suppdoc.io",
  description: "Paste your supplements and our free audit flags interactions, redundancies, missing nutrients, and timing issues in seconds, then suggests a cleaner, evidence-led stack. No signup.",
  keywords: "supplement audit, supplement interaction checker, supplement stack analyzer, supplement stack review, supplement optimization, redundant supplements, check supplement interactions",
  alternates: { canonical: "https://www.suppdoc.io/audit" },
  openGraph: {
    title: "Free Supplement Audit & Interaction Checker, suppdoc.io",
    description: "Paste your supplements. We flag redundancies, missing nutrients, interactions, and timing issues, free, instant, evidence-led.",
  },
};

const AUDIT_FAQ = [
  { q: "Is the supplement audit free?", a: "Yes, paste your current supplements and get an instant, evidence-led audit with no signup. It flags interactions, redundancies, gaps, and timing issues, then suggests a cleaner stack." },
  { q: "What does the supplement interaction checker find?", a: "It detects pairs that compete for absorption (like iron and calcium), redundant duplicates (like two omega-3 sources or CoQ10 with ubiquinol), blood-thinning combinations to use with caution, and timing improvements, each explained with the evidence." },
  { q: "Is this medical advice?", a: "No. suppdoc is educational and evidence-led, not medical advice. Always consult a qualified clinician before changing your supplements, especially if you take prescription medication or are pregnant or nursing." },
];

export default function AuditPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AUDIT_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <AuditClient />
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--section-pad-x) 72px" }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Supplement audit, FAQ
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AUDIT_FAQ.map((f, i) => (
            <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: TH.ink, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{f.a}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            ["Interaction checker", "/interactions"],
            ["Best time to take each supplement", "/timing"],
            ["All 200+ ingredients", "/ingredients"],
            ["What your bloodwork means", "/biomarkers"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{
              padding: "9px 16px", background: TH.surface, border: `1px solid ${TH.edge}`,
              borderRadius: 999, textDecoration: "none", color: TH.inkSoft, fontSize: 13.5, fontWeight: 500,
            }}>{label}</Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
