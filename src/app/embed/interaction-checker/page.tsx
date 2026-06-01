import type { Metadata } from "next";
import { buildCheckerData, checkerStats } from "@/lib/checker";
import InteractionChecker from "@/components/InteractionChecker";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

// Widget endpoint, not a content page: keep it out of the index (but follow the
// attribution link). It is the iframe target for the embeddable checker.
export const metadata: Metadata = {
  title: "Supplement Interaction Checker, suppdoc.io",
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE}/interactions` },
};

export default function InteractionCheckerEmbed() {
  const { options, data } = buildCheckerData();
  const stats = checkerStats();
  return (
    <div style={{
      minHeight: "100%", background: TH.bg, color: TH.ink,
      fontFamily: '"Inter", system-ui, sans-serif', padding: 16,
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ ...D, fontSize: 18, color: TH.ink, letterSpacing: "-0.02em" }}>Supplement interaction checker</div>
          <div style={{ ...MM, fontSize: 10.5, color: TH.muted, marginTop: 3 }}>{stats.pairs} interactions · {stats.ingredients} ingredients · free</div>
        </div>
        <InteractionChecker options={options} data={data} compact />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href={`${BASE}/interactions`} target="_blank" rel="noopener" style={{ ...MM, fontSize: 11, color: TH.sageDeep, textDecoration: "none" }}>
            Powered by suppdoc.io →
          </a>
        </div>
      </div>
    </div>
  );
}
