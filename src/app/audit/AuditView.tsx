import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AuditClient from "./AuditClient";
import NamespaceProvider from "@/components/NamespaceProvider";
import { getDict } from "@/lib/i18n-dicts";
import { lookup, type Locale } from "@/lib/i18n";
import { TH } from "@/lib/theme";

// Shared audit page: the tool (AuditClient) + the FAQ/JSON-LD + related-guide
// links. The audit findings + suggested ingredients come from the API and stay
// English (YMYL / shared data); the deep guide links point at the English pages.
export default function AuditView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);
  const AUDIT_FAQ = [1, 2, 3].map((i) => ({ q: t(`audit.faq${i}q`), a: t(`audit.faq${i}a`) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AUDIT_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const guides: [string, string][] = [
    [t("audit.guide1"), "/interactions"],
    [t("audit.guide2"), "/timing"],
    [t("audit.guide3"), "/ingredients"],
    [t("audit.guide4"), "/biomarkers"],
  ];
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <NamespaceProvider locale={locale} keep="audit">
        <AuditClient />
      </NamespaceProvider>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--section-pad-x) 72px" }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          {t("audit.faqTitle")}
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
          {guides.map(([label, href]) => (
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
