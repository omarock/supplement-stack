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
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export default function HelpView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);
  const FAQ: { section: string; items: [string, string][] }[] = [
    { section: t("help.sec1"), items: [[t("help.s1q1"), t("help.s1a1")], [t("help.s1q2"), t("help.s1a2")], [t("help.s1q3"), t("help.s1a3")]] },
    { section: t("help.sec2"), items: [[t("help.s2q1"), t("help.s2a1")], [t("help.s2q2"), t("help.s2a2")], [t("help.s2q3"), t("help.s2a3")]] },
    { section: t("help.sec3"), items: [[t("help.s3q1"), t("help.s3a1")], [t("help.s3q2"), t("help.s3a2")], [t("help.s3q3"), t("help.s3a3")]] },
    { section: t("help.sec4"), items: [[t("help.s4q1"), t("help.s4a1")], [t("help.s4q2"), t("help.s4a2")], [t("help.s4q3"), t("help.s4a3")]] },
  ];
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>{t("help.eyebrow")}</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          {t("help.h1pre")} <em style={{ color: th.burgundy }}>{t("help.h1em")}</em>{t("help.h1post")}
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "20px auto 0" }}>
          {t("help.sub")}
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
          {FAQ.map(group => (
            <div key={group.section}>
              <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", color: th.ink }}>
                {group.section}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {group.items.map(([q, a]) => (
                  <details key={q} style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
                    padding: "16px 20px",
                  }}>
                    <summary style={{
                      ...S, fontSize: 20, color: th.ink, letterSpacing: "-0.01em", cursor: "pointer",
                      listStyle: "none",
                    }}>
                      {q}
                    </summary>
                    <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.65, margin: "12px 0 0" }}>
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
            padding: 28, textAlign: "center", marginTop: 24,
          }}>
            <h3 style={{ ...S, fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {t("help.ctaTitle")}
            </h3>
            <p style={{ color: th.inkSoft, fontSize: 15, margin: "0 0 18px" }}>
              {t("help.ctaSub")}
            </p>
            <Link href={navHref("/contact", locale)} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              background: th.burgundy, color: "#fff", textDecoration: "none",
            }}>
              {t("help.ctaBtn")}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
