import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getDict } from "@/lib/i18n-dicts";
import { lookup, navHref, type Locale } from "@/lib/i18n";

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

export default function AboutView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>{t("about.eyebrow")}</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          {t("about.h1pre")} <em style={{ color: th.burgundy }}>{t("about.h1em")}</em>{t("about.h1post")}
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 18, lineHeight: 1.6, maxWidth: 640, margin: "24px auto 0" }}>
          {t("about.intro")}
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              {t("about.h2philosophy")}
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              {t("about.pPhilosophy")}
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              {t("about.h2noSell")}
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              {t("about.pNoSell")}
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              {t("about.h2vet")}
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              {t("about.pVetIntro")}
            </p>
            <ul style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.8, paddingLeft: 0, listStyle: "none", marginTop: 12 }}>
              <li>· {t("about.vet1")}</li>
              <li>· {t("about.vet2")}</li>
              <li>· {t("about.vet3")}</li>
              <li>· {t("about.vet4")}</li>
            </ul>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
              {t("about.pVetOutro")}
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              {t("about.h2not")}
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              {t("about.pNot")}
            </p>
          </div>

          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
            padding: 36, textAlign: "center",
          }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {t("about.ctaTitle")}
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
              {t("about.ctaSub")}
            </p>
            <Link href={navHref("/quiz", locale)} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 500,
              background: th.burgundy, color: "#ffffff", textDecoration: "none",
            }}>
              {t("about.ctaBtn")}
            </Link>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
