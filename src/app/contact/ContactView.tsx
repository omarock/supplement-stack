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

export default function ContactView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);
  const cards = [
    { label: t("contact.card1Label"), value: "hello@suppdoc.io", href: "mailto:hello@suppdoc.io", desc: t("contact.card1Desc") },
    { label: t("contact.card2Label"), value: "partners@suppdoc.io", href: "mailto:partners@suppdoc.io", desc: t("contact.card2Desc") },
    { label: t("contact.card3Label"), value: "press@suppdoc.io", href: "mailto:press@suppdoc.io", desc: t("contact.card3Desc") },
  ];
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>{t("contact.eyebrow")}</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          {t("contact.h1pre")} <em style={{ color: th.burgundy }}>{t("contact.h1em")}</em>{t("contact.h1post")}
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "20px auto 0" }}>
          {t("contact.sub")}
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 18 }}>
          {cards.map(c => (
            <a key={c.label} href={c.href} style={{
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
              padding: 28, textDecoration: "none", display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em" }}>
                {c.label.toUpperCase()}
              </div>
              <div style={{ ...S, fontSize: 22, color: th.ink, letterSpacing: "-0.01em" }}>{c.value}</div>
              <div style={{ fontSize: 14, color: th.inkSoft, lineHeight: 1.5 }}>{c.desc}</div>
            </a>
          ))}
        </div>

        <div style={{
          maxWidth: 760, margin: "60px auto 0",
          background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
          padding: 32, textAlign: "center",
        }}>
          <h2 style={{ ...S, fontSize: 28, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {t("contact.helpTitle")}
          </h2>
          <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
            {t("contact.helpSub")}
          </p>
          <Link href={navHref("/help", locale)} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
            background: th.burgundy, color: "#fff", textDecoration: "none",
          }}>
            {t("contact.helpBtn")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
