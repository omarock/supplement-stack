import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { allPublishedDrafts } from "@/lib/agents/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library, suppdoc.io",
  description: "Evidence-led guides on supplements, timing, interactions, and biomarkers.",
  alternates: { canonical: "/library" },
};

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", line: "rgba(10,37,64,0.08)",
};
const D = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;

export default async function LibraryHub() {
  const items = await allPublishedDrafts();

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px var(--section-pad-x) var(--section-pad-y)" }}>
        <h1 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 12px" }}>Library</h1>
        <p style={{ fontSize: 17, color: th.inkSoft, lineHeight: 1.55, maxWidth: 620, margin: "0 0 36px" }}>
          Evidence-led guides on supplements, timing, interactions, and lab markers. Free, and we don&apos;t sell supplements.
        </p>

        {items.length === 0 ? (
          <p style={{ color: th.inkMute, fontSize: 15 }}>New guides are on the way. In the meantime, explore the <Link href="/ingredients" style={{ color: th.sageDeep }}>ingredient guides</Link> and the <Link href="/interactions" style={{ color: th.sageDeep }}>interaction checker</Link>.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {items.map(it => {
              const p = (it.edited ?? it.payload) as Record<string, unknown>;
              return (
                <Link key={it.id} href={`/library/${it.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 22, height: "100%" }}>
                    <h2 style={{ ...D, fontSize: 19, color: th.ink, margin: "0 0 8px", letterSpacing: "-0.015em", lineHeight: 1.3 }}>{String(p.title ?? it.title)}</h2>
                    <p style={{ fontSize: 13.5, color: th.inkSoft, lineHeight: 1.5, margin: 0 }}>{String(p.meta_description ?? "")}</p>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
