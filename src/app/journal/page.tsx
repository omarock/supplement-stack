import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/blog";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f6f5f1", bgWarm: "#f0eee8", paper: "#ffffff",
  ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export const metadata: Metadata = {
  title: "Journal — suppdoc.io",
  description: "Evidence-led articles on supplements, sleep, stress, and personalised wellness. Curated from peer-reviewed research, written in plain language.",
  keywords: "supplement journal, evidence-based supplements, wellness articles, supplement guide",
};

export default function JournalPage() {
  const [first, ...rest] = POSTS;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
            — THE JOURNAL —
          </div>
          <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.05, color: th.ink }}>
            Read before you <em style={{ color: th.burgundy }}>supplement</em>.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "20px auto 0" }}>
            Plain-language guides to what works, what doesn&apos;t, and how to spend your supplement budget where it matters most.
          </p>
        </section>

        {/* Featured */}
        <section style={{ padding: "0 var(--section-pad-x) 48px" }}>
          <Link href={`/journal/${first.slug}`} style={{ textDecoration: "none" }}>
            <article style={{
              display: "grid", gridTemplateColumns: "var(--grid-2-cols)", gap: "var(--grid-2-gap)",
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 24, overflow: "hidden",
              maxWidth: 1200, margin: "0 auto",
            }}>
              <div style={{
                background: first.coverBg, minHeight: 320,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <span style={{ ...S, fontSize: 160, color: first.coverInk, lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {first.coverGlyph}
                </span>
              </div>
              <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 12 }}>
                  FEATURED · {first.category.toUpperCase()}
                </div>
                <h2 style={{ ...S, fontSize: 38, color: th.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  {first.title}
                </h2>
                <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.6, marginTop: 14 }}>
                  {first.excerpt}
                </p>
                <div style={{ marginTop: 20, fontSize: 13, color: th.inkMute, ...MM }}>
                  {first.author} · {first.readTime} read
                </div>
              </div>
            </article>
          </Link>
        </section>

        {/* Article grid */}
        <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {rest.map(post => (
              <Link key={post.slug} href={`/journal/${post.slug}`} style={{ textDecoration: "none" }}>
                <article style={{
                  background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
                  overflow: "hidden", height: "100%",
                  display: "flex", flexDirection: "column",
                  transition: "transform .2s ease",
                }}>
                  <div style={{
                    background: post.coverBg, height: 200,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ ...S, fontSize: 100, color: post.coverInk, lineHeight: 1, letterSpacing: "-0.04em" }}>
                      {post.coverGlyph}
                    </span>
                  </div>
                  <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 10 }}>
                      {post.category.toUpperCase()}
                    </div>
                    <h3 style={{ ...S, fontSize: 22, color: th.ink, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                      {post.title}
                    </h3>
                    <p style={{ color: th.inkSoft, fontSize: 14, lineHeight: 1.55, marginTop: 10, marginBottom: 0 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 12, color: th.inkMute, ...MM }}>
                      {post.readTime} · {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
