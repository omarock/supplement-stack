"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";

const STORAGE_KEY = "suppdoc.cookieConsent.v1";
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

  // Show after mount if no prior decision (avoids SSR hydration flash)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prior = localStorage.getItem(STORAGE_KEY);
    if (!prior) {
      // Delay 600ms so it doesn't compete with hero animations
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function persist(choice: Choice, p: Prefs) {
    const payload = { choice, prefs: p, at: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
    setConsentCookie(choice === "reject" ? "essential" : choice === "accept" ? "all" : `${p.analytics ? "a" : ""}${p.affiliate ? "f" : ""}` || "essential");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-modal="false"
      style={{
        position: "fixed", zIndex: 200,
        left: "var(--cookie-left)", right: "var(--cookie-right)", bottom: "var(--cookie-bottom)",
        maxWidth: "var(--cookie-max)",
        background: TH.surface,
        border: `1px solid ${TH.edge}`,
        borderRadius: 18,
        boxShadow: "0 18px 50px rgba(10,37,64,0.18), 0 6px 14px rgba(10,37,64,0.06)",
        padding: 22,
        fontFamily: FONTS.body,
        color: TH.ink,
        animation: "sd-rise .35s cubic-bezier(.2,.7,.2,1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span aria-hidden style={{ fontSize: 22 }}>🍪</span>
        <strong style={{ fontFamily: FONTS.display, fontSize: 16, letterSpacing: "-0.01em" }}>
          Cookies on suppdoc.io
        </strong>
      </div>

      {!customizing ? (
        <>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: TH.inkSoft, margin: "0 0 14px" }}>
            We use essential cookies to run the site, plus optional cookies for analytics and our retailer affiliate links (so we earn a small commission at no cost to you).{" "}
            <Link href="/cookies" style={{ color: TH.sageDeep, textDecoration: "underline" }}>Learn more</Link>.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button onClick={() => persist("accept", { analytics: true, affiliate: true })}
              style={btnPrimary()}>
              Accept all
            </button>
            <button onClick={() => persist("reject", { analytics: false, affiliate: false })}
              style={btnSecondary()}>
              Reject optional
            </button>
            <button onClick={() => setCustomizing(true)}
              style={btnGhost()}>
              Customize
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: TH.inkSoft, margin: "0 0 14px" }}>
            Choose which optional cookies you allow. Essential cookies are always on — they keep you signed in and remember your stack drafts.
          </p>

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

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={() => persist("custom", prefs)} style={btnPrimary()}>
              Save preferences
            </button>
            <button onClick={() => setCustomizing(false)} style={btnGhost()}>
              Back
            </button>
          </div>
        </>
      )}

      <style>{`
        :root {
          --cookie-left: auto;
          --cookie-right: 22px;
          --cookie-bottom: 22px;
          --cookie-max: 420px;
        }
        @media (max-width: 640px) {
          :root {
            --cookie-left: 12px;
            --cookie-right: 12px;
            --cookie-bottom: 12px;
            --cookie-max: none;
          }
        }
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
