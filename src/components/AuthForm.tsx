"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import SuppdocLogo from "@/components/SuppdocLogo";

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageGlow: "rgba(91,163,115,0.12)",
  burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

type Mode = "signin" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  // Surface any ?error=... query param coming back from /auth/callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setError(`Sign-in failed: ${decodeURIComponent(err)}`);
      // Clean the URL so the message doesn't persist after the user retries
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email."); return;
    }
    if (mode === "signup" && !agree) {
      setError("Please accept the terms to continue."); return;
    }

    setBusy(true);

    const supa = getSupabase();
    if (supa) {
      // Real Supabase magic-link flow
      const { error } = await supa.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else setSuccess(`Check your inbox, we sent a sign-in link to ${email}.`);
    } else {
      // Demo mode, just store email locally
      localStorage.setItem("phylaUserEmail", email);
      setSuccess(`Saved! Once Supabase is configured, real email links will send. For now, you're "signed in" locally.`);
    }

    setBusy(false);
  }

  async function handleGoogle() {
    setError(null); setSuccess(null);
    const supa = getSupabase();
    if (!supa) {
      setError("Google sign-in needs Supabase + Google OAuth configured first. See setup notes below.");
      return;
    }
    setBusy(true);
    const { error } = await supa.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setBusy(false); }
    // OAuth redirects, so no need to setBusy(false) on success.
  }

  const headerText = mode === "signin" ? "Welcome back." : "Begin your ritual.";
  const subText = mode === "signin"
    ? "Sign in to revisit your stack or take a fresh quiz."
    : "Save your stack, track your progress, and get personalised picks.";

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px var(--nav-pad-x)", borderBottom: `1px solid ${th.line}`,
      }}>
        <SuppdocLogo size={22} />
      </div>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Heading */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 14 }}>
              {mode === "signin" ? "— SIGN IN —" : "— CREATE ACCOUNT —"}
            </div>
            <h1 style={{ ...S, fontSize: 44, color: th.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1 }}>
              {headerText}
            </h1>
            <p style={{ color: th.inkSoft, fontSize: 15, marginTop: 12, lineHeight: 1.5 }}>
              {subText}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={busy}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 18px", borderRadius: 12,
              background: th.paper, border: `1.5px solid ${th.line}`,
              fontSize: 15, fontWeight: 500, color: th.ink,
              cursor: busy ? "default" : "pointer",
              transition: "all .2s",
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.51 8.18c0-.555-.05-1.09-.14-1.6H8.665v3.04h4.4c-.19 1.025-.764 1.895-1.625 2.475v2.06h2.63c1.54-1.42 2.44-3.51 2.44-5.975z" fill="#4285F4"/>
              <path d="M8.665 16.5c2.2 0 4.05-.72 5.4-1.965l-2.63-2.06c-.73.49-1.66.78-2.77.78-2.13 0-3.93-1.44-4.575-3.37H1.37v2.13C2.715 14.66 5.475 16.5 8.665 16.5z" fill="#34A853"/>
              <path d="M4.09 9.885c-.16-.49-.255-1.015-.255-1.555s.095-1.065.255-1.555V4.645H1.37C.83 5.72.52 6.92.52 8.165s.31 2.445.85 3.52L4.09 9.885z" fill="#FBBC05"/>
              <path d="M8.665 3.74c1.205 0 2.285.415 3.135 1.225l2.34-2.34C12.71 1.275 10.86.5 8.665.5 5.475.5 2.715 2.34 1.37 4.645l2.72 2.13c.645-1.93 2.445-3.035 4.575-3.035z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* OR */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            margin: "24px 0", color: th.inkMute, fontSize: 12, ...MM,
          }}>
            <div style={{ flex: 1, height: 1, background: th.line }} />
            OR
            <div style={{ flex: 1, height: 1, background: th.line }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: th.ink, display: "block", marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email" autoComplete="email" required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={busy}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
                  border: `1.5px solid ${th.line}`, background: th.paper, color: th.ink,
                  outline: "none", fontFamily: '"Inter", system-ui, sans-serif',
                  boxSizing: "border-box",
                }}
              />
            </div>

            {mode === "signup" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: th.inkSoft, lineHeight: 1.5, cursor: "pointer" }}>
                <input
                  type="checkbox" checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  style={{ marginTop: 3, accentColor: th.sage }}
                />
                <span>
                  I agree to the <Link href="/terms" style={{ color: th.sage }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" style={{ color: th.sage }}>Privacy Policy</Link>.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%", padding: "15px 18px", borderRadius: 12,
                background: th.burgundy, color: "#ffffff",
                border: "none", cursor: busy ? "default" : "pointer",
                fontSize: 15, fontWeight: 500,
                fontFamily: '"Inter", system-ui, sans-serif',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Sending..." : (mode === "signin" ? "Continue with email" : "Create account")}
            </button>
          </form>

          {/* Error / success */}
          {error && (
            <div style={{
              marginTop: 18, padding: "12px 16px",
              background: "#fee2e2", border: "1px solid #fca5a5",
              borderRadius: 10, fontSize: 13, color: "#991b1b",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              marginTop: 18, padding: "12px 16px",
              background: th.sageGlow, border: `1px solid ${th.sage}33`,
              borderRadius: 10, fontSize: 13, color: th.sage,
            }}>
              {success}
            </div>
          )}

          {/* Switch mode */}
          <p style={{
            marginTop: 28, textAlign: "center", fontSize: 14, color: th.inkSoft,
          }}>
            {mode === "signin" ? (
              <>New to suppdoc.io? <Link href="/signup" style={{ color: th.sage, fontWeight: 500 }}>Create account →</Link></>
            ) : (
              <>Already have an account? <Link href="/signin" style={{ color: th.sage, fontWeight: 500 }}>Sign in →</Link></>
            )}
          </p>

          {/* Setup hint (only if not configured) */}
          {!configured && (
            <div style={{
              marginTop: 32, padding: "16px 18px",
              background: "rgba(196,148,74,0.08)", border: "1px solid rgba(196,148,74,0.25)",
              borderRadius: 12, fontSize: 12, color: "#8b6730", lineHeight: 1.5,
            }}>
              <strong style={{ display: "block", marginBottom: 4 }}>⚙ Demo mode</strong>
              Supabase auth isn&apos;t connected yet. Email currently saves locally. Configure <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4 }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4 }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> on Vercel to activate.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
