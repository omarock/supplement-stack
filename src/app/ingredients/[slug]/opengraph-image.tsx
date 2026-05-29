import { ImageResponse } from "next/og";
import { SUPPLEMENT_DB } from "@/lib/supplements";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Supplement ingredient guide from suppdoc.io";

// Next.js 16: dynamic-route params are async (a Promise)
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === slug);
  if (!supp) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }
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
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: "linear-gradient(90deg, #5ba373 0%, #e8a04a 100%)",
        }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <svg width="44" height="44" viewBox="0 0 40 40">
            <path d="M 20 36 Q 20 24 20 12" stroke="#3f7a52" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill="#5ba373" />
            <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill="#e8a04a" />
            <circle cx="20" cy="10" r="3.5" fill="#e8a04a" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#0a2540", letterSpacing: "-0.02em", display: "flex" }}>
            suppdoc<span style={{ color: "#5ba373" }}>.io</span>
          </div>
        </div>

        {/* Category */}
        {supp.category && (
          <div style={{
            fontSize: 18, color: "#5ba373", letterSpacing: "0.2em",
            marginBottom: 16, fontWeight: 600, display: "flex",
          }}>
          {supp.category.toUpperCase().replace(/-/g, " ")}
          </div>
        )}

        {/* Ingredient name */}
        <div style={{
          fontSize: 96, lineHeight: 1.05, color: "#0a2540", fontWeight: 400,
          fontFamily: "Georgia, serif", letterSpacing: "-0.03em",
          marginBottom: 24, display: "flex",
        }}>
          {supp.name}
        </div>

        {/* Purpose */}
        <div style={{
          fontSize: 36, color: "#3c4858", fontStyle: "italic",
          marginBottom: 36, lineHeight: 1.3, display: "flex", maxWidth: 1000,
        }}>
          {supp.purpose}
        </div>

        {/* Evidence + dose pill */}
        <div style={{ display: "flex", gap: 14, marginTop: "auto" }}>
          <span style={{
            padding: "12px 24px", borderRadius: 999,
            background: supp.evidence === "very strong" ? "#dcfce7" : supp.evidence === "strong" ? "#fef3c7" : "#e0e7ff",
            color: supp.evidence === "very strong" ? "#15803d" : supp.evidence === "strong" ? "#a16207" : "#4338ca",
            fontSize: 22, fontWeight: 600, display: "flex",
          }}>
            {supp.evidence.toUpperCase()} EVIDENCE
          </span>
          <span style={{
            padding: "12px 24px", borderRadius: 999,
            background: "#0a2540", color: "#ffffff",
            fontSize: 22, fontWeight: 600, display: "flex",
          }}>
            {supp.dose}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
