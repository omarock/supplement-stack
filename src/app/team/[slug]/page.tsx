import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { REVIEWERS } from "@/lib/reviewers";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export function generateStaticParams() {
  return REVIEWERS.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = REVIEWERS.find(x => x.slug === slug);
  if (!r) return { title: "Team — suppdoc.io" };
  return {
    title: `${r.name}, ${r.credential} — suppdoc.io`,
    description: `${r.name}${r.title ? `, ${r.title}` : ""} (${r.credential}) reviews evidence content for suppdoc.`,
    alternates: { canonical: `${BASE}/team/${r.slug}` },
  };
}

export default async function ReviewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = REVIEWERS.find(x => x.slug === slug);
  if (!r) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${r.name}, ${r.credential}`,
    url: `${BASE}/team/${r.slug}`,
    ...(r.title ? { jobTitle: r.title } : {}),
    ...(r.profileUrl ? { sameAs: r.profileUrl } : {}),
    worksFor: { "@id": `${BASE}/#org` },
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <nav style={{ ...MM, fontSize: 11, color: TH.muted, marginBottom: 18 }}>
            <Link href="/team" style={{ color: TH.sageDeep, textDecoration: "none" }}>Team</Link>
            <span style={{ color: TH.mutedDim }}> / {r.name}</span>
          </nav>
          <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 8px" }}>{r.name}</h1>
          <div style={{ ...MM, fontSize: 13, color: TH.sageDeep, marginBottom: 24 }}>{r.credential}{r.title ? ` · ${r.title}` : ""}</div>
          <p style={{ fontSize: 16, color: TH.inkSoft, lineHeight: 1.6 }}>
            {r.name} reviews suppdoc&apos;s evidence content against our{" "}
            <Link href="/editorial" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>editorial standards</Link>.
          </p>
          {r.profileUrl && (
            <p style={{ marginTop: 16 }}>
              <a href={r.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>Professional profile →</a>
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
