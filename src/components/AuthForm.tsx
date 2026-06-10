"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import SuppdocLogo from "@/components/SuppdocLogo";
import { useT } from "@/components/I18nProvider";
import { TH, FONTS } from "@/lib/theme";

type Mode = "signin" | "signup";

// Where to land after auth: honor a safe ?redirect= param, else the account page.
function nextPath(): string {
  if (typeof window === "undefined") return "/me";
  const r = new URLSearchParams(window.location.search).get("redirect");
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/me";
}
function callbackUrl(): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="sdauth-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const { t, lh } = useT();
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null); // neutral info (e.g. "please sign in")
  const [sent, setSent] = useState<string | null>(null); // email we sent a link to

  const configured = isSupabaseConfigured();

  // Trust signals shown on the brand panel (no "AI" wording, premium framing).
  const TRUST: string[] = [t("auth.trust1"), t("auth.trust2"), t("auth.trust3"), t("auth.trust4")];

  // Surface any ?error=... coming back from /auth/callback as friendly copy.
  // "please_sign_in" is a normal gated-route redirect, shown as a neutral notice,
  // not a scary error. Unknown codes get a generic message, never the raw token.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return;
    if (err === "please_sign_in") {
      setNotice(t("auth.pleaseSignIn"));
    } else {
      const map: Record<string, string> = {
        missing_code: t("auth.linkIncomplete"),
        expired: t("auth.linkExpired"),
        supabase_not_configured: t("auth.unavailable"),
        auth_not_configured: t("auth.unavailable"),
      };
      setError(map[err] ?? t("auth.signInFailed"));
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function submitEmail() {
    setError(null);
    if (!email || !email.includes("@")) {
      setError(t("auth.invalidEmail")); return;
    }
    if (mode === "signup" && !agree) {
      setError(t("auth.acceptTerms")); return;
    }

    setBusy(true);
    const supa = getSupabase();
    if (supa) {
      const { error } = await supa.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl() },
      });
      if (error) setError(error.message);
      else setSent(email);
    } else {
      localStorage.setItem("phylaUserEmail", email);
      setSent(email);
    }
    setBusy(false);
  }

  async function handleGoogle() {
    setError(null);
    const supa = getSupabase();
    if (!supa) {
      setError(t("auth.googleNeedsConfig"));
      return;
    }
    setBusy(true);
    const { error } = await supa.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) { setError(error.message); setBusy(false); }
    // OAuth redirects away, so no setBusy(false) on success.
  }

  const eyebrow = mode === "signin" ? t("auth.signinEyebrow") : t("auth.signupEyebrow");
  const heading = mode === "signin" ? t("auth.signinHeading") : t("auth.signupHeading");
  const sub = mode === "signin" ? t("auth.signinSub") : t("auth.signupSub");

  return (
    <div className="sdauth-root">
      <style>{CSS}</style>

      <div className="sdauth-grid">
        {/* ===== Brand / trust panel (desktop only) ===== */}
        <aside className="sdauth-brand" aria-hidden="true">
          <div className="sdauth-brand-glow" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <SuppdocLogo size={26} onDark asLink={false} />
          </div>

          <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
            <h2 style={{
              fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400,
              fontSize: 40, lineHeight: 1.1, color: "#ffffff", margin: 0, letterSpacing: "-0.02em",
            }}>
              {t("auth.brandH2")}
            </h2>
            <p style={{
              fontFamily: FONTS.body, fontSize: 15.5, lineHeight: 1.6,
              color: "rgba(255,255,255,0.72)", marginTop: 18, marginBottom: 0,
            }}>
              {t("auth.brandSub")}
            </p>
          </div>

          <ul style={{
            position: "relative", zIndex: 1, listStyle: "none", padding: 0, margin: 0,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {TRUST.map(t => (
              <li key={t} style={{
                display: "flex", alignItems: "flex-start", gap: 11,
                fontFamily: FONTS.body, fontSize: 14.5, color: "rgba(255,255,255,0.92)", lineHeight: 1.4,
              }}>
                <Check />
                {t}
              </li>
            ))}
          </ul>
        </aside>

        {/* ===== Form column ===== */}
        <main className="sdauth-form-col">
          <div className="sdauth-logo-mobile">
            <SuppdocLogo size={26} href={lh("/")} />
          </div>

          <div className="sdauth-card sdauth-fade">
            {!sent ? (
              <>
                {notice && (
                  <div className="sdauth-notice" role="status" aria-live="polite">{notice}</div>
                )}
                <div style={{ marginBottom: 26 }}>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em",
                    color: TH.sage, marginBottom: 12,
                  }}>{eyebrow}</div>
                  <h1 style={{
                    fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400,
                    fontSize: 38, lineHeight: 1.05, color: TH.ink, margin: 0, letterSpacing: "-0.025em",
                  }}>{heading}</h1>
                  <p style={{
                    fontFamily: FONTS.body, color: TH.inkSoft, fontSize: 15, lineHeight: 1.55, marginTop: 12, marginBottom: 0,
                  }}>{sub}</p>
                </div>

                {/* Google */}
                <button
                  type="button"
                  className="sdauth-oauth"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M16.51 8.18c0-.555-.05-1.09-.14-1.6H8.665v3.04h4.4c-.19 1.025-.764 1.895-1.625 2.475v2.06h2.63c1.54-1.42 2.44-3.51 2.44-5.975z" fill="#4285F4"/>
                    <path d="M8.665 16.5c2.2 0 4.05-.72 5.4-1.965l-2.63-2.06c-.73.49-1.66.78-2.77.78-2.13 0-3.93-1.44-4.575-3.37H1.37v2.13C2.715 14.66 5.475 16.5 8.665 16.5z" fill="#34A853"/>
                    <path d="M4.09 9.885c-.16-.49-.255-1.015-.255-1.555s.095-1.065.255-1.555V4.645H1.37C.83 5.72.52 6.92.52 8.165s.31 2.445.85 3.52L4.09 9.885z" fill="#FBBC05"/>
                    <path d="M8.665 3.74c1.205 0 2.285.415 3.135 1.225l2.34-2.34C12.71 1.275 10.86.5 8.665.5 5.475.5 2.715 2.34 1.37 4.645l2.72 2.13c.645-1.93 2.445-3.035 4.575-3.035z" fill="#EA4335"/>
                  </svg>
                  {t("auth.continueGoogle")}
                </button>

                <div className="sdauth-or">
                  <span />
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: TH.muted, letterSpacing: "0.08em" }}>{t("auth.or")}</span>
                  <span />
                </div>

                {/* Email magic link */}
                <form onSubmit={(e) => { e.preventDefault(); submitEmail(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label htmlFor="auth-email" style={{
                      fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: TH.ink, display: "block", marginBottom: 8,
                    }}>{t("auth.emailLabel")}</label>
                    <input
                      id="auth-email"
                      className="sdauth-input"
                      type="email" autoComplete="email" required inputMode="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={busy}
                    />
                  </div>

                  {mode === "signup" && (
                    <label style={{
                      display: "flex", alignItems: "flex-start", gap: 10, fontFamily: FONTS.body,
                      fontSize: 13, color: TH.inkSoft, lineHeight: 1.5, cursor: "pointer",
                    }}>
                      <input
                        type="checkbox" checked={agree}
                        onChange={e => setAgree(e.target.checked)}
                        style={{ marginTop: 2, width: 16, height: 16, accentColor: TH.sage, flexShrink: 0 }}
                      />
                      <span>
                        {t("auth.agreePre")}{" "}<Link href={lh("/terms")} className="sdauth-link">{t("auth.termsLink")}</Link>
                        {" "}{t("auth.agreeMid")}{" "}
                        <Link href={lh("/privacy")} className="sdauth-link">{t("auth.privacyLink")}</Link>{t("auth.agreePost")}
                      </span>
                    </label>
                  )}

                  <button type="submit" className="sdauth-primary" disabled={busy}>
                    {busy && <Spinner color="#ffffff" />}
                    {busy ? t("auth.sendingLink") : (mode === "signin" ? t("auth.signinSubmit") : t("auth.signupSubmit"))}
                  </button>
                  <p style={{
                    fontFamily: FONTS.body, fontSize: 12.5, color: TH.muted, textAlign: "center", margin: "2px 0 0", lineHeight: 1.5,
                  }}>
                    {t("auth.magicLinkNote")}
                  </p>
                </form>

                {error && (
                  <div className="sdauth-alert" role="alert" aria-live="assertive">{error}</div>
                )}

                <p style={{
                  fontFamily: FONTS.body, marginTop: 24, textAlign: "center", fontSize: 14, color: TH.inkSoft,
                }}>
                  {mode === "signin" ? (
                    <>{t("auth.signinSwitchPre")} <Link href={lh("/signup")} className="sdauth-link" style={{ fontWeight: 600 }}>{t("auth.signinSwitchLink")}</Link></>
                  ) : (
                    <>{t("auth.signupSwitchPre")} <Link href={lh("/signin")} className="sdauth-link" style={{ fontWeight: 600 }}>{t("auth.signupSwitchLink")}</Link></>
                  )}
                </p>

                {!configured && (
                  <div style={{
                    fontFamily: FONTS.body, marginTop: 26, padding: "14px 16px",
                    background: "rgba(232,160,74,0.08)", border: "1px solid rgba(232,160,74,0.25)",
                    borderRadius: 12, fontSize: 12, color: TH.amberDeep, lineHeight: 1.5,
                  }}>
                    <strong style={{ display: "block", marginBottom: 3 }}>{t("auth.demoTitle")}</strong>
                    {t("auth.demoBody")}
                  </div>
                )}
              </>
            ) : (
              /* ===== Success: link sent ===== */
              <div className="sdauth-fade" style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{
                  width: 58, height: 58, borderRadius: 999, margin: "0 auto 20px",
                  background: TH.accentGlow, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={TH.sageDeep} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3.5 7l8.5 6 8.5-6" />
                  </svg>
                </div>
                <h1 style={{
                  fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400,
                  fontSize: 34, lineHeight: 1.1, color: TH.ink, margin: 0, letterSpacing: "-0.02em",
                }}>{t("auth.checkInbox")}</h1>
                <p style={{
                  fontFamily: FONTS.body, color: TH.inkSoft, fontSize: 15, lineHeight: 1.6, marginTop: 12,
                }}>
                  {t("auth.sentTo")}<br />
                  <strong style={{ color: TH.ink }}>{sent}</strong>
                </p>
                <p style={{ fontFamily: FONTS.body, color: TH.muted, fontSize: 13, lineHeight: 1.6, marginTop: 14 }}>
                  {t("auth.sentHint")}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                  <button type="button" className="sdauth-primary" onClick={submitEmail} disabled={busy}>
                    {busy && <Spinner color="#ffffff" />}
                    {busy ? t("auth.resending") : t("auth.resend")}
                  </button>
                  <button
                    type="button"
                    className="sdauth-ghost"
                    onClick={() => { setSent(null); setError(null); }}
                  >
                    {t("auth.differentEmail")}
                  </button>
                </div>
                {error && <div className="sdauth-alert" role="alert" aria-live="assertive">{error}</div>}
              </div>
            )}
          </div>

          {/* Compact trust strip (mobile only) */}
          <ul className="sdauth-trust-mobile" aria-hidden="true">
            {TRUST.slice(0, 3).map(t => (
              <li key={t}><Check />{t}</li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}

const CSS = `
.sdauth-root { min-height: 100vh; width: 100%; background: ${TH.bg}; color: ${TH.ink}; }
.sdauth-grid { display: grid; grid-template-columns: 1fr; min-height: 100vh; }

/* Form column */
.sdauth-form-col {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 22px 56px; gap: 20px;
}
.sdauth-logo-mobile { width: 100%; max-width: 420px; display: flex; }
.sdauth-card {
  width: 100%; max-width: 420px; background: ${TH.surface};
  border: 1px solid ${TH.edge}; border-radius: 22px;
  padding: 34px 30px; box-sizing: border-box;
  box-shadow: 0 24px 60px -28px rgba(10,37,64,0.30), 0 2px 8px -4px rgba(10,37,64,0.08);
}

/* Buttons */
.sdauth-oauth {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px 18px; border-radius: 13px; background: ${TH.surface};
  border: 1.5px solid ${TH.edgeStrong}; color: ${TH.ink};
  font-family: ${FONTS.body}; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
}
.sdauth-oauth:hover:not(:disabled) {
  border-color: ${TH.ink}; transform: translateY(-1px);
  box-shadow: 0 8px 22px -10px rgba(10,37,64,0.28);
}
.sdauth-primary {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
  padding: 15px 18px; border-radius: 13px; background: ${TH.inkBg}; color: #fff;
  border: none; cursor: pointer; font-family: ${FONTS.body}; font-size: 15px; font-weight: 600;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  box-shadow: 0 6px 18px -8px color-mix(in srgb, ${TH.ink} 50%, transparent);
}
.sdauth-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 10px 26px -10px color-mix(in srgb, ${TH.ink} 60%, transparent); }
.sdauth-ghost {
  width: 100%; padding: 12px 18px; border-radius: 13px; background: transparent;
  border: 1px solid ${TH.edge}; color: ${TH.inkSoft}; cursor: pointer;
  font-family: ${FONTS.body}; font-size: 14px; font-weight: 500; transition: background .15s ease;
}
.sdauth-ghost:hover { background: ${TH.bg}; }
.sdauth-oauth:disabled, .sdauth-primary:disabled { opacity: .65; cursor: default; }

/* Input */
.sdauth-input {
  width: 100%; padding: 14px 16px; border-radius: 13px; font-size: 16px;
  border: 1.5px solid ${TH.edgeStrong}; background: ${TH.surface}; color: ${TH.ink};
  outline: none; font-family: ${FONTS.body}; box-sizing: border-box;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.sdauth-input:focus { border-color: ${TH.sage}; box-shadow: 0 0 0 3px rgba(91,163,115,0.18); }
.sdauth-input::placeholder { color: ${TH.mutedDim}; }

/* Divider */
.sdauth-or { display: flex; align-items: center; gap: 14px; margin: 22px 0; }
.sdauth-or > span:first-child, .sdauth-or > span:last-child { flex: 1; height: 1px; background: ${TH.edge}; }

/* Links */
.sdauth-link { color: ${TH.sageDeep}; text-decoration: none; }
.sdauth-link:hover { text-decoration: underline; }

/* Alert */
.sdauth-alert {
  margin-top: 18px; padding: 12px 15px; background: #fef2f2; border: 1px solid #fca5a5;
  border-radius: 11px; font-family: ${FONTS.body}; font-size: 13px; color: #991b1b; line-height: 1.45;
}
.sdauth-notice {
  margin-bottom: 18px; padding: 12px 15px; background: ${TH.accentGlow}; border: 1px solid color-mix(in srgb, ${TH.sage} 33%, transparent);
  border-radius: 11px; font-family: ${FONTS.body}; font-size: 13.5px; color: ${TH.sageDeep}; line-height: 1.45;
}

/* Mobile trust strip */
.sdauth-trust-mobile {
  list-style: none; padding: 0; margin: 0; width: 100%; max-width: 420px;
  display: flex; flex-direction: column; gap: 9px;
}
.sdauth-trust-mobile li {
  display: flex; align-items: flex-start; gap: 9px;
  font-family: ${FONTS.body}; font-size: 13px; color: ${TH.inkSoft}; line-height: 1.4;
}

/* Brand panel (hidden on mobile) */
.sdauth-brand { display: none; }

.sdauth-spin { animation: sdauth-rotate .8s linear infinite; }
@keyframes sdauth-rotate { to { transform: rotate(360deg); } }
.sdauth-fade { animation: sdauth-fade .35s ease-out; }
@keyframes sdauth-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ===== Desktop split layout ===== */
@media (min-width: 940px) {
  .sdauth-grid { grid-template-columns: 1.05fr 1fr; }
  .sdauth-logo-mobile, .sdauth-trust-mobile { display: none; }
  .sdauth-form-col { padding: 48px; }
  .sdauth-brand {
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 56px 56px 64px; gap: 40px;
    background: linear-gradient(165deg, #0d2c4d 0%, #071a30 100%);
  }
  .sdauth-brand-glow {
    position: absolute; top: -120px; right: -120px; width: 420px; height: 420px; border-radius: 999px;
    background: radial-gradient(circle, rgba(91,163,115,0.30) 0%, rgba(91,163,115,0) 70%);
    pointer-events: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sdauth-spin, .sdauth-fade { animation: none !important; }
  .sdauth-oauth, .sdauth-primary, .sdauth-input { transition: none !important; }
  .sdauth-oauth:hover, .sdauth-primary:hover { transform: none !important; }
}
`;
