"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

const FREE = [
  "All guides, studies, stacks & journal",
  "AI quiz + stack builder + audit",
  "1 bloodwork analysis",
  "14 days of tracking",
];
const PREMIUM = [
  "Everything in Free",
  "Unlimited bloodwork + saved history",
  "Re-test comparison (ferritin 18 → 47)",
  "Full tracking history + trend analytics",
  "AI coach with memory of your data",
  "Daily reminders + weekly reports",
];

export default function PricingClient({ signedIn, isPremium, billingEnabled }: { signedIn: boolean; isPremium: boolean; billingEnabled: boolean }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = useCallback(async () => {
    track("checkout_click", { plan, signedIn });
    if (!signedIn) { router.push("/signin?redirect=/pricing"); return; }
    if (!billingEnabled) { setError("Checkout isn't switched on yet, check back shortly."); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }),
      });
      const body = await res.json();
      if (body.ok && body.url) window.location.href = body.url;
      else setError("Couldn't start checkout. Please try again.");
    } catch { setError("Network error."); }
    finally { setBusy(false); }
  }, [signedIn, billingEnabled, plan, router]);

  const price = plan === "annual" ? "$79" : "$9";
  const per = plan === "annual" ? "/year" : "/month";
  const sub = plan === "annual" ? "≈ $6.58/mo · 2 months free" : "billed monthly · cancel anytime";

  return (
    <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h1 style={{ ...D, fontSize: "clamp(32px, 5.5vw, 50px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Free to start. <span style={{ fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400, color: TH.sageDeep }}>Premium when it matters.</span>
          </h1>
          <p style={{ fontSize: 17, color: TH.inkSoft, maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
            We don&apos;t sell supplements, so premium isn&apos;t a markup on pills, it&apos;s the tools that turn your stack into measurable progress.
          </p>
        </header>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 999, padding: 4 }}>
            {(["monthly", "annual"] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)} style={{
                padding: "8px 18px", borderRadius: 999, border: "none", cursor: "pointer",
                fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600,
                background: plan === p ? TH.ink : "transparent", color: plan === p ? "#fff" : TH.inkSoft,
                transition: "all .15s",
              }}>
                {p === "monthly" ? "Monthly" : "Annual"}
                {p === "annual" && <span style={{ ...MM, fontSize: 9.5, color: plan === p ? TH.sage : TH.sageDeep, marginLeft: 6 }}>SAVE 27%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "var(--pricing-cols)", gap: 16 }}>
          {/* Free */}
          <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "26px 26px" }}>
            <div style={{ ...D, fontSize: 20, color: TH.ink }}>Free</div>
            <div style={{ ...D, fontSize: 40, color: TH.ink, letterSpacing: "-0.03em", margin: "8px 0 2px" }}>$0</div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 18 }}>forever · no card</div>
            <Bullets items={FREE} />
          </div>

          {/* Premium */}
          <div style={{
            background: TH.surface, border: `2px solid ${TH.sage}`, borderRadius: 22, padding: "26px 26px", position: "relative",
            boxShadow: `0 14px 40px -16px ${TH.sage}55`,
          }}>
            <span style={{
              position: "absolute", top: -11, left: 24, ...MM, fontSize: 10, fontWeight: 600, color: "#fff",
              background: TH.sage, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>Most popular</span>
            <div style={{ ...D, fontSize: 20, color: TH.ink }}>Premium</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 2px" }}>
              <span style={{ ...D, fontSize: 40, color: TH.ink, letterSpacing: "-0.03em" }}>{price}</span>
              <span style={{ fontSize: 15, color: TH.muted }}>{per}</span>
            </div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 18 }}>{sub}</div>
            <Bullets items={PREMIUM} highlight />
            <button onClick={upgrade} disabled={busy || isPremium} style={{
              marginTop: 20, width: "100%", padding: "14px 20px", borderRadius: 999, border: "none",
              background: isPremium ? TH.bg : `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`,
              color: isPremium ? TH.sageDeep : "#fff", ...D, fontWeight: 600, fontSize: 15,
              cursor: isPremium ? "default" : busy ? "wait" : "pointer",
              boxShadow: isPremium ? "none" : `0 8px 20px -6px ${TH.sage}80`,
            }}>
              {isPremium ? "✓ You're on Premium" : busy ? "Starting checkout…" : signedIn ? `Upgrade, ${price}${per}` : "Sign in to upgrade"}
            </button>
            {error && <div role="alert" style={{ marginTop: 10, fontSize: 12.5, color: "#b91c1c", textAlign: "center" }}>{error}</div>}
            <div style={{ marginTop: 10, ...MM, fontSize: 10, color: TH.mutedDim, textAlign: "center", letterSpacing: "0.03em" }}>
              Cancel anytime · secure checkout by Stripe
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12.5, color: TH.muted, textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
          Educational use only, not medical advice. Premium adds tools and history; it never changes the honesty of the recommendations.
        </p>
      </div>

      <style>{`
        :root { --pricing-cols: 1fr 1fr; }
        @media (max-width: 720px) { :root { --pricing-cols: 1fr; } }
      `}</style>
    </main>
  );
}

function Bullets({ items, highlight }: { items: string[]; highlight?: boolean }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((b, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: TH.inkSoft, lineHeight: 1.4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={highlight ? TH.sage : TH.muted} strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}><path d="M5 12l5 5 9-11" /></svg>
          {b}
        </li>
      ))}
    </ul>
  );
}
