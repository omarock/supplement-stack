# SuppDoc.io — SEO/GEO Execution Roadmap (TASKS.md)

Generated 2026-06-03, grounded in a real audit of THIS codebase (not template assumptions).
Legend: ✅ done & live · 🟡 partial · 🔴 genuine gap · ⛔ skip (would duplicate/break existing).

> Reality check: this site is already ~90% of what the 11-phase brief describes.
> Stack note: pages use inline styles + TH design tokens, NOT Tailwind, by design
> (see AGENTS.md). Routes are plural (`/ingredients`, not `/ingredient`).

## Phase 1 — SEO / technical / indexability audit → ✅ DONE
- Next 16 App Router, Vercel, NO Cloudflare in front. All key pages SSR/SSG (verified by curl: home 80KB, /interactions 335KB, ingredient 149KB, all with <h1> + JSON-LD + canonical).
- `app/robots.ts`, `app/sitemap.ts` (611 URLs), `public/llms.txt` all present and served 200.
- No `noindex` leaks. Sitemap submitted in GSC (read 3 Jun, 611 discovered, 7 indexed — ramping; young domain).

## Phase 2 — Programmatic SEO engine
- A) Ingredient pages → ✅ `/ingredients/[slug]` (151): overview, benefits, evidence tier, dosage, safety/warnings, interactions, FAQ, related ingredients/stacks/goals/biomarkers, PubMed (research subpage). ⛔ do NOT add singular `/ingredient` (duplicate content).
- B) Interaction pages → ✅ `/interactions/[pair]` (143): summary, evidence, mechanism, advice, related.
- C) Stack pages → ✅ `/stacks/[slug]` (15) + `/best/[goal]` goal stacks. 🟡 could add more goal slugs over time.

## Phase 3 — Learn hub → 🟡 / ⛔ HOLD
- Educational sections already exist: `/journal`, `/library`, plus the `/ingredients` `/interactions` `/timing` `/symptoms` `/biomarkers` clusters.
- A "Linear/Stripe visual redesign" (kit `components/learn/` + ingredient modules) WAS built then REVERTED at founder request (commit 0ab12cc, recoverable). ⛔ Do not auto-rebuild; needs founder's fresh-eyes design sign-off.

## Phase 4 — AI search optimization
- `llms.txt` ✅ — 🔴 minor: remove the word "AI" (brand rule) + add `/library`.
- robots ✅ · sitemap ✅ · segmentation 🟡 (single sitemap is fine at 611; segment only past a few thousand URLs).
- semantic HTML ✅ · OpenGraph ✅ · canonical ✅ · breadcrumb schema ✅ · Twitter cards 🟡 (OG covers most; explicit `twitter:card` tags optional).

## Phase 5 — Structured data → ✅ mostly
- Present: MedicalWebPage, DietarySupplement, FAQPage (ingredient/interaction/best), BreadcrumbList, ItemList, Organization, WebSite.
- 🔴 gaps: home FAQPage (the visible home FAQ has NO schema yet), Dataset (on the data study `/research/state-of-supplement-stacking`), HowTo (optional, where real step-by-step exists).

## Phase 6 — Internal knowledge graph → ✅
- Related goals/interactions/biomarkers/ingredients/stacks rendered on pages (`RelatedContent`, internal-link web). Meets the "link to related" goal.

## Phase 7 — Authority / evidence scoring → ✅
- Tiers (very strong / strong / moderate) + `EvidenceBadge` shown throughout. (Reviewer-gated E-E-A-T still pending — founder action.)

## Phase 8 — Content generation pipeline → ✅ BUILT this session
- Six-agent autopilot (`/admin/agents`, zero-API import mode): generates titles, meta, FAQ, schema, internal links; publishes to `/library`.

## Phase 9 — Conversion → ✅ / 🟡
- iHerb + Amazon CTAs, recommended product, related stacks, `/compare` comparison pages, affiliate disclosure. 🟡 contextual CTA matching (was prototyped in the reverted Learn kit).

## Phase 10 — Performance → 🟡 verify
- next/font self-hosted (no render-blocking), SSG/ISR, image fallbacks, CSP. 🔴 not Lighthouse-measured this session — should confirm scores and fix anything <95.

## Phase 11 — Implementation → ongoing per below.

---

## THE REAL DELTA (genuine, safe, additive tasks — the only worthwhile work)
- [ ] T1. Home `FAQPage` JSON-LD (reuse the existing visible home FAQ). Zero design change. SAFE.
- [ ] T2. `llms.txt`: drop "AI" word + add `/library`. Fixes a brand-rule violation. SAFE.
- [ ] T3. `Dataset` JSON-LD on `/research/state-of-supplement-stacking`. Additive. SAFE.
- [ ] T4. Answer blocks (40-60 words, key-phrase first) under H2 on `/interactions`, `/timing`, `/symptoms`, `/biomarkers`, `/best`. Adds visible content — needs founder OK (he's been cautious on visible changes).
- [ ] T5. `Organization.sameAs` — needs founder's real social URLs.
- [ ] T6. Lighthouse audit + fix any category <95.
- [ ] T7. (HELD) Learn visual redesign — founder reverted the last attempt; awaiting decision.

> Founder context (this session): prefers to go slow, reverted a big change, is cost-conscious,
> declined the small GEO wins earlier ("rien pour l'instant"). So: do NOT auto-run an 11-phase
> rebuild. Execute only the SAFE delta above, and only after a quick founder go-ahead, since it
> contradicts the earlier "hold".
