# Cleanup & architecture audit — suppdoc.io

**Date:** 2026-06-13 · **Author:** engineering pass (Claude)
**Constraint:** Product Hunt launch on Wed 17 Jun. This pass is a **pre-launch code freeze**: only zero-risk, build-verified changes were applied. All structural refactoring is documented below and **deferred to after the launch**.

---

## Executive summary

### Before
- TS/TSX files in `src/`: **241**
- Pages (`page.tsx`): **70**
- Components: **49**
- Runtime dependencies: **7** (`@supabase/ssr`, `@supabase/supabase-js`, `@vercel/analytics`, `lucide-react`, `next`, `react`, `react-dom`)

### After (this pass)
- Removed **2 orphan components**: `Navbar.tsx`, `SocialProof.tsx`
- Removed **1 unused dependency**: `lucide-react`
- Net: **−274 lines**, **−1 dependency**, components 49 → 47
- `tsc --noEmit` green · `next build` green · deployed (commit `479f4b2`)

Tooling used: `depcheck` (dependencies) + `knip` (unused files/exports/types).

---

## What was removed (safe, verified)

| Item | Type | Why it was safe |
|---|---|---|
| `src/components/Navbar.tsx` | Orphan component | Superseded by `SiteHeader.tsx`. Imported by **nothing** (grep + knip confirmed). |
| `src/components/SocialProof.tsx` | Orphan component | The testimonials section was removed from the homepage earlier; the component was left behind. Imported by nothing. |
| `lucide-react` | Dependency | Its **only** consumer was `Navbar.tsx`. Removing Navbar made it dead. The rest of the UI uses inline SVGs. |

**Verification:** type-check + production build both pass; deployed live.

---

## Kept on purpose (NOT dead code)

- **`scripts/*.cjs` / `scripts/*.mjs` (34 files)** — one-off maintenance/codemod tooling (image scrapers, the dark-mode `theme-codemod*` migration, `make-ph-logo`, `audit-catalog`, `check-i18n`, etc.). They are outside the build, have zero bundle impact, and document past migrations. **Reusable tooling — do not delete.**
- **`loadtest/smoke-and-load.js`** — k6 load-test script from the security audit. Keep.
- **`src/lib/indexnow.ts`** — working IndexNow (instant-indexing) SEO infrastructure with its `public/<key>.txt` ownership file. Built but **not yet wired** into the app. Not imported = not bundled (zero cost). **Action item, not dead code** — see backlog.
- **devDependencies flagged by depcheck** (`tailwindcss`, `@tailwindcss/postcss`, `@types/react-dom`) — false positives; used implicitly via PostCSS/Tailwind v4 config and TS. Keep.

---

## Deferred to post-launch (documented technical debt)

> These are real but carry regression risk on a working, live app. Doing them days before launch is not worth it. Tackle after 17 Jun, one batch at a time, each behind a green build.

### A. Dead exports & types — low risk, mechanical (do first post-launch)
`knip` found **49 unused exports + 12 unused exported types**. None are imported anywhere in the app. For each: either drop the `export` keyword (if used internally) or delete the symbol (if fully dead). Verify nothing in `scripts/` relies on them first. Notable groups:
- **Email templates** `welcomeEmail` / `day3Email` / `day7Email` / `day14Email` (`lib/email-templates.ts`) — confirm the digest/onboarding cron isn't meant to use these before deleting; they may be intended-but-unwired (like indexnow).
- **Tracker helpers** `FREE_TRACKING_DAYS`, `PREMIUM_TRACKING_DAYS`, `parseDateKey`, `daysBetweenKeys`, `metricTrend`, `scoreTier` (`lib/tracker.ts`).
- **Agents** `webSearchEnabled`, `siteStats`, `slugExists`, `estimateCost`, `FOUNDING_TOTAL_SPOTS` (`lib/agents/*`).
- **Misc** `SDFullLogo`/`SDWordmark` (`SuppdocLogo.tsx`), `EXTRA_PRODUCTS`/`cleanIherbImageUrl` (`products.ts`), `TESTIMONIALS`/`aggregateRating`/`Testimonial` (`social-proof.ts` — now that `SocialProof.tsx` is gone), `BRAND` (`theme.ts`), several `*WordCount`/`*_MIN_WORDS` guards.
- Full machine-readable list: run `npx knip` at the repo root.

### B. Large-component refactor — medium risk
A few client components are large and mix concerns. Candidates for splitting into sub-components + extracted hooks/helpers (behaviour unchanged):
- `src/app/HomeClient.tsx` (~720 lines, many section components in one file → could move each section to `components/home/`).
- `src/app/ingredients/[slug]/page.tsx`, `PricingClient.tsx`, `MyStackHub.tsx`, the quiz engines.

### C. Folder structure — medium risk (only if it earns its keep)
Current layout is conventional (`app/`, `components/`, `lib/`). The prompt's `features/ services/ hooks/ utils/` split is optional; `lib/` already serves as the service/util layer. **Recommendation: do NOT reorganize folders** unless a concrete pain point appears — moving files mass-rewrites imports for little gain and high regression risk.

### D. Typing pass — low/medium risk
Sweep for `any` and unsafe casts, tighten a few `lib/` data types. Mostly in agent/chat code.

---

## Phase 7 — SEO & accessibility (status: strong, no action needed pre-launch)
- `robots.ts`, `sitemap.ts` (714 URLs, noindex-guarded), `llms.txt`, per-page `canonical`, Open Graph images, and JSON-LD (Organization / WebSite / MedicalWebPage / Substance / FAQ / Dataset) are all in place.
- Recent fixes: removed invalid `DietarySupplement` product-snippet nodes; GSC validations started.
- Accessibility: inline SVG icons carry `aria-hidden`; interactive controls have `aria-label`; headings are structured. A formal a11y audit (contrast in dark mode, full keyboard pass) is a good post-launch task.

## Phase 8 — security (status: 96/100, audited 2026-06-11)
- Full pre-launch audit already done (`SECURITY_AUDIT.md`): 0 critical/high. Rate-limiting (Upstash-ready), HTML-escaping on `/api/lead`, webhook anti-replay, CSP without `unsafe-eval` in prod, Supabase RLS verified ON across 11 tables.
- No secrets in the client bundle (keys are server-only env vars). `INDEXNOW_KEY` in `lib/indexnow.ts` is a public protocol key by design (also hosted at `public/<key>.txt`) — not a secret.

---

## Bottom line
The codebase is in good shape: small dependency surface, conventional structure, strong SEO/security. The genuine cleanup win this pass was 2 orphan components + 1 dead dependency. The rest is **tidy-up, not bugs** — best done calmly after the launch, starting with the dead-export sweep (section A).
