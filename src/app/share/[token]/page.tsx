import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import { decodeShareToken } from "@/lib/share";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { PRODUCTS } from "@/lib/products";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const payload = decodeShareToken(token);
  if (!payload) return { title: "Stack not found, suppdoc.io" };

  const supps = payload.ids
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s));
  const count = supps.length;
  const cost = supps.reduce((sum, s) => sum + s.monthlyCost, 0);
  const name = payload.name?.trim() || "Custom Stack";

  return {
    title: `${name}, ${count} supplement${count === 1 ? "" : "s"} on suppdoc.io`,
    description: `${name}: ${supps.slice(0, 5).map(s => s.name.split(" (")[0]).join(", ")}${count > 5 ? "…" : ""}. ~$${cost}/month. View, adopt, or remix on suppdoc.io.`,
    openGraph: {
      title: `${name}, suppdoc.io`,
      description: `${count} supplement${count === 1 ? "" : "s"} · ~$${cost}/month · personalised on suppdoc.io.`,
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = decodeShareToken(token);
  if (!payload) notFound();

  const supps = payload.ids
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s));
  if (supps.length === 0) notFound();

  const name = payload.name?.trim() || "Custom Stack";
  const monthlyCost = supps.reduce((sum, s) => sum + s.monthlyCost, 0);

  // Group by timing for daily ritual display
  const TIMINGS = ["morning", "midday", "pre-train", "evening"] as const;
  const TIMING_META = {
    morning:     { label: "Morning",   icon: "☀",  bg: "#fef3c7", ink: "#92400e" },
    midday:      { label: "Midday",    icon: "◐",  bg: "#dbeafe", ink: "#1e40af" },
    "pre-train": { label: "Pre-train", icon: "⚡", bg: "#dcfce7", ink: "#166534" },
    evening:     { label: "Evening",   icon: "☾",  bg: "#ede9fe", ink: "#5b21b6" },
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section style={{
          padding: "var(--section-pad-y) var(--section-pad-x) 32px",
          maxWidth: 880, margin: "0 auto", textAlign: "center",
        }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
            Shared stack
          </div>
          <h1 style={{
            ...D, fontSize: "clamp(34px, 5.5vw, 52px)", lineHeight: 1.04,
            letterSpacing: "-0.025em", margin: "0 0 16px",
          }}>
            {name}
          </h1>
          <p style={{
            fontSize: 17, color: TH.inkSoft, lineHeight: 1.6, margin: "0 auto 22px",
            maxWidth: 540,
          }}>
            Someone composed this stack on suppdoc.io. <span style={SI}>Take a look</span>, or build your own from scratch.
          </p>
          <div style={{
            display: "inline-flex", gap: 22, padding: "10px 20px",
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 999, fontSize: 13.5, fontWeight: 500,
          }}>
            <span><strong style={{ ...D, fontSize: 17, marginRight: 5 }}>{supps.length}</strong>{supps.length === 1 ? "supplement" : "supplements"}</span>
            <span style={{ color: TH.muted }}>·</span>
            <span><strong style={{ ...D, fontSize: 17, marginRight: 5 }}>${monthlyCost}</strong>/month</span>
          </div>
        </section>

        {/* Daily ritual */}
        <section style={{
          padding: "0 var(--section-pad-x) 40px",
          maxWidth: 880, margin: "0 auto",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TIMINGS.map(t => {
              const list = supps.filter(s => s.timing === t);
              if (list.length === 0) return null;
              const meta = TIMING_META[t];
              return (
                <div key={t} style={{
                  background: TH.surface, border: `1px solid ${TH.edge}`,
                  borderRadius: 18, padding: "18px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{
                      ...MM, fontSize: 10.5, padding: "3px 10px", borderRadius: 999,
                      background: meta.bg, color: meta.ink, fontWeight: 700,
                    }}>{meta.icon} {meta.label.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: TH.muted, ...MM }}>{list.length}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 10 }}>
                    {list.map(s => {
                      const p = PRODUCTS[s.id]?.[0];
                      const href = p?.productPath ? iherbProductLink(p.productPath) : iherbLink(s.iherbSearch);
                      return (
                        <div key={s.id} style={{
                          padding: "12px 14px", background: TH.bg, borderRadius: 12,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: s.hue, flexShrink: 0 }} />
                            <Link href={`/ingredients/${s.id}`} style={{ ...D, fontSize: 14.5, color: TH.ink, textDecoration: "none", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.name}
                            </Link>
                          </div>
                          <div style={{ fontSize: 11.5, color: TH.muted, marginBottom: 8 }}>
                            {s.dose} · ${s.monthlyCost}/mo
                          </div>
                          <a href={href} target="_blank" rel="noopener noreferrer sponsored" style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12, color: TH.sageDeep, fontWeight: 600,
                            textDecoration: "none",
                          }}>
                            View on iHerb
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10" /></svg>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Adopt-this-stack CTA */}
        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 880, margin: "0 auto",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${TH.ink} 0%, #0e3a63 100%)`,
            borderRadius: 22, padding: "28px 32px", color: "#fff", textAlign: "center",
          }}>
            <div style={{ ...MM, fontSize: 11, color: "#ffffff99", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
              Make it yours
            </div>
            <h2 style={{ ...D, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.15 }}>
              Adopt this stack, or remix it
            </h2>
            <p style={{ fontSize: 14.5, opacity: 0.85, margin: "0 0 22px", maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Open it in the custom builder where you can swap supplements, change brands, or audit it against your goals.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link href={`/build?s=${supps.map(s => s.id).join(",")}`} style={ctaBtn("#ffffff", TH.ink)}>
                Open in builder →
              </Link>
              <Link href="/quiz" style={ctaBtn("transparent", "#ffffff", true)}>
                Take my own quiz →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ctaBtn(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
    background: bg, color, textDecoration: "none",
    border: outline ? `1px solid ${color}55` : "none",
    display: "inline-flex", alignItems: "center", gap: 8,
  };
}
