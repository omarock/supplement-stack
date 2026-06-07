# SuppDoc.io — Conversion & Monetization Audit (2026-06-07)

Audited as: Product Designer · CRO · SaaS monetization · pricing · behavioral psych · UX research · revenue. Grounded in the actual codebase, not assumptions.

## TL;DR — the one thing costing you money
**Founding-member leads are silently lost.** The pricing form (`PricingClient.submitFounding`) wraps the save in `try/catch` and **always shows "You're on the list 🎉" even when the save fails**. The save itself (`trackEmailSignup`) is **client-side only**, **no-ops silently** if the Supabase anon client isn't ready, writes straight to a table that anon users are likely blocked from by RLS, and **never notifies you**. Net result: a visitor pays you attention, "converts," sees success — and you receive nothing. This is fixed first.

---

## Current monetization model (what's actually true)
- **FOUNDING_MODE = true** in `pricing/page.tsx`. Automated billing (Paddle) was declined for the supplements category; Stripe needs a US entity. So today you sell a **one-time $79 lifetime "founding member"** pass, invoiced manually (Payoneer), granted by hand in `/admin` (`/api/admin/grant-premium` writes a `subscriptions` row → `isPremium` true).
- **Premium gating** (`lib/premium.ts`) is solid: `subscriptions.status ∈ {active,trialing}` + period check.
- **Free tier** is generous: all guides/studies/stacks/journal, quiz + builder + audit, 1 bloodwork analysis, 14 days tracking.
- **Premium** = unlimited bloodwork + saved history, re-test comparison, full tracking trends, coach with memory, reminders + weekly reports.
- Email infra (`lib/resend.ts` → `sendViaResend`) and a **service-role server client** (`getAdminSupabase`) both exist and work — so the leak is fixable cleanly server-side.

---

## PHASE 1 — Findings (severity · issue · fix)

### 🔴 CRITICAL
1. **Lead capture loses leads + never alerts you.** (`PricingClient.submitFounding`, `lib/track.ts:trackEmailSignup`.)
   - `foundingDone` is set `true` in `finally{}` → success UI shows even on total failure.
   - Client-side insert; silent no-op if anon client missing; RLS likely blocks anon insert to `email_signups`; zero founder notification.
   - **Fix:** server `POST /api/lead` → `getAdminSupabase()` insert (bypasses RLS) + `sendViaResend()` to you + return real `{ok}`. Client shows success only on `ok`, real error otherwise.

### 🟠 HIGH
2. **The only money path is a buried email box.** The founding card is good copy but has no proof, no risk-reversal, no FAQ, no comparison, and "only 50 spots" is hardcoded (no real, moving counter → not believable).
3. **Free→Premium value is invisible at the moment of need.** Limits (2nd bloodwork, day-15 tracking, coach memory) are where people would pay — but there's no premium upgrade experience there, just (at best) a dead end. Upgrade intent is highest at the limit; we waste it.
4. **Trust deficit on the money page.** No guarantee/refund, no privacy reassurance, no scientific-credibility block, no social proof — despite owning strong assets (71,776 studies, 200+ ingredients, "we never sell our own pills"). These are the most persuasive things you have and they're absent from /pricing.

### 🟡 MEDIUM
5. **Pricing is under-leveraged.** $79 lifetime with no anchor reads as "cheap thing" not "premium tool." No visible "regular price" to anchor the lifetime deal against. Lifetime-only also caps LTV once you scale.
6. **No onboarding → activation → upgrade arc.** After signup there's no guided push to the aha moment (run the quiz / audit / a bloodwork), so few users ever reach the value that justifies paying.
7. **Annual savings / plan differentiation** not visualized (only relevant when recurring returns, but the comparison clarity is weak even now).

### 🟢 LOW / polish
8. Stale "151 research backed ingredients" in `AuthForm` trust list (now 200+).
9. Email-input contrast/visibility + consistent states (loading/empty/success/error) across capture points.
10. Mobile spacing on pricing cards and the founding card CTA.

---

## PHASE 2 — Pricing strategy

### Benchmark
| Product | Model | Notes |
|---|---|---|
| Examine.com | ~$29/mo or ~$149/yr | The evidence authority; reading, not tools. We're a *tool*, can sit below it. |
| Fullscript / dispensaries | markup on pills | Bias baked in; our "no house brand" is the wedge. |
| supstack / supplement trackers | ~$5–10/mo | Tracking-led; thinner evidence layer. |
| AI SaaS (Perplexity/Grammarly tier) | ~$8–20/mo | Sets the mental anchor for "smart tool" pricing. |

### Verdict
- **Free tier is correctly generous** — it's your acquisition + SEO engine. Keep it. Only gate the *data-compounding* features (history, re-test comparison, trends, coach memory) — which it already does. Good instinct.
- **$79 lifetime is fine for validation** (low-friction, manual fulfillment) **but presented as underpriced.** Fix the *presentation*, not the number yet: anchor it against the future recurring price ("will be $9/mo — lock lifetime for one $79"). That reframes $79 from "cheap" to "steal."
- **When recurring returns** (Stripe via US entity): lead with **Annual $79/yr** (hero) + Monthly $9/mo; keep a small **lifetime** tier as a premium anchor at **$149–$199** (raises the ceiling and makes annual look smart).
- **Are we leaving money on the table?** Yes, in three places: (1) lost leads (critical), (2) no upgrade prompts at limit moments, (3) no higher-value offers (expert/clinician-reviewed report, personalized plan PDF) for users who want more than software.

### Revenue opportunities (ranked by effort×impact)
1. **Fix the leak** — infinite ROI; you're losing 100% of founding leads now.
2. **Limit-moment upgrade experiences** — highest-intent upsell surface.
3. **Annual as default** when recurring is live — lifts ARPU + cash up front.
4. **"Founding member" lifetime as scarcity** — drives urgency during validation.
5. **Premium expert report / personalized plan PDF** — a $19–$49 one-off that converts even free users and needs no subscription processor.
6. **Affiliate (already live, iHerb+Amazon)** — keep; it monetizes the 95% who never pay.

---

## What gets implemented (this engagement)
- **P0** server lead route + Resend founder alert + honest UI + live founding-spots counter.
- **P1** full premium pricing redesign: comparison table, value/ROI, FAQ, trust badges, risk reversal, scientific credibility, dynamic scarcity, mobile-perfect.
- **P2** premium upgrade experiences at every free limit (reusable component).
- **Polish** stale counts, input visibility, states, mobile.
- **FINAL_DELIVERABLES.md** with before/after + expected impact.
