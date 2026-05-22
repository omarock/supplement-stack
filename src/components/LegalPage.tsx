import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f4ede1", paper: "#fbf6ec", ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", burgundy: "#7d2e3a", line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export default function LegalPage({
  eyebrow, title, lastUpdated, children,
}: {
  eyebrow: string; title: string; lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
            — {eyebrow.toUpperCase()} —
          </div>
          <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            {title}
          </h1>
          <p style={{ color: th.inkMute, fontSize: 13, ...MM, marginTop: 18 }}>
            LAST UPDATED · {lastUpdated.toUpperCase()}
          </p>
        </div>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div className="prose" style={{ maxWidth: 760, margin: "0 auto" }}>
          {children}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
