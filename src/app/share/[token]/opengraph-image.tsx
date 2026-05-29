import { ImageResponse } from "next/og";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import { decodeShareToken } from "@/lib/share";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Shared stack on suppdoc.io";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = decodeShareToken(token);

  // Fallback (invalid token): render a generic share card so link previews don't break
  if (!payload) {
    return new ImageResponse(<GenericCard />, size);
  }

  const supps = payload.ids
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s));
  const name = payload.name?.trim() || "Custom Stack";
  const cost = supps.reduce((sum, s) => sum + s.monthlyCost, 0);
  const top = supps.slice(0, 7);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #f6f5f1 0%, #e8f0e3 100%)",
          padding: 64,
          position: "relative",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: "linear-gradient(90deg, #5ba373 0%, #e8a04a 100%)",
        }} />

        {/* Brand strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <svg width="44" height="44" viewBox="0 0 40 40" style={{ display: "block" }}>
            <path d="M 20 36 Q 20 24 20 12" stroke="#3f7a52" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill="#5ba373" />
            <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill="#e8a04a" />
            <circle cx="20" cy="10" r="4" fill="#e8a04a" />
          </svg>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0a2540", letterSpacing: "-0.01em", display: "flex" }}>
            suppdoc<span style={{ color: "#5ba373" }}>.io</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: 14, color: "#3f7a52", fontWeight: 600, letterSpacing: "0.1em",
            background: "#dcfce7", padding: "6px 14px", borderRadius: 999,
            textTransform: "uppercase", display: "flex",
          }}>
            Shared stack
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontSize: 76, lineHeight: 1.0, fontWeight: 700, color: "#0a2540",
          letterSpacing: "-0.03em", marginBottom: 30,
          maxWidth: 1000,
          display: "flex",
        }}>
          {name}
        </div>

        {/* Supplement list */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10,
          marginBottom: 36, maxWidth: 1100,
        }}>
          {top.map(s => (
            <div key={s.id} style={{
              padding: "10px 18px",
              background: "rgba(10,37,64,0.06)",
              border: "1px solid rgba(10,37,64,0.1)",
              borderRadius: 999,
              fontSize: 22, color: "#0a2540", fontWeight: 500,
              display: "flex",
            }}>
              {s.name.split(" (")[0]}
            </div>
          ))}
          {supps.length > 7 && (
            <div style={{
              padding: "10px 18px",
              background: "#0a2540",
              borderRadius: 999,
              fontSize: 22, color: "#fff", fontWeight: 600,
              display: "flex",
            }}>
              +{supps.length - 7} more
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 26, borderTop: "2px solid rgba(10,37,64,0.1)",
        }}>
          <div style={{ display: "flex", gap: 40, fontSize: 22, color: "#3c4858", fontWeight: 500 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "#0a2540" }}>{supps.length}</span>
              <span>supplement{supps.length === 1 ? "" : "s"}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "#0a2540" }}>${cost}</span>
              <span>/ month</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#5ba373" }}>✓</span>
              <span>Evidence-led</span>
            </div>
          </div>
          <div style={{
            padding: "14px 26px", borderRadius: 999,
            background: "#0a2540", color: "#fff",
            fontSize: 20, fontWeight: 600,
            display: "flex",
          }}>
            Open on suppdoc.io →
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function GenericCard() {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      background: "linear-gradient(135deg, #f6f5f1 0%, #ede9d8 100%)",
      fontFamily: '"Inter", sans-serif',
      padding: 80,
    }}>
      <div style={{ fontSize: 40, fontWeight: 700, color: "#0a2540", marginBottom: 12, display: "flex" }}>
        suppdoc<span style={{ color: "#5ba373" }}>.io</span>
      </div>
      <div style={{ fontSize: 56, fontWeight: 700, color: "#0a2540", letterSpacing: "-0.02em", textAlign: "center", display: "flex" }}>
        A personalised supplement stack
      </div>
    </div>
  );
}
