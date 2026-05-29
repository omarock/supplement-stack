import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import type { LinkRef } from "@/lib/related";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;

export interface RelatedGroup {
  title: string;        // "Often combined with", "May interact with"…
  items: LinkRef[];
}

/**
 * Semantic "related content" web. Renders only the groups that have links, so
 * a page never shows an empty section. This is the visible layer of the
 * topical-authority graph that connects ingredients, goals, biomarkers,
 * interactions, stacks and research.
 */
export default function RelatedContent({ heading = "Explore further", groups }: { heading?: string; groups: RelatedGroup[] }) {
  const real = groups.filter(g => g.items.length > 0);
  if (real.length === 0) return null;

  return (
    <section style={{ marginTop: 8, marginBottom: 28, borderTop: `1px solid ${TH.edge}`, paddingTop: 26 }}>
      <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 18px", letterSpacing: "-0.02em" }}>{heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 22 }}>
        {real.map(g => (
          <div key={g.title}>
            <h3 style={{ ...D, fontWeight: 600, fontSize: 14, color: TH.ink, margin: "0 0 10px" }}>{g.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dedupe(g.items).slice(0, 8).map(item => (
                <Link key={item.href + item.label} href={item.href} style={{
                  display: "inline-flex", alignItems: "center", padding: "7px 13px", borderRadius: 999,
                  background: TH.surface, border: `1px solid ${TH.edge}`, color: TH.inkSoft,
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                }}>{item.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function dedupe(items: LinkRef[]): LinkRef[] {
  const seen = new Set<string>();
  return items.filter(i => (seen.has(i.href) ? false : (seen.add(i.href), true)));
}
