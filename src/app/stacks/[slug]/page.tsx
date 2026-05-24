import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STACKS, getStack, getStackSupplements, stackMonthlyCost } from "@/lib/stacks";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SupplementGrid, { DailyRoutine } from "@/components/SupplementGrid";

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export async function generateStaticParams() {
  return STACKS.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const stack = getStack(slug);
  if (!stack) return { title: "Not found" };
  return {
    title: `${stack.name} — suppdoc.io`,
    description: stack.description,
    keywords: `${stack.name}, ${stack.bestFor.join(", ")}, supplement stack`,
    openGraph: {
      title: stack.name,
      description: stack.tagline,
      type: "article",
    },
  };
}

export default async function StackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stack = getStack(slug);
  if (!stack) notFound();

  const supplements = getStackSupplements(stack);
  const cost = stackMonthlyCost(stack);

  const related = STACKS.filter(s => s.slug !== stack.slug && s.category === stack.category).slice(0, 3);
  const fallback = STACKS.filter(s => s.slug !== stack.slug).sort((a, b) => (a.popularity ?? 99) - (b.popularity ?? 99)).slice(0, 3);
  const recommendations = related.length >= 2 ? related : fallback;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <article>
        {/* Hero */}
        <section style={{
          background: stack.coverBg, color: stack.coverInk,
          padding: "64px var(--section-pad-x) 80px",
          textAlign: "center", position: "relative",
        }}>
          <Link href="/stacks" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: stack.coverInk, opacity: 0.85, textDecoration: "none",
            fontSize: 13, marginBottom: 32,
          }}>
            ← All stacks
          </Link>
          <div style={{ fontSize: 11, ...MM, opacity: 0.85, letterSpacing: "0.15em", marginBottom: 18 }}>
            {stack.category.toUpperCase()} STACK
          </div>
          <div style={{ ...S, fontSize: 100, lineHeight: 1, marginBottom: 16, letterSpacing: "-0.04em" }}>
            {stack.coverGlyph}
          </div>
          <h1 style={{ ...S, fontSize: "var(--section-h2)", lineHeight: 1.05, margin: "0 auto", maxWidth: 800, letterSpacing: "-0.025em" }}>
            {stack.name}
          </h1>
          <p style={{ ...S, fontSize: 22, opacity: 0.92, marginTop: 18, maxWidth: 640, marginLeft: "auto", marginRight: "auto", fontStyle: "italic" }}>
            &ldquo;{stack.tagline}&rdquo;
          </p>
          <div style={{
            display: "flex", justifyContent: "center", gap: 32,
            marginTop: 32, fontSize: 13, opacity: 0.85, ...MM, flexWrap: "wrap",
          }}>
            <span>{supplements.length} SUPPLEMENTS</span>
            <span>~${cost}/MO</span>
            <span>VIA iHERB</span>
          </div>
        </section>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 32px" }}>

          {/* Description */}
          <section style={{ maxWidth: 720, margin: "0 auto 48px" }}>
            <p style={{ fontSize: 18, color: th.ink, lineHeight: 1.65, fontWeight: 500 }}>
              {stack.description}
            </p>
          </section>

          {/* Best for + Warnings (2 col) */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}>
            <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18, padding: 24 }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 12 }}>
                ✓ BEST FOR
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {stack.bestFor.map(item => (
                  <li key={item} style={{ fontSize: 14, color: th.ink, display: "flex", gap: 10 }}>
                    <span style={{ color: th.sage }}>·</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {stack.warnings && stack.warnings.length > 0 && (
              <div style={{ background: "#fff8eb", border: "1px solid rgba(196,148,74,0.30)", borderRadius: 18, padding: 24 }}>
                <div style={{ fontSize: 11, ...MM, color: "#a87a52", letterSpacing: "0.1em", marginBottom: 12 }}>
                  ⚠ IMPORTANT TO KNOW
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {stack.warnings.map(item => (
                    <li key={item} style={{ fontSize: 14, color: "#7c5c1f", display: "flex", gap: 10, lineHeight: 1.5 }}>
                      <span>·</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Why this works */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", color: th.ink }}>
              Why this works
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {stack.benefits.map((b, i) => (
                <div key={b} style={{
                  background: th.paper, border: `1px solid ${th.line}`,
                  borderRadius: 14, padding: 20,
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{
                    ...S, fontSize: 24, color: th.sage, lineHeight: 1, fontStyle: "italic", flexShrink: 0,
                  }}>{(i + 1).toString().padStart(2, "0")}</div>
                  <div style={{ fontSize: 14, color: th.ink, lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>
            <p style={{
              marginTop: 18, padding: "14px 20px",
              background: "rgba(91,163,115,0.06)", borderRadius: 12,
              fontSize: 13, color: th.inkSoft, lineHeight: 1.5,
            }}>
              <strong style={{ color: th.sage }}>Expected timeline:</strong> {stack.expectedTimeline}
            </p>
          </section>

          {/* Supplements */}
          <section style={{ marginBottom: 48 }}>
            <SupplementGrid
              supplements={supplements}
              source={`stack-${stack.slug}`}
              title="What's in the stack"
              showTotalCost
            />
          </section>

          {/* Daily routine */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", color: th.ink }}>
              Your daily routine
            </h2>
            <DailyRoutine supplements={supplements} />
          </section>

          {/* CTA */}
          <section style={{ marginBottom: 56 }}>
            <div style={{
              background: `linear-gradient(135deg, ${th.burgundy} 0%, #0a2540 100%)`,
              borderRadius: 24, padding: 40, textAlign: "center", color: "#ffffff",
            }}>
              <h2 style={{ ...S, fontSize: 40, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                Ready to adopt this stack?
              </h2>
              <p style={{ color: "rgba(251,246,236,0.85)", fontSize: 15, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                Click any supplement above to choose your preferred brand. All products ship globally via iHerb.
              </p>
              <Link href="/quiz" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 26px", borderRadius: 999, fontSize: 14, fontWeight: 500,
                background: "transparent", color: "#ffffff", textDecoration: "none",
                border: "1px solid rgba(251,246,236,0.4)",
              }}>
                Or get a personalised stack →
              </Link>
            </div>
          </section>

          {/* Related stacks */}
          <section>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", textAlign: "center" }}>
              Explore other stacks
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {recommendations.map(s => (
                <Link key={s.slug} href={`/stacks/${s.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      background: s.coverBg, padding: "20px 16px", textAlign: "center",
                      color: s.coverInk,
                    }}>
                      <div style={{ ...S, fontSize: 50, lineHeight: 1, marginBottom: 8 }}>{s.coverGlyph}</div>
                      <div style={{ ...S, fontSize: 18, letterSpacing: "-0.01em" }}>{s.name}</div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ fontSize: 13, color: th.inkSoft, margin: 0, lineHeight: 1.45 }}>
                        {s.tagline}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <p style={{
            fontSize: 11, color: th.inkMute, lineHeight: 1.6, textAlign: "center",
            maxWidth: 720, margin: "32px auto 0",
          }}>
            <strong>For informational purposes only. Not medical advice.</strong>{" "}
            Always consult a qualified healthcare professional before starting any supplement regimen.
            <br /><br />
            <em>suppdoc.io is an iHerb affiliate. We may earn a commission on qualifying purchases through our links — at no extra cost to you.</em>
          </p>

        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
