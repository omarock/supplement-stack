"use client";

/**
 * The one genuinely-interactive island on the homepage: the "build it yourself"
 * box (goal textarea + chips + generate). Extracted from the old all-client
 * homepage so the rest of the page can be a server component with zero
 * hydration. Markup and styles are identical to the original center card.
 */
import { useState, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { TH, FONTS, MM, D } from "@/lib/theme";

const GOAL_CHIPS = ["Sleep", "Energy", "Focus", "Stress", "Muscle Growth", "Longevity"];

const triCardCenter: CSSProperties = {
  display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit",
  borderRadius: 20, padding: 22, background: TH.surface, border: `1px solid ${TH.edge}`,
  boxShadow: "0 16px 40px -20px rgba(10,37,64,0.26)",
};
const triBtn: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  height: 50, borderRadius: 999, border: "none", cursor: "pointer",
  background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
  fontFamily: FONTS.body, fontWeight: 600, fontSize: 14.5, textDecoration: "none",
  boxShadow: `0 10px 22px -6px color-mix(in srgb, ${TH.sage} 50%, transparent)`,
};
const buylineStyle: CSSProperties = {
  ...MM, fontSize: 9, letterSpacing: "0.04em", color: TH.sageDeep, textTransform: "uppercase", margin: "14px 0 11px",
};
const chipStyle = (bg: string, fg: string): CSSProperties => ({
  ...MM, display: "inline-flex", alignItems: "center", fontSize: 9.5, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 6, background: bg, color: fg,
});
// Mirrors the header treatment of the two sibling cards in HomeClient's Hero.
const iconWrap = (bg: string, fg: string): CSSProperties => ({
  width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
  background: bg, color: fg, flexShrink: 0,
});
const stepBadge = (grad: string): CSSProperties => ({
  ...D, fontSize: 13, lineHeight: 1, width: 30, height: 30, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: grad, color: "#fff", flexShrink: 0,
  boxShadow: "0 5px 12px -4px rgba(10,37,64,0.3)",
});

export default function StackBox() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [needsGoal, setNeedsGoal] = useState(false);
  const goalRef = useRef<HTMLTextAreaElement | null>(null);

  function toggleChip(chip: string) {
    setNeedsGoal(false);
    setPicked(prev => {
      const next = prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip];
      if (goal === "" || goal === prev.join(", ")) setGoal(next.join(", "));
      return next;
    });
  }

  function generateStack() {
    const finalGoal = (goal.trim() || picked.join(", ")).trim();
    if (!finalGoal) {
      setNeedsGoal(true);
      goalRef.current?.focus();
      return;
    }
    setNeedsGoal(false);
    track("home_goal_build", { hasGoal: true, chips: picked.length });
    router.push(`/build?goal=${encodeURIComponent(finalGoal)}`);
  }

  const primaryGoal = picked.length === 1 ? picked[0].toLowerCase() : null;
  const ctaLabel = primaryGoal ? `Build my ${primaryGoal} stack` : "Build my stack";

  return (
    <div className="sd-buildcard" style={triCardCenter}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={iconWrap(`color-mix(in srgb, ${TH.amber} 16%, transparent)`, "var(--c-amber-deep)")}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--c-amber-deep)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
            <path d="M8 1.8l6 3-6 3-6-3 6-3z" /><path d="M2 8l6 3 6-3" /><path d="M2 11l6 3 6-3" />
          </svg>
        </span>
        <span style={stepBadge(`linear-gradient(180deg, ${TH.amber}, var(--c-amber-deep))`)}>02</span>
      </div>
      <span style={{ ...chipStyle(`color-mix(in srgb, ${TH.amber} 20%, transparent)`, "var(--c-amber-deep)"), alignSelf: "flex-start", marginTop: 12 }}>Build it yourself</span>
      <div style={{ marginTop: 12, background: TH.bg, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: 14 }}>
        <div style={{ ...MM, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: TH.muted, marginBottom: 8 }}>What do you want to improve?</div>
        <textarea
          ref={goalRef}
          value={goal}
          onChange={e => { setGoal(e.target.value); if (needsGoal) setNeedsGoal(false); }}
          rows={1}
          aria-invalid={needsGoal}
          aria-label="What do you want to improve?"
          placeholder="better sleep and steadier energy…"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateStack(); } }}
          style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", resize: "none", fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.4, color: TH.ink, background: "transparent", minHeight: 24 }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
          {GOAL_CHIPS.slice(0, 5).map(chip => {
            const on = picked.includes(chip);
            return (
              <button key={chip} type="button" onClick={() => toggleChip(chip)} style={{
                height: 28, padding: "0 12px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${on ? TH.sage : TH.edgeStrong}`, background: on ? TH.accentGlow : "transparent",
                color: on ? TH.sageDeep : TH.inkSoft, fontFamily: FONTS.body, fontSize: 12, fontWeight: on ? 600 : 500, transition: "all .15s",
              }}>{chip}</button>
            );
          })}
        </div>
      </div>
      {needsGoal && (
        <div role="alert" style={{ marginTop: 10, padding: "8px 11px", borderRadius: 10, background: "#fff7ed", border: "1px solid #f5d3a8", fontSize: 12, color: TH.amberDeep, textAlign: "center", lineHeight: 1.4 }}>
          Pick a goal or describe what you want, then we&apos;ll build it.
        </div>
      )}
      <div style={{ flex: 1, minHeight: 8 }} />
      <div style={{ ...buylineStyle, textAlign: "center" }}>describe it or pick a goal → generate → buy</div>
      <button type="button" onClick={generateStack} className="sd-cta" style={triBtn}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.4 4.2 4.1 1.3-4.1 1.3L8 12.5l-1.4-4.2-4.1-1.3 4.1-1.3L8 1.5z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        {ctaLabel}
      </button>
    </div>
  );
}
