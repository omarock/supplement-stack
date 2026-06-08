import type { Metadata } from "next";
import Link from "next/link";
import { STACKS, stackMonthlyCost } from "@/lib/stacks";
import { PRODUCTS } from "@/lib/products";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

function cleanIherbImageUrl(url?: string): string | undefined {
  if (!url) return url;
  if (!url.includes("cloudinary.images-iherb.com")) return url;
  return url.replace(
    /\/image\/upload\/([^/]+)\/images\//,
    "/image/upload/$1,c_pad,b_white,w_240,h_240/images/"
  );
}

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export const metadata: Metadata = {
  title: "Pre-made Stacks, suppdoc.io",
  description: "15 ready-to-adopt supplement stacks composed by suppdoc.io. Sleep, energy, focus, stress, recovery, immunity, vegan, longevity, hormonal balance, beauty, menopause support, gut reset, athletic performance, and a foundational starter.",
  keywords: "supplement stacks, best supplements for sleep, best supplements for energy, vegan supplements, supplement routines",
  alternates: { canonical: "/stacks" },
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
          READY-MADE STACKS
          </div>
          <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            Skip the quiz. <em style={{ color: th.burgundy }}>Pick a stack</em>.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 600, margin: "20px auto 0" }}>
            {STACKS.length} thoughtful supplement routines, each built around a specific goal or persona. Every product is curated from top-rated, third-party-tested brands. Adopt one today.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/build" style={{
              padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              background: th.burgundy, color: "#fff", border: `1.5px solid ${th.ink}`,
              textDecoration: "none",
            }}>
              Build your own from scratch →
            </Link>
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
              // Get up to 4 product preview images from the stack's supplements
              const previewImages = stack.supplementIds
                .slice(0, 4)
                .map(id => PRODUCTS[id]?.[0])
                .filter(Boolean)
                .map(p => ({
                  url: cleanIherbImageUrl(p!.imageUrl) ?? "",
                  brand: p!.brand,
                  bg: p!.brandBg,
                }))
                .filter(p => p.url);
              return (
                <Link key={stack.id} href={`/stacks/${stack.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
                    overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
                    animation: `phyla-rise .5s ${i * 0.04}s ease-out both`,
                    transition: "transform .2s ease, box-shadow .2s ease",
                    boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 8px 24px rgba(10,37,64,0.06)",
                  }}>
                    {/* Cover with gradient + glyph */}
                    <div style={{
                      background: stack.coverBg, padding: "28px 24px 20px", textAlign: "center",
                      color: stack.coverInk, position: "relative",
                    }}>
                      <div style={{ fontSize: 11, ...MM, opacity: 0.85, letterSpacing: "0.15em", marginBottom: 10 }}>
                        {stack.category.toUpperCase()}
                      </div>
                      <div style={{ ...S, fontSize: 64, lineHeight: 1, marginBottom: 10, letterSpacing: "-0.03em" }}>
                        {stack.coverGlyph}
                      </div>
                      <div style={{ ...S, fontSize: 24, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                        {stack.name}
                      </div>
                    </div>

                    {/* Product preview mosaic, shows the actual bottles in the stack */}
                    {previewImages.length > 0 && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${previewImages.length}, 1fr)`,
                        background: "#fafaf8",
                        borderTop: `1px solid ${th.line}`,
                        borderBottom: `1px solid ${th.line}`,
                      }}>
                        {previewImages.map((p, idx) => (
                          <div key={idx} style={{
                            background: "var(--c-surface)",
                            borderRight: idx < previewImages.length - 1 ? `1px solid ${th.line}` : "none",
                            padding: "12px 8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            height: 90,
                          }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.url}
                              alt={`${p.brand} product preview`}
                              loading="lazy"
                              style={{
                                maxWidth: "100%", maxHeight: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

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
                        marginTop: 14, padding: "12px 14px", borderRadius: 999,
                        background: th.burgundy, color: "#fff", textAlign: "center",
                        fontSize: 13, fontWeight: 600,
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
              The quiz builds a personalised stack from your goals, lifestyle, and budget.
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
