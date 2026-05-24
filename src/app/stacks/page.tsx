import type { Metadata } from "next";
import Link from "next/link";
import { STACKS, stackMonthlyCost } from "@/lib/stacks";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export const metadata: Metadata = {
  title: "Pre-made Stacks — suppdoc.io",
  description: "11 ready-to-adopt supplement stacks composed by Phyla. Sleep, energy, focus, stress, recovery, immunity, vegan, longevity, hormonal balance, beauty, and a foundational starter.",
  keywords: "supplement stacks, best supplements for sleep, best supplements for energy, vegan supplements, supplement routines",
};

export default function StacksPage() {
  const sorted = [...STACKS].sort((a, b) => (a.popularity ?? 99) - (b.popularity ?? 99));

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 32px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
            — READY-MADE STACKS —
          </div>
          <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            Skip the quiz. <em style={{ color: th.burgundy }}>Pick a stack</em>.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 600, margin: "20px auto 0" }}>
            11 thoughtful supplement routines, each built around a specific goal or persona. Every product is curated from iHerb&apos;s top-rated brands. Adopt one today.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/quiz" style={{
              padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              background: "transparent", color: th.ink, border: `1.5px solid ${th.line}`,
              textDecoration: "none",
            }}>
              Or take the personalised quiz →
            </Link>
          </div>
        </section>

        {/* Grid */}
        <section style={{ padding: "32px var(--section-pad-x) var(--section-pad-y)", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
            {sorted.map((stack, i) => {
              const cost = stackMonthlyCost(stack);
              return (
                <Link key={stack.id} href={`/stacks/${stack.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
                    overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
                    animation: `phyla-rise .5s ${i * 0.04}s ease-out both`,
                  }}>
                    {/* Cover */}
                    <div style={{
                      background: stack.coverBg, padding: "32px 24px", textAlign: "center",
                      color: stack.coverInk, position: "relative",
                    }}>
                      <div style={{ fontSize: 11, ...MM, opacity: 0.8, letterSpacing: "0.15em", marginBottom: 14 }}>
                        {stack.category.toUpperCase()}
                      </div>
                      <div style={{ ...S, fontSize: 80, lineHeight: 1, marginBottom: 14, letterSpacing: "-0.03em" }}>
                        {stack.coverGlyph}
                      </div>
                      <div style={{ ...S, fontSize: 24, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                        {stack.name}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
                      <p style={{ ...S, fontSize: 18, color: th.ink, lineHeight: 1.35, margin: 0, letterSpacing: "-0.01em" }}>
                        &ldquo;{stack.tagline}&rdquo;
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                        {stack.bestFor.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            fontSize: 11, padding: "3px 10px", borderRadius: 999,
                            background: "rgba(91,163,115,0.08)", color: th.sage,
                            border: "1px solid rgba(74,106,78,0.18)",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{
                        marginTop: "auto", paddingTop: 18,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: 12, color: th.inkMute, ...MM, letterSpacing: "0.05em",
                      }}>
                        <span>{stack.supplementIds.length} SUPPLEMENTS</span>
                        <span>~${cost}/MO</span>
                      </div>

                      <div style={{
                        marginTop: 14, padding: "10px 14px", borderRadius: 999,
                        background: th.ink, color: th.bg, textAlign: "center",
                        fontSize: 13, fontWeight: 500,
                      }}>
                        Explore stack →
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 720, margin: "0 auto", textAlign: "center",
        }}>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20, padding: 32,
          }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Want a stack <em style={{ color: th.burgundy }}>uniquely</em> yours?
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
              The 60-second quiz builds a personalised stack from your goals, lifestyle, and budget.
            </p>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 500,
              background: th.burgundy, color: "#ffffff", textDecoration: "none",
            }}>
              Take the quiz →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
