"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { TH, FONTS } from "@/lib/theme";
import { trackEmailSignup } from "@/lib/track";
import { useT } from "@/components/I18nProvider";
import { richText } from "@/components/RichText";
import type { PaddleClientConfig } from "@/lib/paddle";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };

// ─── Paddle.js loader (loaded once, on demand; used only when billing is live) ──
type PaddleGlobal = {
  Environment: { set: (env: "sandbox" | "production") => void };
  Initialize: (opts: { token: string }) => void;
  Checkout: { open: (opts: Record<string, unknown>) => void };
};
declare global { interface Window { Paddle?: PaddleGlobal } }
let paddlePromise: Promise<PaddleGlobal> | null = null;
function loadPaddle(cfg: PaddleClientConfig): Promise<PaddleGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (paddlePromise) return paddlePromise;
  paddlePromise = new Promise<PaddleGlobal>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => {
      const P = window.Paddle;
      if (!P) { reject(new Error("Paddle failed to load")); return; }
      P.Environment.set(cfg.environment);
      P.Initialize({ token: cfg.token });
      resolve(P);
    };
    s.onerror = () => reject(new Error("Paddle script error"));
    document.body.appendChild(s);
  });
  return paddlePromise;
}

type Cell = boolean | string;

export default function PricingClient({
  signedIn: initialSignedIn, email, isPremium: initialIsPremium, billingEnabled, paddle, foundingMode, spotsLeft, foundingTotal,
}: {
  signedIn: boolean; email: string | null; isPremium: boolean; billingEnabled: boolean;
  paddle: PaddleClientConfig | null; foundingMode: boolean; spotsLeft: number; foundingTotal: number;
}) {
  const router = useRouter();
  const { t, lh } = useT();
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(email);
  // /pricing is statically rendered (ISR), so per-user state is resolved on the
  // client. The static shell is the anonymous/founding view — exactly what cold
  // (signed-out) visitors should see, with no flash — and we fill in the signed-in
  // / Premium state after mount (see the /api/me/premium effect below).
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [isPremium, setIsPremium] = useState(initialIsPremium);

  // ── Founding-member capture (manual validation phase) ──
  const [foundingEmail, setFoundingEmail] = useState(email ?? "");
  const [foundingBusy, setFoundingBusy] = useState(false);
  const [foundingDone, setFoundingDone] = useState(false);
  const [foundingErr, setFoundingErr] = useState<string | null>(null);

  // Resolve the signed-in + Premium state for the statically-rendered page. Runs
  // once on mount; until it returns, the page shows the anonymous/founding view.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/premium")
      .then((r) => r.json())
      .then((d: { signedIn?: boolean; email?: string | null; isPremium?: boolean }) => {
        if (cancelled || !d) return;
        setSignedIn(Boolean(d.signedIn));
        setIsPremium(Boolean(d.isPremium));
        if (d.email) {
          setAuthEmail(d.email);
          setFoundingEmail((prev) => prev || d.email!);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const scrollToFounding = useCallback(() => {
    document.getElementById("founding-offer")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("founding-email-input")?.focus(), 350);
  }, []);

  const submitFounding = useCallback(async () => {
    const e = foundingEmail.trim().toLowerCase();
    if (!e.includes("@") || !e.includes(".")) { setFoundingErr(t("pricing.invalidEmail")); return; }
    setFoundingBusy(true); setFoundingErr(null);
    const r = await trackEmailSignup(e, "founding-member");
    setFoundingBusy(false);
    if (!r.ok) {
      setFoundingErr(t("pricing.submitError"));
      return;
    }
    track("founding_interest", { signedIn });
    setFoundingDone(true);
  }, [foundingEmail, signedIn, t]);

  const upgrade = useCallback(async () => {
    track("checkout_click", { plan, signedIn, provider: paddle ? "paddle" : "stripe" });
    if (!signedIn) { router.push(`${lh("/signin")}?redirect=${lh("/pricing")}`); return; }
    if (!billingEnabled) { setError(t("pricing.checkoutNotLive")); return; }
    setBusy(true); setError(null);
    if (paddle) {
      try {
        const P = await loadPaddle(paddle);
        const priceId = plan === "annual" ? paddle.priceAnnual : paddle.priceMonthly;
        const userEmail = (authEmail || email || "").trim();
        P.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          ...(userEmail ? { customData: { user_email: userEmail } } : {}),
          settings: { displayMode: "overlay", theme: "light", successUrl: `${window.location.origin}/me?upgraded=1` },
        });
      } catch { setError(t("pricing.checkoutOpenError")); }
      finally { setBusy(false); }
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }),
      });
      const body = await res.json();
      if (body.ok && body.url) window.location.href = body.url;
      else setError(t("pricing.checkoutStartError"));
    } catch { setError(t("pricing.networkError")); }
    finally { setBusy(false); }
  }, [signedIn, email, authEmail, billingEnabled, plan, paddle, router, lh, t]);

  // ── Feature comparison matrix (labels + cells resolved through the dictionary) ──
  const MATRIX: { label: string; free: Cell; premium: Cell }[] = [
    { label: t("pricing.m1"), free: true, premium: true },
    { label: t("pricing.m2"), free: true, premium: true },
    { label: t("pricing.m3"), free: true, premium: true },
    { label: t("pricing.m4"), free: t("pricing.cellPreview"), premium: true },
    { label: t("pricing.m5"), free: t("pricing.cell1Analysis"), premium: t("pricing.cellUnlimited") },
    { label: t("pricing.m6"), free: false, premium: true },
    { label: t("pricing.m7"), free: false, premium: true },
    { label: t("pricing.m8"), free: t("pricing.cell7days"), premium: t("pricing.cellUnlimitedTrends") },
    { label: t("pricing.m9"), free: false, premium: true },
    { label: t("pricing.m10"), free: false, premium: true },
    { label: t("pricing.m11"), free: false, premium: true },
  ];

  const FAQS = Array.from({ length: 7 }, (_, i) => ({ q: t(`pricing.faq${i + 1}q`), a: t(`pricing.faq${i + 1}a`) }));

  const claimed = Math.max(0, foundingTotal - spotsLeft);
  const claimedPct = foundingTotal > 0 ? Math.min(100, Math.round((claimed / foundingTotal) * 100)) : 0;
  const left = Math.max(1, spotsLeft); // never show "0 left" while the offer is live
  const price = plan === "annual" ? "$79" : "$9";
  const per = plan === "annual" ? t("pricing.perYear") : t("pricing.perMonth");

  return (
    <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 96px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ===== Hero ===== */}
        <header style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{t("pricing.eyebrow")}</div>
          <h1 style={{ ...D, fontSize: "clamp(32px, 5.5vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            {t("pricing.h1a")} <span style={{ ...SI, color: TH.sageDeep }}>{t("pricing.h1b")}</span>
          </h1>
          <p style={{ fontSize: 17.5, color: TH.inkSoft, maxWidth: 560, margin: "0 auto", lineHeight: 1.55 }}>
            {t("pricing.heroSub")}
          </p>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", marginTop: 18, ...MM, fontSize: 11.5, color: TH.muted, letterSpacing: "0.03em" }}>
            <TrustChip>{t("pricing.chipNoBrand")}</TrustChip>
            <TrustChip>{t("pricing.chipEvidence")}</TrustChip>
            <TrustChip>{t("pricing.chipMoneyBack")}</TrustChip>
            <TrustChip>{t("pricing.chipCancel")}</TrustChip>
          </div>
        </header>

        {/* ===== Founding offer (premium hero card) ===== */}
        {foundingMode && (
          <section id="founding-offer" style={{
            position: "relative", overflow: "hidden",
            background: `linear-gradient(165deg, #0d2c4d 0%, #071a30 100%)`, color: "#fff",
            borderRadius: 24, padding: "clamp(24px, 4vw, 38px)", marginBottom: 34,
            boxShadow: "0 30px 70px -30px rgba(10,37,64,0.65)",
          }}>
            <div aria-hidden style={{ position: "absolute", top: -120, right: -100, width: 380, height: 380, borderRadius: 999, background: `radial-gradient(circle, color-mix(in srgb, ${TH.sage} 22%, transparent) 0%, color-mix(in srgb, ${TH.sage} 0%, transparent) 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ ...MM, fontSize: 10.5, color: "#0a1f38", background: TH.amber, padding: "4px 11px", borderRadius: 999, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  {t("pricing.foundingTag")}
                </span>
                <span style={{ ...MM, fontSize: 11.5, color: TH.amber, letterSpacing: "0.06em" }}>
                  {t("pricing.spotsLeft", { left, total: foundingTotal })}
                </span>
              </div>

              <h2 style={{ ...D, fontSize: "clamp(26px, 4.4vw, 40px)", lineHeight: 1.06, letterSpacing: "-0.02em", margin: "0 0 12px", maxWidth: 640 }}>
                {t("pricing.foundingH2pre")} <span style={SI}>{t("pricing.foundingH2em")}</span> {t("pricing.foundingH2post")}
              </h2>
              <p style={{ fontSize: 16, opacity: 0.86, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 600 }}>
                {richText(t("pricing.foundingBody", { total: foundingTotal }), { boldStyle: { opacity: 1 } })}
              </p>

              {/* Scarcity bar */}
              <div style={{ maxWidth: 600, marginBottom: 22 }}>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(6, claimedPct)}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${TH.sage}, ${TH.amber})`, transition: "width .4s" }} />
                </div>
                <div style={{ ...MM, fontSize: 10.5, opacity: 0.62, marginTop: 7 }}>
                  {claimed > 0 ? t("pricing.claimedLine", { claimed, left }) : t("pricing.claimedLineZero", { left })}
                </div>
              </div>

              {foundingDone ? (
                <div style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "20px 22px", maxWidth: 600 }}>
                  <div style={{ ...D, fontSize: 17, marginBottom: 6 }}>{t("pricing.onListTitle")}</div>
                  <div style={{ fontSize: 14.5, opacity: 0.86, lineHeight: 1.55 }}>
                    {t("pricing.onListBody")} <a href="mailto:hello@suppdoc.io" style={{ color: TH.amber }}>hello@suppdoc.io</a>
                  </div>
                </div>
              ) : isPremium ? (
                <div style={{ ...D, fontSize: 16, color: TH.sage }}>{t("pricing.alreadyPremium")}</div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 600 }}>
                    <input
                      id="founding-email-input" type="email" inputMode="email" autoComplete="email" value={foundingEmail}
                      onChange={e => setFoundingEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") submitFounding(); }}
                      placeholder={t("pricing.emailPlaceholder")}
                      aria-label={t("pricing.emailAria")}
                      style={{
                        flex: "1 1 240px", minWidth: 200, padding: "15px 16px", borderRadius: 13, border: "none",
                        fontSize: 16, fontFamily: FONTS.body, color: "#0a2540", background: "#fff",
                        outline: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                      }}
                    />
                    <button onClick={submitFounding} disabled={foundingBusy} style={{
                      padding: "15px 26px", borderRadius: 13, border: "none", cursor: foundingBusy ? "wait" : "pointer",
                      background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", ...D, fontWeight: 600, fontSize: 15.5,
                      boxShadow: `0 10px 24px -8px ${TH.sage}`,
                    }}>
                      {foundingBusy ? t("pricing.claimCtaBusy") : t("pricing.claimCta")}
                    </button>
                  </div>
                  {foundingErr && <div role="alert" style={{ marginTop: 10, fontSize: 13.5, color: TH.amber }}>{foundingErr}</div>}
                  <div style={{ ...MM, fontSize: 10.5, opacity: 0.6, marginTop: 13 }}>
                    {t("pricing.foundingFinePrint")}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ===== Plan cards ===== */}
        {!foundingMode && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <div style={{ display: "inline-flex", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 999, padding: 4 }}>
              {(["annual", "monthly"] as const).map(p => (
                <button key={p} onClick={() => setPlan(p)} style={{
                  padding: "9px 20px", borderRadius: 999, border: "none", cursor: "pointer",
                  fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600,
                  background: plan === p ? TH.inkBg : "transparent", color: plan === p ? "#fff" : TH.inkSoft, transition: "all .15s",
                }}>
                  {p === "annual" ? t("pricing.planAnnual") : t("pricing.planMonthly")}
                  {p === "annual" && <span style={{ ...MM, fontSize: 9.5, color: plan === p ? TH.sage : TH.sageDeep, marginLeft: 6 }}>{t("pricing.save27")}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "var(--pricing-cols)", gap: 16, alignItems: "start" }}>
          {/* Free */}
          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "28px 26px" }}>
            <div style={{ ...D, fontSize: 20, color: TH.ink }}>{t("pricing.freeName")}</div>
            <div style={{ ...D, fontSize: 42, color: TH.ink, letterSpacing: "-0.03em", margin: "8px 0 2px" }}>$0</div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 20 }}>{t("pricing.freeSub")}</div>
            <Bullets items={[t("pricing.freeB1"), t("pricing.freeB2"), t("pricing.freeB3"), t("pricing.freeB4"), t("pricing.freeB5")]} />
            <a href={lh("/quiz")} style={{
              marginTop: 22, display: "block", textAlign: "center", padding: "13px 20px", borderRadius: 999,
              border: `1.5px solid ${TH.edgeStrong}`, color: TH.ink, textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5,
            }}>{t("pricing.startFree")}</a>
          </div>

          {/* Premium */}
          <div style={{
            background: TH.surface, border: `2px solid ${TH.sage}`, borderRadius: 22, padding: "28px 26px", position: "relative",
            boxShadow: `0 18px 48px -18px color-mix(in srgb, ${TH.sage} 40%, transparent)`,
          }}>
            <span style={{
              position: "absolute", top: -11, left: 24, ...MM, fontSize: 10, fontWeight: 700, color: "#fff",
              background: TH.sage, padding: "4px 11px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>{t("pricing.mostPopular")}</span>
            <div style={{ ...D, fontSize: 20, color: TH.ink }}>{t("pricing.premiumName")}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0 2px", flexWrap: "wrap" }}>
              <span style={{ ...D, fontSize: 42, color: TH.ink, letterSpacing: "-0.03em" }}>{foundingMode ? "$79" : price}</span>
              <span style={{ fontSize: 15, color: TH.muted }}>{foundingMode ? t("pricing.premiumOnce") : per}</span>
              {foundingMode && <span style={{ ...MM, fontSize: 12, color: TH.muted, textDecoration: "line-through" }}>$9/mo</span>}
            </div>
            <div style={{ fontSize: 13, color: foundingMode ? TH.sageDeep : TH.muted, marginBottom: 20, fontWeight: foundingMode ? 600 : 400 }}>
              {foundingMode ? t("pricing.premiumSubFounding") : plan === "annual" ? t("pricing.premiumSubAnnual") : t("pricing.premiumSubMonthly")}
            </div>
            <Bullets highlight items={[t("pricing.premB1"), t("pricing.premB2"), t("pricing.premB3"), t("pricing.premB4"), t("pricing.premB5"), t("pricing.premB6"), t("pricing.premB7")]} />
            <button onClick={foundingMode ? scrollToFounding : upgrade} disabled={busy || isPremium} style={{
              marginTop: 22, width: "100%", padding: "14px 20px", borderRadius: 999, border: "none",
              background: isPremium ? TH.bg : `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`,
              color: isPremium ? TH.sageDeep : "#fff", ...D, fontWeight: 600, fontSize: 15,
              cursor: isPremium ? "default" : busy ? "wait" : "pointer",
              boxShadow: isPremium ? "none" : `0 10px 24px -8px ${TH.sage}`,
            }}>
              {isPremium ? t("pricing.btnOnPremium")
                : foundingMode ? t("pricing.btnClaim")
                : busy ? t("pricing.btnStarting")
                : signedIn ? t("pricing.btnUpgrade", { price, per }) : t("pricing.btnSignInUpgrade")}
            </button>
            {error && !foundingMode && <div role="alert" style={{ marginTop: 10, fontSize: 12.5, color: "var(--c-destructive)", textAlign: "center" }}>{error}</div>}
            <div style={{ marginTop: 11, ...MM, fontSize: 10, color: TH.mutedDim, textAlign: "center", letterSpacing: "0.03em" }}>
              {foundingMode ? t("pricing.finePrintFounding") : <>{t("pricing.finePrintBilling", { provider: paddle ? "Paddle" : "Stripe" })}</>}
            </div>
          </div>
        </div>

        {/* ===== Comparison table ===== */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ ...D, fontSize: 24, textAlign: "center", letterSpacing: "-0.02em", margin: "0 0 20px" }}>{t("pricing.compareTitle")}</h2>
          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr" }}>
              <Cellh></Cellh>
              <Cellh center>{t("pricing.colFree")}</Cellh>
              <Cellh center highlight>{t("pricing.colPremium")}</Cellh>
              {MATRIX.map((row, i) => (
                <Row key={i} row={row} last={i === MATRIX.length - 1} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== Value / why it pays for itself ===== */}
        <section style={{ marginTop: 44, display: "grid", gridTemplateColumns: "var(--value-cols)", gap: 16 }}>
          <ValueCard icon="📉" title={t("pricing.v1t")} body={t("pricing.v1b")} />
          <ValueCard icon="🧬" title={t("pricing.v2t")} body={t("pricing.v2b")} />
          <ValueCard icon="🧠" title={t("pricing.v3t")} body={t("pricing.v3b")} />
        </section>

        {/* ===== Scientific credibility / trust ===== */}
        <section style={{ marginTop: 44, background: TH.inkBg, color: "#fff", borderRadius: 20, padding: "clamp(24px,4vw,34px)", textAlign: "center" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.amber, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>{t("pricing.trustEyebrow")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "var(--trust-cols)", gap: 20, maxWidth: 720, margin: "0 auto" }}>
            <Stat n="70,000+" l={t("pricing.trustStat1l")} />
            <Stat n="200+" l={t("pricing.trustStat2l")} />
            <Stat n="$0" l={t("pricing.trustStat3l")} />
          </div>
          <p style={{ fontSize: 14.5, opacity: 0.8, lineHeight: 1.6, maxWidth: 600, margin: "22px auto 0" }}>
            {t("pricing.trustBody")}
          </p>
        </section>

        {/* ===== FAQ ===== */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ ...D, fontSize: 24, textAlign: "center", letterSpacing: "-0.02em", margin: "0 0 20px" }}>{t("pricing.faqTitle")}</h2>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((f, i) => (
              <details key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "4px 18px" }}>
                <summary style={{ ...D, fontSize: 15.5, color: TH.ink, cursor: "pointer", listStyle: "none", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  {f.q}
                  <span style={{ color: TH.sageDeep, fontSize: 20, fontWeight: 400, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        {foundingMode && !isPremium && !foundingDone && (
          <section style={{ marginTop: 40, textAlign: "center" }}>
            <button onClick={scrollToFounding} style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", borderRadius: 999, border: "none", cursor: "pointer",
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", ...D, fontWeight: 600, fontSize: 15.5,
              boxShadow: `0 12px 28px -8px ${TH.sage}`,
            }}>
              {t("pricing.finalCta", { left })}
            </button>
          </section>
        )}

        <p style={{ fontSize: 12.5, color: TH.muted, textAlign: "center", marginTop: 34, lineHeight: 1.6, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          {t("pricing.footnote")}
        </p>
      </div>

      <style>{`
        :root { --pricing-cols: 1fr 1fr; --value-cols: 1fr 1fr 1fr; --trust-cols: 1fr 1fr 1fr; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] > summary > span:last-child { transform: rotate(45deg); }
        @media (max-width: 860px) { :root { --value-cols: 1fr; } }
        @media (max-width: 720px) { :root { --pricing-cols: 1fr; --trust-cols: 1fr; } }
      `}</style>
    </main>
  );
}

function TrustChip({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="3.2"><path d="M5 12l5 5 9-11" /></svg>
      {children}
    </span>
  );
}

function Bullets({ items, highlight }: { items: string[]; highlight?: boolean }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
      {items.map((b, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: i === 0 && highlight ? TH.ink : TH.inkSoft, fontWeight: i === 0 && highlight ? 600 : 400, lineHeight: 1.4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={highlight ? TH.sage : TH.muted} strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}><path d="M5 12l5 5 9-11" /></svg>
          {b}
        </li>
      ))}
    </ul>
  );
}

function Cellh({ children, center, highlight }: { children?: ReactNode; center?: boolean; highlight?: boolean }) {
  return (
    <div style={{
      padding: "16px 18px", ...D, fontSize: 14, color: TH.ink, textAlign: center ? "center" : "left",
      background: highlight ? `color-mix(in srgb, ${TH.sage} 7%, transparent)` : "transparent", borderBottom: `1px solid ${TH.edge}`,
    }}>{children}</div>
  );
}

function Row({ row, last }: { row: { label: string; free: Cell; premium: Cell }; last: boolean }) {
  const border = last ? "none" : `1px solid ${TH.edge}`;
  return (
    <>
      <div style={{ padding: "14px 18px", fontSize: 14, color: TH.inkSoft, borderBottom: border, lineHeight: 1.4 }}>{row.label}</div>
      <CellVal v={row.free} border={border} />
      <CellVal v={row.premium} border={border} highlight />
    </>
  );
}

function CellVal({ v, border, highlight }: { v: Cell; border: string; highlight?: boolean }) {
  return (
    <div style={{ padding: "14px 12px", textAlign: "center", borderBottom: border, background: highlight ? `color-mix(in srgb, ${TH.sage} 5%, transparent)` : "transparent", fontSize: 13.5, color: TH.inkSoft }}>
      {v === true ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="3" style={{ display: "inline" }}><path d="M5 12l5 5 9-11" /></svg>
        : v === false ? <span style={{ color: TH.mutedDim, fontSize: 18 }}>–</span>
        : <span style={{ ...MM, fontSize: 12, color: highlight ? TH.sageDeep : TH.inkSoft, fontWeight: 600 }}>{v}</span>}
    </div>
  );
}

function ValueCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 22px" }}>
      <div style={{ fontSize: 26, marginBottom: 12 }} aria-hidden>{icon}</div>
      <div style={{ ...D, fontSize: 16, color: TH.ink, lineHeight: 1.3, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ ...D, fontSize: "clamp(26px,4vw,34px)", color: "#fff", letterSpacing: "-0.02em" }}>{n}</div>
      <div style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.45, marginTop: 4 }}>{l}</div>
    </div>
  );
}
