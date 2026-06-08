import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export default function LegalPage({
  eyebrow, title, lastUpdated, lastUpdatedLabel, children,
}: {
  eyebrow: string; title: string; lastUpdated: string;
  lastUpdatedLabel?: string; // defaults to "Last updated"; pass a translated label for localized pages
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 14 }}>
            {eyebrow}
          </div>
          <h1 style={{ ...D, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {title}
          </h1>
          <p style={{ color: TH.muted, fontSize: 13, ...MM, marginTop: 18 }}>
            {(lastUpdatedLabel ?? "Last updated").toUpperCase()} · {lastUpdated.toUpperCase()}
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
