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
          padding: 64,
          position: "relative",
        }}
      >
        {/* Teal-to-coral accent stripe (capsule colours) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 8,
          background: "linear-gradient(90deg, #79c6bc 0%, #f0b49e 100%)",
        }} />

        {/* Brand: tilted teal+coral capsule + SuppDoc.io wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 70 }}>
          <div style={{ width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 68, height: 32, borderRadius: 16, transform: "rotate(-35deg)", display: "flex", overflow: "hidden" }}>
              <div style={{ flex: 1, height: "100%", background: "#79c6bc" }} />
              <div style={{ width: 2, height: "100%", background: "#ffffff" }} />
              <div style={{ flex: 1, height: "100%", background: "#f0b49e" }} />
            </div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", display: "flex" }}>
            <span style={{ color: "#0f1a15" }}>Supp</span>
            <span style={{ color: "#0c7a54" }}>Doc</span>
            <span style={{ color: "#9db0a6" }}>.io</span>
          </div>
        </div>

        {/* Headline (each line is its own flex row so Satori lays out the mixed
            italic/regular run correctly instead of overlapping the spans). */}
        <div style={{
          fontSize: 78, lineHeight: 1.06, fontWeight: 400, color: "#0a2540",
          fontFamily: "Georgia, serif", letterSpacing: "-0.03em",
          marginBottom: 22,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex" }}>Evidence-Based</div>
          <div style={{ display: "flex" }}>
            <span style={{ fontStyle: "italic" }}>Personalised</span>
            <span>&nbsp;Supplement Stacks</span>
          </div>
        </div>

        {/* Subline */}
        <div style={{
          fontSize: 27, color: "#3c4858", lineHeight: 1.4, maxWidth: 880,
          marginBottom: 44, display: "flex",
        }}>
          Take the quiz and get a curated stack of 5-9 evidence-based supplements,
          tailored to your goals, body, and budget.
        </div>

        {/* Bottom strip, stats + CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 30,
          borderTop: "2px solid rgba(10,37,64,0.1)",
        }}>
          <div style={{ display: "flex", gap: 50, fontSize: 22, color: "#3c4858", fontWeight: 500 }}>
            <span>📚 200+ ingredients</span>
            <span>🌿 15 ready-made stacks</span>
            <span>⚡ Evidence-based</span>
          </div>
          <div style={{
            padding: "14px 32px", borderRadius: 999,
            background: "#0f1a15", color: "#ffffff",
            fontSize: 22, fontWeight: 600, display: "flex",
          }}>
            SuppDoc.io
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
