# SuppDoc.io — Session Handoff (2026-06-07)

Paste this into a new session to continue with full context. (In this project, MEMORY.md also auto-loads.)

## Founder & working style
- **Omar Fakir**, Casablanca. Non-technical founder. Wants work done FOR him, step-by-step, no jargon. Replies in **French**. Cost-sensitive (esp. API spend).

## Product & stack
- **suppdoc.io** — live, evidence-based supplement site. Free tools (quiz, stack builder, audit, interaction/timing checkers, bloodwork analysis, daily tracker) + affiliate revenue (iHerb code DII6469 + Amazon tag `suppdoc07-20`). No house brand (key positioning).
- **Next.js 16 (modified — READ `node_modules/next/dist/docs/` before writing Next code)**, React 19, TypeScript, Supabase, Vercel. Inline styles + TH design tokens (not Tailwind for content pages).
- **Repo:** `C:\Users\X1\Desktop\AI Supplement Stack Generator\supplement-stack`. Parent dir is `AI Supplement Stack Generator` (the `growth/` docs live there, outside the repo).
- **Deploy:** commit + push to `master` → Vercel auto-deploys. Verify with `npx tsc --noEmit` then `npm run build` (use a Google-Fonts-fetch retry guard: local builds sometimes fail fetching Bricolage Grotesque; Vercel is fine).

## Hard rules (always)
- No literal word **"AI"** in visible site copy. No **em/en dashes** (— –); use commas/parentheses.
- **YMYL:** no fabricated studies/products/claims; real brands only; education-not-medical-advice framing.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Files are CRLF; the Edit tool needs a prior Read; for multi-file literal edits use a Node script (handles CRLF, no BOM).

## Env / integrations (all confirmed set in Vercel)
- `SUPABASE_SERVICE_ROLE_KEY` (→ `getAdminSupabase()` bypasses RLS), `NEXT_PUBLIC_SUPABASE_*`.
- `RESEND_API_KEY` (→ `sendViaResend`, from hello@suppdoc.io), `ADMIN_EMAILS` (lead notifications arrive — verified).
- `ANTHROPIC_API_KEY` **is set** (coach + bloodwork analysis run live).
- `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG = suppdoc07-20` (Amazon buttons live site-wide).
- **Billing:** Paddle was DECLINED for the supplements category; Stripe needs a US entity. So `FOUNDING_MODE = true` in `src/app/pricing/page.tsx`: Premium sold as a **one-time $79 lifetime "founding member"**, invoiced manually (Payoneer), granted by hand in `/admin` (`/api/admin/grant-premium` writes a `subscriptions` row → `isPremium`). Flip `FOUNDING_MODE=false` when a real recurring processor is live ($9/mo, $79/yr already wired).

## Catalog state
- **~200 ingredients** (`src/lib/supplements.ts` `SUPPLEMENT_DB`). Each has **≥4 real product options** (`src/lib/products.ts`, `EXTRA_PRODUCTS` + `getProducts()` merges base+extra, dedupes). Catalog audited 2026-06-07 (`scripts/audit-catalog.mjs`): 200 ingredients, zero duplicate ids or names. The old `garlic-aged-evening`/`olive-leaf` duplicate is confirmed gone.
- **Studies:** real PubMed counts in `src/lib/research-volume.ts` (`RESEARCH_STUDY_TOTAL = 71,776`, deduped RCT/meta/review counts). Homepage stat + per-ingredient "N CLINICAL STUDIES" chip → PubMed. Auditable source: `scripts/research-volume.source.tsv`.
- **Interactions:** 161 real pairs in `src/lib/interactions.ts`. Pages at `/interactions/[pair]`.
- **Homepage stat strip** (`src/app/HomeClient.tsx`) is dynamic: ingredients = `SUPPLEMENT_DB.length`, studies = `RESEARCH_STUDY_TOTAL`, interactions = `INTERACTIONS.length`.
- **Product images:** ~199 have real iHerb cloudinary photos; the rest use the premium `BottleMockup` SVG fallback. Real photos are captured via the connected Chrome browser (NOW-brand searches are reliable). 4 added this session (l-lysine, saw-palmetto, cranberry, boron).

## Conversion funnel (this session's major work — all live)
- **Lead-capture leak FIXED** (was the #1 revenue bug): `src/app/api/lead/route.ts` stores via service-role + emails the founder as a backstop; `trackEmailSignup` POSTs it and returns honest `{ok}`; the pricing form no longer fakes success. **Verified end-to-end** (founder received the test email).
- **Pricing redesigned** (`src/app/pricing/PricingClient.tsx`): premium hero, live founding scarcity (`foundingStats()`), Free vs Premium comparison table, value/ROI cards, scientific-credibility trust block, FAQ, 14-day money-back, mobile-perfect.
- **Upgrade experiences:** reusable `src/components/UpgradeCTA.tsx` (card/lock/banner). Wired into the tracker nudge, the bloodwork post-analysis upsell, and `Paywall` (history gate now delegates to it). Activation checklist on `/me` (quiz → bloodwork → tracking) for free users.
- **NEW feature — My Plan** (`src/app/plan/page.tsx`): personalized protocol from the user's latest quiz (AM/PM schedule, doses, why, combinations to watch, iHerb+Amazon links, monthly cost). Free = summary + **blurred preview + UpgradeCTA**; Premium = full + print/PDF (`PrintButton`). Linked from `/me`, sold on `/pricing`.
- **NEW — Premium coach** (`src/app/api/chat/route.ts`): Premium = full Claude coach with memory of stack/labs/goals (`buildMemoryBlock`); **Free = ONE rules-based taste, then a hard gate → /pricing** (zero API cost). This monetizes the coach AND bounds API cost to paying users (before, it ran for everyone incl. anonymous = cost leak).
- Docs: `CONVERSION_AUDIT.md`, `FINAL_DELIVERABLES.md`.

## Free vs Premium (current, live)
- **Free:** all guides/checkers, quiz/builder/audit, 1 bloodwork (view), 7-day tracking, **My Plan preview**, 1 coach taste.
- **Premium ($79 lifetime founding):** My Plan (saved + downloadable), unlimited+saved bloodwork, re-test comparison, full tracking trends, **coach with memory**, reminders + weekly reports.

## Growth (status)
- **GSC:** sitemap healthy (675 URLs, read 6 Jun) but only ~7 pages indexed → **young-domain authority bottleneck**, not a site problem. Fix = backlinks + time.
- **Reddit:** account created — display name **EvidenceOverHype**, handle **u/SupportHour6498**, email **suppdoc.growth@gmail.com**. Day 1 done (joined 12 subs, F5Bot, ~20 upvotes). Phase: Days 1–30 pure karma, **no links/brand**. Next: Day 2 comments from `growth/week-1-comment-pack.md`; then `growth/week-2-pack.md`. Reddit blocks all automated tools → hand Omar paste-ready content + live search URLs.
- **Product Hunt:** maker profile done (name "Omar Fakir"; username — "suppdoc" was taken, Omar picked an alternative; real photo avatar). **Launch planned Wed 17 June 2026, 00:01 PT (~08:01 Casablanca).** Full kit in `growth/product-hunt-launch.md` (tagline `Free, evidence-based supplement stack builder & checker`, description, maker comment, 5 gallery screenshots captured, minute-by-minute checklist, supporter messages, LinkedIn/X posts). Done 2026-06-07: **240×240 logo** in `growth/product-hunt-assets/` (+ 400/512 sizes), Upcoming-page content in `growth/product-hunt-upcoming.md`. Still needs: create the Upcoming page on PH, line up 8-12 supporters.
- **Backlinks:** paste-ready in `growth/submission-kit.md` + `growth/backlink-targets.md` (AlternativeTo, Crunchbase, SaaSHub, BetaList, There's An AI For That, Futurepedia, etc.). Logo now ready; Show HN + Indie Hackers + Wikidata copy prepped in `growth/backlink-content.md`. Not yet submitted.
- `growth/` folder is at the **project root** (outside the repo): reddit-growth-playbook.md, week-1-comment-pack.md, week-2-pack.md, backlink-targets.md, submission-kit.md, product-hunt-launch.md.

## Access / tools
- **Claude in Chrome** connected (Browser, Windows). Use for GSC, Vercel, Supabase dashboards, and iHerb image capture. GSC screenshots time out → use `get_page_text`.

## Open next steps (pick up here)
1. **Reddit Day 2+** (week-1 pack) → week 2.
2. **Product Hunt 17 Jun:** make the 240×240 logo, create the Upcoming page, line up supporters.
3. **Backlinks:** submit the P1 directories (after logo).
4. Optional product (DONE 2026-06-07/08): hard per-user coach limit (server IP counter), richer My Plan PDF (branded print header + suggested product per line + print paywall leak fixed), free tracking tightened to 7 days (premium 30), `garlic-aged-evening` duplicate confirmed gone. Still open: more real product images; the money-back text mismatch (Pricing says 14-day, /refunds says 7-day) needs the founder to pick one.
5. Pricing: raise lifetime to $99–$149 after first sales; flip `FOUNDING_MODE=false` when Stripe/US entity is ready.
