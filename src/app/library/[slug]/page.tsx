import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { publishedDraftBySlug } from "@/lib/agents/store";
import { renderMarkdown } from "@/lib/agents/markdown";

// DB-backed: always reflect the latest approved/published state.
export const dynamic = "force-dynamic";

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageDeep: "var(--c-sage-deep)", line: "var(--c-edge)",
};
const D = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

const TOOLS: Record<string, { href: string; label: string; sub: string }> = {
  interactions: { href: "/interactions", label: "Check your stack for interactions", sub: "Free interaction checker." },
  audit: { href: "/audit", label: "Audit my stack", sub: "Paste your stack, we flag issues free." },
  bloodwork: { href: "/bloodwork", label: "Analyze my bloodwork", sub: "Upload labs, get evidence-led guidance." },
  quiz: { href: "/quiz", label: "Get a stack matched to you", sub: "Quick, evidence-led, free." },
};

function pick(item: { payload: Record<string, unknown>; edited: Record<string, unknown> | null }) {
  return (item.edited ?? item.payload) as Record<string, unknown>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await publishedDraftBySlug(slug);
  if (!item) return { title: "Not found, suppdoc.io" };
  const p = pick(item);
  return {
    title: `${String(p.title ?? item.title)}, suppdoc.io`,
    description: String(p.meta_description ?? ""),
    alternates: { canonical: `/library/${item.slug}` },
    openGraph: { title: String(p.title ?? item.title), description: String(p.meta_description ?? ""), type: "article" },
  };
}

export default async function LibraryArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await publishedDraftBySlug(slug);
  if (!item) notFound();
  const p = pick(item);

  const h1 = String(p.h1 ?? p.title ?? item.title ?? "");
  const bodyHtml = renderMarkdown(String(p.body_md ?? ""));
  const tool = TOOLS[String(p.tool_embed ?? "")] ?? TOOLS.quiz;
  const jsonld = p.jsonld && typeof p.jsonld === "object" ? p.jsonld : null;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      {jsonld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />}

      <article>
        <section style={{ padding: "56px var(--section-pad-x) 8px", maxWidth: 760, margin: "0 auto" }}>
          <Link href="/library" style={{ fontSize: 13, color: th.sageDeep, textDecoration: "none" }}>← Library</Link>
          <h1 style={{ ...D, fontSize: "var(--section-h2)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "18px 0 14px", color: th.ink }}>{h1}</h1>
          {!!p.meta_description && <p style={{ fontSize: 19, color: th.ink, lineHeight: 1.55, fontWeight: 500, margin: 0 }}>{String(p.meta_description)}</p>}
        </section>

        <section style={{ padding: "20px var(--section-pad-x) 40px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </section>

        {/* tool CTA */}
        <section style={{ padding: "0 var(--section-pad-x) 48px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", background: `linear-gradient(135deg, ${th.sage} 0%, ${th.sageDeep} 100%)`, borderRadius: 20, padding: "30px 34px", color: "#fff", textAlign: "center" }}>
            <h3 style={{ ...D, fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{tool.label}</h3>
            <p style={{ fontSize: 14.5, opacity: 0.9, margin: "0 0 20px" }}>{tool.sub}</p>
            <Link href={tool.href} style={{ display: "inline-block", padding: "13px 24px", borderRadius: 999, background: "var(--c-surface)", color: th.sageDeep, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Open the tool →</Link>
          </div>
        </section>

        <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
          <p style={{ maxWidth: 760, margin: "0 auto", fontSize: 12.5, color: th.inkMute, ...MM, lineHeight: 1.6 }}>
            This is education, not medical advice. Supplements are not intended to diagnose, treat, cure, or prevent any disease. Talk to your clinician before changing what you take.
          </p>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
