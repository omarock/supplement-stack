import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export const metadata: Metadata = {
  title: "Take the Quiz, Express or Complete | suppdoc.io",
  description: "Get a personalised supplement stack. Choose the 2-minute Express quiz for fast goal-matched recommendations, or the 5-minute Complete quiz for deep personalization including bloodwork analysis.",
  keywords: "supplement quiz, personalised supplements, personalised supplement quiz, express supplement quiz",
  alternates: { canonical: "/quiz" },
};

const QUIZ_FAQ = [
  { q: "Is the supplement quiz free?", a: "Yes. Both the 2-minute Express and the 5-minute Complete quiz are free with no signup. You answer a few questions about your goals, sleep, energy, and stress, and get a personalised 4 to 7 supplement stack instantly, each pick with its dose, timing, and the evidence behind it." },
  { q: "How does the quiz decide what supplements I need?", a: "It matches your goals and answers against an evidence-graded database of 200+ ingredients, then ranks the best fits and checks them for interactions and redundancies, so the stack you get is coherent rather than a random list." },
  { q: "Which quiz should I take, Express or Complete?", a: "Take Express. It gives about 90% of the accuracy in 30% of the time. Choose Complete if you want to factor in current supplements, medications, health conditions, or upload bloodwork for a deeper match." },
  { q: "Do you sell the supplements?", a: "No. suppdoc does not sell its own supplements. We recommend evidence-led options and link to trusted retailers, so the advice is not biased toward a house brand." },
];

export default function QuizChooser() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUIZ_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Hero */}
          <header style={{ textAlign: "center", marginBottom: 36, animation: "sd-fade-in .5s ease-out" }}>
            <div style={{
              ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em",
              marginBottom: 14, textTransform: "uppercase",
            }}>Service 01 · Personalised Quiz</div>
            <h1 style={{
              ...D, fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.04,
              letterSpacing: "-0.03em", margin: "0 0 16px",
            }}>
              Get a stack <span style={SI}>matched to you</span>.
            </h1>
            <p style={{
              fontSize: 18, color: TH.inkSoft, maxWidth: 580, margin: "0 auto",
              lineHeight: 1.55,
            }}>
              Two ways in. Most people want Express, quick and accurate. Complete is for when you want every nuance considered.
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
              tag="Most popular · 2 minutes"
              title="Express Quiz"
              tagline="Fast. Beginner-friendly."
              body="Six core questions about your goals, energy, sleep, and stress. We generate a 4-7 supplement stack instantly."
              points={[
                "6 questions · 2 minutes",
                "Goal-matched recommendations",
                "No medical history needed",
                "Best for first-time users",
              ]}
              cta="Start the Express quiz"
              href="/quiz/express"
              accent={TH.sage}
              accentDeep={TH.sageDeep}
            />
            {/* Complete */}
            <ChooserCard
              tag="Advanced · 5 minutes"
              title="Complete Quiz"
              tagline="Deep personalization."
              body="10+ questions on sleep, stress, symptoms, current supplements, medications, and health conditions. The deepest match our engine can produce."
              points={[
                "Sleep, stress, nutrition, lifestyle",
                "Existing supplements & medications",
                "Health conditions & allergies",
                "Optional bloodwork upload (PDF)",
              ]}
              cta="Start the Complete quiz"
              href="/quiz/complete"
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
              Not sure which to take?
            </div>
            <p style={{ fontSize: 15, color: TH.inkSoft, maxWidth: 580, margin: "0 auto 16px", lineHeight: 1.6 }}>
              <strong style={{ color: TH.ink }}>Take Express.</strong> It&apos;s designed to give 90% of the accuracy in 30% of the time. You can upgrade to the Complete quiz any time.
            </p>
            <Link href="/quiz/express" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", background: TH.inkBg, color: "#fff",
              borderRadius: 999, textDecoration: "none",
              fontSize: 14, fontWeight: 500,
            }}>
              Start with Express →
            </Link>
          </section>

          {/* Other services */}
          <section style={{ marginTop: 50, textAlign: "center" }}>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              Or choose a different service
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "var(--quiz-other-cols)", gap: 14,
              maxWidth: 760, margin: "0 auto",
            }}>
              <Link href="/build" style={otherServiceStyle()}>
                <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>Build your own →</div>
                <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.5 }}>Describe your goals in plain English, or pick from 200+ ingredients manually.</div>
              </Link>
              <Link href="/audit" style={otherServiceStyle()}>
                <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>Audit my current stack →</div>
                <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.5 }}>Paste what you take today. We&apos;ll find redundancies, gaps, and timing issues.</div>
              </Link>
            </div>
          </section>

          {/* Free guides (internal links) */}
          <section style={{ marginTop: 44, textAlign: "center" }}>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              Prefer to browse? Free evidence-led guides
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {[
                ["Best for your goal", "/best"],
                ["All 200+ ingredients", "/ingredients"],
                ["Interaction checker", "/interactions"],
                ["Best time to take each supplement", "/timing"],
                ["What your bloodwork means", "/biomarkers"],
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
            <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 16px", letterSpacing: "-0.02em", textAlign: "center" }}>Supplement quiz, FAQ</h2>
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
  tag, title, tagline, body, points, cta, href, accent, accentDeep, recommended,
}: {
  tag: string; title: string; tagline: string; body: string;
  points: string[]; cta: string; href: string;
  accent: string; accentDeep: string; recommended?: boolean;
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
          }}>RECOMMENDED</span>
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
          <span style={{ fontSize: 13, color: TH.muted, ...MM }}>Free · no signup</span>
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
