import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/blog";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "var(--c-bg)", bgWarm: "var(--c-bg)", paper: "var(--c-surface)",
  ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title}, suppdoc.io Journal`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fallback = POSTS.filter(p => p.slug !== post.slug).slice(0, 3);
  const recommendations = related.length >= 2 ? related : fallback;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <article>
        {/* Hero cover */}
        <section style={{
          background: post.coverBg, padding: "64px var(--section-pad-x) 80px",
          textAlign: "center", color: post.coverInk,
        }}>
          <Link href="/journal" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: post.coverInk, opacity: 0.85, textDecoration: "none",
            fontSize: 13, marginBottom: 32,
          }}>
            ← Back to Journal
          </Link>

          <div style={{ fontSize: 11, ...MM, opacity: 0.85, letterSpacing: "0.15em", marginBottom: 18 }}>
            {post.category.toUpperCase()}
          </div>

          <div style={{ ...S, fontSize: 90, lineHeight: 1, marginBottom: 24, letterSpacing: "-0.04em" }}>
            {post.coverGlyph}
          </div>

          <h1 style={{
            ...D, fontSize: "var(--section-h2)", lineHeight: 1.05, margin: "0 auto",
            maxWidth: 800, letterSpacing: "-0.03em",
          }}>
            {post.title}
          </h1>

          <div style={{
            display: "flex", justifyContent: "center", gap: 18,
            marginTop: 24, fontSize: 13, opacity: 0.85, ...MM,
            flexWrap: "wrap",
          }}>
            <span>{post.author}</span>
            <span>·</span>
            <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span>{post.readTime} read</span>
          </div>
        </section>

        {/* Body */}
        <section style={{ padding: "64px var(--section-pad-x)", background: th.bg }}>
          <div className="prose" style={{ maxWidth: 720, margin: "0 auto" }}>
            <p style={{ fontSize: 20, color: th.ink, lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
              {post.excerpt}
            </p>
            {post.content()}
          </div>
        </section>

        {/* CTA strip */}
        <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
          <div style={{
            maxWidth: 720, margin: "0 auto",
            background: `linear-gradient(135deg, ${th.sage} 0%, #3f7a52 100%)`,
            borderRadius: 20, padding: "32px 36px", color: "#ffffff",
            textAlign: "center",
          }}>
            <h3 style={{ ...D, fontSize: 28, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
              Get a stack matched to you.
            </h3>
            <p style={{ fontSize: 15, opacity: 0.85, margin: "0 0 22px", lineHeight: 1.5 }}>
              Quick, evidence-led, free.
            </p>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 999,
              background: "var(--c-surface)", color: "var(--c-sage-deep)", textDecoration: "none",
              fontWeight: 600, fontSize: 14,
            }}>
              Begin your analysis →
            </Link>
          </div>
        </section>

        {/* Related posts */}
        <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ ...D, fontSize: 32, margin: "0 0 24px", letterSpacing: "-0.025em", color: th.ink, textAlign: "center" }}>
              Keep reading
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {recommendations.map(p => (
                <Link key={p.slug} href={`/journal/${p.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
                    overflow: "hidden", height: "100%",
                  }}>
                    <div style={{ background: p.coverBg, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ ...S, fontSize: 70, color: p.coverInk, lineHeight: 1 }}>{p.coverGlyph}</span>
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={{ fontSize: 10, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 8 }}>
                        {p.category.toUpperCase()}
                      </div>
                      <h3 style={{ ...D, fontSize: 17, color: th.ink, margin: 0, letterSpacing: "-0.015em", lineHeight: 1.3 }}>
                        {p.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
