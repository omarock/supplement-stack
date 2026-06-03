"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import { CONSENT_KEY as STORAGE_KEY, CONSENT_REOPEN_EVENT, notifyConsentChanged } from "@/lib/consent";

const COOKIE_NAME = "suppdoc_consent";
const COOKIE_DAYS = 180;

type Choice = "accept" | "reject" | "custom";
type Prefs = { analytics: boolean; affiliate: boolean };

function setConsentCookie(value: string) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
  // Cookie scope: top-level domain so subdomains share consent
  document.cookie = `${COOKIE_NAME}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: true, affiliate: true });
  const barRef = useRef<HTMLDivElement | null>(null);

  // Reserve space at the bottom of the page so the fixed bar never hides content
  // (e.g. the hero path cards). Cleared the moment the user decides.
  useEffect(() => {
    if (!open) { document.body.style.paddingBottom = ""; return; }
    const h = barRef.current?.offsetHeight ?? 72;
    document.body.style.paddingBottom = `${h}px`;
    return () => { document.body.style.paddingBottom = ""; };
  }, [open, customizing]);

  // Show after mount if no prior decision (avoids SSR hydration flash).
  // Also listen for the footer "Cookie preferences" link to re-open it anytime.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prior = localStorage.getItem(STORAGE_KEY);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (!prior) {
      // Delay 600ms so it doesn't compete with hero animations
      t = setTimeout(() => setOpen(true), 600);
    }
    const reopen = () => { setCustomizing(true); setOpen(true); };
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
    };
  }, []);

  function persist(choice: Choice, p: Prefs) {
    const payload = { choice, prefs: p, at: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
    setConsentCookie(choice === "reject" ? "essential" : choice === "accept" ? "all" : `${p.analytics ? "a" : ""}${p.affiliate ? "f" : ""}` || "essential");
    notifyConsentChanged();   // let the analytics gate react immediately
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      ref={barRef}
      role="dialog"
      aria-label="Cookie preferences"
      aria-modal="false"
      style={{
        position: "fixed", zIndex: 200, left: 0, right: 0, bottom: 0,
        background: TH.surface,
        borderTop: `1px solid ${TH.edge}`,
        boxShadow: "0 -10px 30px rgba(10,37,64,0.10)",
        padding: "12px var(--section-pad-x)",
        fontFamily: FONTS.body, color: TH.ink,
        animation: "sd-rise .3s cubic-bezier(.2,.7,.2,1) both",
      }}
    >
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        {!customizing ? (
          <>
            <p style={{ flex: "1 1 320px", fontSize: 13, lineHeight: 1.5, color: TH.inkSoft, margin: 0 }}>
              <span aria-hidden style={{ marginRight: 7 }}>🍪</span>
              We use essential cookies to run the site, plus optional analytics and affiliate-link cookies.{" "}
              <Link href="/cookies" style={{ color: TH.sageDeep, textDecoration: "underline" }}>Learn more about our cookie policy</Link>.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
              <button onClick={() => setCustomizing(true)} style={btnGhost()}>Customize</button>
              <button onClick={() => persist("reject", { analytics: false, affiliate: false })} style={btnSecondary()}>Reject optional</button>
              <button onClick={() => persist("accept", { analytics: true, affiliate: true })} style={btnPrimary()}>Accept all</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: TH.inkSoft, margin: "0 0 6px" }}>
              Choose which optional cookies you allow. Essential cookies are always on, they keep you signed in and remember your stack drafts.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "var(--cookie-rows)", gap: "0 28px" }}>
              <ConsentRow
                title="Analytics"
                description="Anonymized page views via Vercel Analytics so we can improve the site."
                checked={prefs.analytics}
                onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
              />
              <ConsentRow
                title="Affiliate attribution"
                description="Adds our rewards code when you click an iHerb or Amazon link. No personal data is shared."
                checked={prefs.affiliate}
                onChange={v => setPrefs(p => ({ ...p, affiliate: v }))}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={() => persist("custom", prefs)} style={btnPrimary()}>Save preferences</button>
              <button onClick={() => setCustomizing(false)} style={btnGhost()}>Back</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        :root { --cookie-rows: 1fr 1fr; }
        @media (max-width: 640px) { :root { --cookie-rows: 1fr; } }
      `}</style>
    </div>
  );
}

function ConsentRow({ title, description, checked, onChange }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "10px 0", borderTop: `1px solid ${TH.edge}`,
      cursor: "pointer",
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor: TH.sage, marginTop: 3, width: 16, height: 16 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TH.ink, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.45 }}>{description}</div>
      </div>
    </label>
  );
}

// ── Button styles ─────────────────────────────────────────────────────────
function btnPrimary(): React.CSSProperties {
  return {
    padding: "10px 18px", borderRadius: 999, border: "none",
    background: TH.ink, color: TH.surface, fontWeight: 500, fontSize: 13.5,
    cursor: "pointer", fontFamily: FONTS.body,
  };
}
function btnSecondary(): React.CSSProperties {
  return {
    padding: "10px 18px", borderRadius: 999,
    background: TH.surface, color: TH.ink,
    border: `1px solid ${TH.edge}`, fontWeight: 500, fontSize: 13.5,
    cursor: "pointer", fontFamily: FONTS.body,
  };
}
function btnGhost(): React.CSSProperties {
  return {
    padding: "10px 14px", borderRadius: 999,
    background: "transparent", color: TH.inkSoft,
    border: "none", fontWeight: 500, fontSize: 13.5,
    cursor: "pointer", fontFamily: FONTS.body,
  };
}
