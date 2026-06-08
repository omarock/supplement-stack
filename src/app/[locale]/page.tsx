import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, localeHref, navHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";
import { TH, FONTS, D, SI, MM } from "@/lib/theme";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const d = getDict(loc);
  const t = (k: string) => lookup(d, k);
  return {
    title: `suppdoc.io, ${t("landing.h1a")} ${t("landing.h1b")}`,
    description: t("landing.sub"),
    alternates: {
      canonical: localeHref("/", loc),
      languages: { en: "/", fr: "/fr", de: "/de", es: "/es", "x-default": "/" },
    },
  };
}

const CARDS = [
  { n: "01", k: "card1", href: "/quiz", reco: true },
  { n: "02", k: "card2", href: "/build", reco: false },
  { n: "03", k: "card3", href: "/audit", reco: false },
];

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const d = getDict(loc);
  const t = (k: string) => lookup(d, k);

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main id="main-content" style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 40px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...MM, fontSize: 12, color: TH.sageDeep, background: TH.accentGlow, padding: "7px 16px", borderRadius: 999, marginBottom: 22 }}>
              {t("landing.eyebrow")}
            </span>
            <h1 style={{ ...D, fontWeight: 600, fontSize: "var(--hero-h1)", lineHeight: "var(--hero-h1-line)", letterSpacing: "-0.03em", margin: "0 0 18px" }}>
              {t("landing.h1a")} <span style={{ ...SI, color: TH.sageDeep }}>{t("landing.h1b")}</span>.
            </h1>
            <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, margin: 0 }}>{t("landing.sub")}</p>
          </div>

          {/* Three ways in */}
          <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: "var(--grid-3-gap)", marginBottom: 44 }}>
            {CARDS.map((c) => (
              <div key={c.n} style={{
                position: "relative", background: TH.surface, border: `1px solid ${c.reco ? TH.sage : TH.edge}`,
                borderRadius: 20, padding: "26px 24px", display: "flex", flexDirection: "column",
                boxShadow: c.reco ? `0 18px 44px -22px ${TH.sage}` : "none",
              }}>
                <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.08em", marginBottom: 12 }}>
                  {c.n}{c.reco ? " · ★" : ""}
                </div>
                <h2 style={{ ...D, fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 8px" }}>{t(`landing.${c.k}Title`)}</h2>
                <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 20px", flex: 1 }}>{t(`landing.${c.k}Desc`)}</p>
                <Link href={navHref(c.href, loc)} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 999, textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
                  background: c.reco ? `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})` : "transparent",
                  color: c.reco ? "#fff" : TH.ink, border: c.reco ? "none" : `1.5px solid ${TH.edgeStrong}`,
                }}>{t(`landing.${c.k}Cta`)} →</Link>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", marginBottom: 48, ...MM, fontSize: 12.5, color: TH.muted }}>
            <span>✓ {t("landing.trust1")}</span>
            <span>✓ {t("landing.trust2")}</span>
            <span>✓ {t("landing.trust3")}</span>
          </div>

          {/* Final CTA */}
          <section style={{ background: TH.inkBg, color: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,44px)", textAlign: "center" }}>
            <h2 style={{ ...D, fontWeight: 600, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.02em", margin: "0 0 12px", color: "#fff" }}>{t("landing.ctaTitle")}</h2>
            <p style={{ fontSize: 16, opacity: 0.85, margin: "0 0 22px", lineHeight: 1.55 }}>{t("landing.ctaSub")}</p>
            <Link href={navHref("/quiz", loc)} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 30px", borderRadius: 999,
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15.5,
            }}>{t("landing.ctaBtn")} →</Link>
          </section>

          <p style={{ textAlign: "center", fontSize: 12.5, color: TH.muted, marginTop: 26 }}>{t("landing.englishNote")}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
