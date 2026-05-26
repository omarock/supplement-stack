import { ImageResponse } from "next/og";
import { getStack, getStackSupplements } from "@/lib/stacks";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pre-made supplement stack from suppdoc.io";

export default async function Image({ params }: { params: { slug: string } }) {
  const stack = getStack(params.slug);
  if (!stack) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }
  const supps = getStackSupplements(stack);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: stack.coverBg,
          color: stack.coverInk,
          padding: 80,
          position: "relative",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40, opacity: 0.95 }}>
          <svg width="42" height="42" viewBox="0 0 40 40">
            <path d="M 20 36 Q 20 24 20 12" stroke={stack.coverInk} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill={stack.coverInk} />
            <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill={stack.coverInk} />
            <circle cx="20" cy="10" r="3.5" fill={stack.coverInk} />
          </svg>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", display: "flex" }}>suppdoc.io</div>
        </div>

        {/* Category */}
        <div style={{
          fontSize: 22, opacity: 0.8, letterSpacing: "0.2em", marginBottom: 18,
          fontWeight: 600, display: "flex",
        }}>
          {stack.category.toUpperCase()} STACK
        </div>

        {/* Big glyph + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 32 }}>
          <div style={{ fontSize: 180, lineHeight: 1, display: "flex" }}>{stack.coverGlyph}</div>
          <div style={{
            fontSize: 78, lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em",
            fontFamily: "Georgia, serif", display: "flex", flexDirection: "column",
            flex: 1,
          }}>
            <span>{stack.name.replace("The ", "")}</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 32, opacity: 0.92, lineHeight: 1.3, maxWidth: 1000,
          marginBottom: 40, fontStyle: "italic", display: "flex",
        }}>
          “{stack.tagline}”
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 60, marginTop: "auto",
          fontSize: 24, opacity: 0.9, fontWeight: 500,
        }}>
          <span>💊 {supps.length} supplements</span>
          <span>📅 {stack.expectedTimeline.split(".")[0]}</span>
          <span>💰 {stack.monthlyCostRange}/mo</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
