"use client";

import { useState } from "react";
import { trackEmailSignup } from "@/lib/track";
import { track } from "@/lib/analytics";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

/**
 * Reusable email capture, placed at the result moment of each tool. Not a hard
 * gate (the free value is already shown); it offers to email the result plus the
 * weekly evidence brief, which is the on-brand way to grow the list for a
 * trust-first health product. Stores into email_signups with a per-tool source.
 */
export default function EmailCapture({
  source,
  headline = "Want this emailed to you?",
  sub = "Get your results plus a short weekly evidence brief. No spam, unsubscribe anytime.",
  cta = "Email me this",
  tone = "light",
}: {
  source: string;
  headline?: string;
  sub?: string;
  cta?: string;
  tone?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dark = tone === "dark";
  const cardBg = dark ? TH.ink : TH.surface;
  const fg = dark ? "#fff" : TH.ink;
  const fgSoft = dark ? "rgba(255,255,255,0.82)" : TH.inkSoft;

  async function submit() {
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) { setErr("Please enter a valid email."); return; }
    setBusy(true); setErr(null);
    try { await trackEmailSignup(e, source); track("email_capture", { source }); } catch { /* non-blocking */ }
    finally { setBusy(false); setDone(true); }
  }

  return (
    <div style={{
      background: cardBg, border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : TH.edge}`,
      borderRadius: 18, padding: "22px 22px", margin: "8px 0",
      boxShadow: dark ? "0 16px 40px -20px rgba(10,37,64,0.5)" : "none",
    }}>
      {done ? (
        <div>
          <div style={{ ...D, fontSize: 17, color: fg, marginBottom: 4 }}>You&apos;re in 🎉</div>
          <div style={{ fontSize: 14, color: fgSoft, lineHeight: 1.55 }}>Check your inbox. We&apos;ll send your results and the weekly brief from hello@suppdoc.io.</div>
        </div>
      ) : (
        <>
          <div style={{ ...MM, fontSize: 10.5, color: dark ? TH.amber : TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Free brief</div>
          <div style={{ ...D, fontSize: 18, color: fg, letterSpacing: "-0.01em", marginBottom: 4 }}>{headline}</div>
          <div style={{ fontSize: 14, color: fgSoft, lineHeight: 1.55, marginBottom: 14, maxWidth: 520 }}>{sub}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 520 }}>
            <input
              type="email" inputMode="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit(); }}
              placeholder="you@email.com"
              aria-label="Your email"
              style={{
                flex: "1 1 220px", minWidth: 180, padding: "13px 15px", borderRadius: 12,
                border: dark ? "none" : `1px solid ${TH.edgeStrong}`, fontSize: 16,
                fontFamily: FONTS.body, color: TH.ink, background: "#fff",
              }}
            />
            <button onClick={submit} disabled={busy} style={{
              padding: "13px 22px", borderRadius: 12, border: "none", cursor: busy ? "wait" : "pointer",
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", ...D, fontWeight: 600, fontSize: 15,
            }}>{busy ? "…" : cta}</button>
          </div>
          {err && <div role="alert" style={{ marginTop: 9, fontSize: 12.5, color: dark ? TH.amber : "#b91c1c" }}>{err}</div>}
        </>
      )}
    </div>
  );
}
