import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { richText } from "@/components/RichText";
import { getDict } from "@/lib/i18n-dicts";
import { lookup, navHref, type Locale } from "@/lib/i18n";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

// Shared Express-vs-Complete chooser. The deep question engine (/quiz/express,
// /quiz/complete) and its ingredient recommendations stay English (YMYL — not
// machine-translated), so the deep links below are intentionally not localized.
export default function QuizChooserView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);

  const QUIZ_FAQ = [1, 2, 3, 4].map((i) => ({ q: t(`quiz.faq${i}q`), a: t(`quiz.faq${i}a`) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUIZ_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main-content" style={{ padding: "var(--section-pad-y) var(--section-pad-x) 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Hero */}
          <header style={{ textAlign: "center", marginBottom: 36, animation: "sd-fade-in .5s ease-out" }}>
            <div style={{
              ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em",
              marginBottom: 14, textTransform: "uppercase",
            }}>{t("quiz.eyebrow")}</div>
            <h1 style={{
              ...D, fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.04,
              letterSpacing: "-0.03em", margin: "0 0 16px",
            }}>
              {t("quiz.h1pre")} <span style={SI}>{t("quiz.h1em")}</span>{t("quiz.h1post")}
            </h1>
            <p style={{
              fontSize: 18, color: TH.inkSoft, maxWidth: 580, margin: "0 auto",
              lineHeight: 1.55,
            }}>
              {t("quiz.heroSub")}
            </p>
          </header>

          {/* Two cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "var(--quiz-cols)",
            gap: 20,
          }}>
            {/* Express */}
            <ChooserCard
              recommended
              tag={t("quiz.expressTag")}
              title={t("quiz.expressTitle")}
              tagline={t("quiz.expressTagline")}
              body={t("quiz.expressBody")}
              points={[t("quiz.expressP1"), t("quiz.expressP2"), t("quiz.expressP3"), t("quiz.expressP4")]}
              cta={t("quiz.expressCta")}
              href={navHref("/quiz/express", locale)}
              recommendedLabel={t("quiz.recommended")}
              freeLabel={t("quiz.freeNoSignup")}
              accent={TH.sage}
              accentDeep={TH.sageDeep}
            />
            {/* Complete */}
            <ChooserCard
              tag={t("quiz.completeTag")}
              title={t("quiz.completeTitle")}
              tagline={t("quiz.completeTagline")}
              body={t("quiz.completeBody")}
              points={[t("quiz.completeP1"), t("quiz.completeP2"), t("quiz.completeP3"), t("quiz.completeP4")]}
              cta={t("quiz.completeCta")}
              href={navHref("/quiz/complete", locale)}
              recommendedLabel={t("quiz.recommended")}
              freeLabel={t("quiz.freeNoSignup")}
              accent={TH.amber}
              accentDeep={TH.amberDeep}
            />
          </div>

          {/* Sub-section */}
          <section style={{
            marginTop: 36, padding: "24px 26px",
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 18, textAlign: "center",
          }}>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
              {t("quiz.notSure")}
            </div>
            <p style={{ fontSize: 15, color: TH.inkSoft, maxWidth: 580, margin: "0 auto 16px", lineHeight: 1.6 }}>
              {richText(t("quiz.notSureBody"), { boldStyle: { color: TH.ink } })}
            </p>
            <Link href={navHref("/quiz/express", locale)} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", background: TH.inkBg, color: "#fff",
              borderRadius: 999, textDecoration: "none",
              fontSize: 14, fontWeight: 500,
            }}>
              {t("quiz.notSureCta")}
            </Link>
          </section>

          {/* Other services */}
          <section style={{ marginTop: 50, textAlign: "center" }}>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              {t("quiz.otherServices")}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "var(--quiz-other-cols)", gap: 14,
              maxWidth: 760, margin: "0 auto",
            }}>
              <Link href={navHref("/build", locale)} style={otherServiceStyle()}>
                <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>{t("quiz.buildTitle")}</div>
                <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.5 }}>{t("quiz.buildDesc")}</div>
              </Link>
              <Link href="/audit" style={otherServiceStyle()}>
                <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>{t("quiz.auditTitle")}</div>
                <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.5 }}>{t("quiz.auditDesc")}</div>
              </Link>
            </div>
          </section>

          {/* Free guides (internal links) */}
          <section style={{ marginTop: 44, textAlign: "center" }}>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              {t("quiz.browseTitle")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {[
                [t("quiz.guide1"), "/best"],
                [t("quiz.guide2"), "/ingredients"],
                [t("quiz.guide3"), "/interactions"],
                [t("quiz.guide4"), "/timing"],
                [t("quiz.guide5"), "/biomarkers"],
              ].map(([label, href]) => (
                <Link key={href} href={href} style={{
                  padding: "9px 16px", background: TH.surface, border: `1px solid ${TH.edge}`,
                  borderRadius: 999, textDecoration: "none", color: TH.inkSoft, fontSize: 13.5, fontWeight: 500,
                }}>{label}</Link>
              ))}
            </div>
          </section>

          {/* FAQ (visible + matches JSON-LD) */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em", textAlign: "center" }}>{t("quiz.faqTitle")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 760, margin: "0 auto" }}>
              {QUIZ_FAQ.map((f, i) => (
                <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TH.ink, marginBottom: 6 }}>{f.q}</div>
                  <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <style>{`
        :root {
          --quiz-cols: 1fr 1fr;
          --quiz-other-cols: 1fr 1fr;
        }
        @media (max-width: 820px) {
          :root { --quiz-cols: 1fr; --quiz-other-cols: 1fr; }
        }
        .sd-quiz-chooser article {
          will-change: transform;
        }
        .sd-quiz-chooser:hover article {
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
}

function ChooserCard({
  tag, title, tagline, body, points, cta, href, accent, accentDeep, recommended, recommendedLabel, freeLabel,
}: {
  tag: string; title: string; tagline: string; body: string;
  points: string[]; cta: string; href: string;
  accent: string; accentDeep: string; recommended?: boolean;
  recommendedLabel: string; freeLabel: string;
}) {
  return (
    <Link href={href} className="sd-quiz-chooser" style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article style={{
        position: "relative", height: "100%",
        padding: "26px 26px 22px",
        background: TH.surface,
        border: `${recommended ? 2 : 1}px solid ${recommended ? accent : TH.edge}`,
        borderRadius: 22,
        boxShadow: recommended
          ? `0 1px 3px rgba(10,37,64,0.04), 0 14px 36px ${accent}33`
          : "0 1px 3px rgba(10,37,64,0.04), 0 10px 28px rgba(10,37,64,0.06)",
        display: "flex", flexDirection: "column",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        overflow: "hidden",
      }}>
        {recommended && (
          <span style={{
            position: "absolute", top: 14, right: 14,
            fontSize: 10, ...MM, letterSpacing: "0.08em",
            background: accent, color: "#fff",
            padding: "3px 10px", borderRadius: 999, fontWeight: 600,
          }}>{recommendedLabel}</span>
        )}

        <div style={{
          ...MM, fontSize: 11, color: accentDeep, letterSpacing: "0.1em",
          marginBottom: 10, textTransform: "uppercase",
        }}>{tag}</div>

        <h2 style={{ ...D, fontSize: 30, color: TH.ink, margin: "0 0 4px", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          {title}
        </h2>
        <div style={{ ...SI, fontStyle: "italic", fontSize: 18, color: accentDeep, marginBottom: 14 }}>
          {tagline}
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TH.inkSoft, margin: "0 0 16px" }}>
          {body}
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 6 }}>
          {points.map(p => (
            <li key={p} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: TH.inkSoft }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5">
                <path d="M5 12l5 5 9-11" />
              </svg>
              {p}
            </li>
          ))}
        </ul>

        <div style={{
          marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${TH.edge}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: TH.muted, ...MM }}>{freeLabel}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: accentDeep, fontWeight: 600, fontSize: 14 }}>
            {cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}

function otherServiceStyle(): React.CSSProperties {
  return {
    padding: "16px 18px", background: TH.surface,
    border: `1px solid ${TH.edge}`, borderRadius: 14,
    textAlign: "left", textDecoration: "none", color: "inherit",
    transition: "border-color .15s, transform .15s",
  };
}
