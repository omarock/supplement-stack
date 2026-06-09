// Server component (static). Shows a personal founder card when FOUNDER is set,
// otherwise an honest brand-voice mission (no invented person, no stock photo).
import { TH, FONTS, D, SI, MM } from "@/lib/theme";
import { FOUNDER } from "@/lib/social-proof";

function Sprout({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }} aria-hidden>
      <path d="M 20 36 Q 20 24 20 12" stroke={TH.sageDeep} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill={TH.sage} />
      <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill={TH.amber} />
      <circle cx="20" cy="10" r="3.4" fill={TH.amber} />
    </svg>
  );
}

const MISSION =
  "The supplement aisle runs on hype, house brands, and influencer kickbacks. We built SuppDoc as the second opinion we wanted for ourselves: every pick graded on the actual research, linked to its source, and matched to products we don't make and earn nothing from selling. When the evidence says a supplement isn't worth it, we say so. That honesty is the whole company.";

export default function FounderNote() {
  const f = FOUNDER;
  const note = f?.note ?? MISSION;
  const byline = f?.name ?? "The SuppDoc team";
  const role = f?.title ?? "Evidence over hype";

  return (
    <section style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div className="sd-reveal" style={{
        maxWidth: 820, margin: "0 auto",
        background: `linear-gradient(135deg, color-mix(in srgb, ${TH.sage} 7%, ${TH.surface}), color-mix(in srgb, ${TH.amber} 6%, ${TH.surface}))`,
        border: `1px solid ${TH.edge}`, borderRadius: 26, padding: "44px clamp(24px, 5vw, 56px)",
        boxShadow: `0 26px 60px -34px color-mix(in srgb, ${TH.ink} 32%, transparent)`,
      }}>
        <div style={{ ...MM, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: TH.sageDeep, marginBottom: 18 }}>
          Why we built suppdoc
        </div>

        <p style={{
          ...SI, fontSize: "clamp(20px, 2.6vw, 27px)", lineHeight: 1.45, color: TH.ink, margin: 0,
          letterSpacing: "-0.01em",
        }}>
          {note}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30 }}>
          {f?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.photoUrl} alt={byline} width={52} height={52} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `1px solid ${TH.edge}` }} />
          ) : (
            <span style={{
              width: 52, height: 52, borderRadius: "50%", background: TH.surface,
              border: `1px solid ${TH.edge}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sprout />
            </span>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ ...D, fontSize: 16, color: TH.ink }}>
              {byline}
            </span>
            {f?.url ? (
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: TH.sageDeep, textDecoration: "none" }}>{role} →</a>
            ) : (
              <span style={{ fontSize: 13, color: TH.inkSoft, fontFamily: FONTS.body }}>{role}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
