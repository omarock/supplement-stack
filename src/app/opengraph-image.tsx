import { ImageResponse } from "next/og";

// Site-wide default Open Graph image (for / and any page that doesn't override).
// Renders as a 1200x630 image, Twitter/LinkedIn/Facebook standard.

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "suppdoc.io, Personalised, Evidence-Based Supplement Stacks";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #f6f5f1 0%, #ede9d8 100%)",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Sage accent stripe top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 8,
          background: "linear-gradient(90deg, #5ba373 0%, #e8a04a 100%)",
        }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 70 }}>
          {/* Sprout SVG inline */}
          <svg width="60" height="60" viewBox="0 0 40 40" style={{ display: "block" }}>
            <path d="M 20 36 Q 20 24 20 12" stroke="#3f7a52" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill="#5ba373" />
            <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill="#e8a04a" />
            <circle cx="20" cy="10" r="4" fill="#e8a04a" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#0a2540", letterSpacing: "-0.02em", display: "flex" }}>
            suppdoc<span style={{ color: "#5ba373" }}>.io</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 88, lineHeight: 1.05, fontWeight: 400, color: "#0a2540",
          fontFamily: "Georgia, serif", letterSpacing: "-0.03em",
          marginBottom: 28,
          display: "flex", flexDirection: "column",
        }}>
          <span>Evidence-Based</span>
          <span><i style={{ color: "#0a2540" }}>Personalised</i> Supplement Stacks</span>
        </div>

        {/* Subline */}
        <div style={{
          fontSize: 28, color: "#3c4858", lineHeight: 1.4, maxWidth: 900,
          marginBottom: 50,
        }}>
          Take the quiz. Get a curated stack of 5-9 evidence-based supplements
          tailored to your goals, body, and budget. From top-rated, third-party-tested brands.
        </div>

        {/* Bottom strip, stats + CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 30,
          borderTop: "2px solid rgba(10,37,64,0.1)",
        }}>
          <div style={{ display: "flex", gap: 50, fontSize: 22, color: "#3c4858", fontWeight: 500 }}>
            <span>📚 150+ ingredients</span>
            <span>🌿 15 ready-made stacks</span>
            <span>⚡ Evidence-based</span>
          </div>
          <div style={{
            padding: "14px 32px", borderRadius: 999,
            background: "#0a2540", color: "#ffffff",
            fontSize: 22, fontWeight: 600, display: "flex",
          }}>
            suppdoc.io
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
