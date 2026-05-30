# suppdoc.io — SEO Content Roadmap

_Generated 2026-05-30. A prioritized plan to grow organic traffic and topical authority, built on the existing 39 blog posts, 151 ingredient pages, 18 goal pages, and 10 comparison pages._

---

## 0. Fix first (bugs found during the audit)

These cost rankings today and are quick:

1. **Duplicate slug `/best-supplements-for-anxiety`** — two different posts use the same slug ("7 Evidence-Backed Options" and "Without Sedation"). This causes a routing collision and keyword cannibalization. **Fix:** keep one as the canonical pillar; re-slug the other (e.g. `/best-supplements-for-anxiety-without-sedation`) or merge them. Pick the stronger article as the canonical and 301 the other.
2. **`sameAs` is still empty** in the Organization JSON-LD (`layout.tsx`). Add real social profile URLs once they exist — it strengthens the brand knowledge panel.
3. **Reviewer roster (`reviewers.ts`) is empty.** Named clinician review is the single biggest YMYL/E-E-A-T lever for a health site. Highest-impact non-content task.

---

## 1. Strategy: pillar + cluster model

Organize everything around **goal pillars** that already exist as `/best/[goal]` pages. Each pillar links down to supporting blog posts, ingredient pages, and a stack; every supporting post links back up to its pillar and across to sibling posts. This concentrates authority and creates the internal-link web Google rewards.

**Funnel each cluster drives:** blog post → ingredient/product page → quiz or stack → affiliate click / Premium.

Pillars (map to existing `/best/[goal]`): Sleep · Energy · Focus · Stress · Recovery · Immunity · Hormones (M/F) · Gut · Heart · Joint · Longevity · Skin/Hair.

---

## 2. Content gaps → prioritized backlog

Ranked by **ROI = (search intent × ease of ranking) ÷ effort**. "Easy" = we already have the ingredient/product pages to link to and strong topical authority.

### 🔴 Tier 1 — highest ROI, easiest wins (do next, ~10 articles)
Bottom-funnel, commercial intent, directly tied to existing pages:

| Article | Why it ranks / converts |
|---|---|
| Best time to take magnesium (and what to avoid) | High-volume "best time to take X" pattern; links to magnesium ingredient + product |
| Collagen: does it actually work for skin & joints? | Big search volume, we have collagen pages; honest-take angle fits brand |
| CoQ10 and statins: why your doctor might suggest it | High-intent, low competition, trust-building; links CoQ10 pages |
| Zinc for immunity & testosterone: dose and timing | Two intents, existing zinc pages |
| Vitamin B12 for vegans & energy: signs you're low | Ties to vegan pillar + bloodwork tool |
| Taurine and longevity: what the 2023 research showed | Trending; we have taurine research entry |
| Glycine for sleep: the underrated option | We have glycine research; sleep pillar |
| Lion's mane for focus & memory: honest evidence | Just added research entry; focus pillar |
| Tongkat Ali for testosterone: hype vs evidence | Trending men's-health term, honest angle |
| Curcumin absorption: why BioPerine/phytosome matters | Buyer-intent "which curcumin to buy" |

### 🟠 Tier 2 — bloodwork-interpretation cluster (unique moat)
Low competition, high trust, and it funnels into your **bloodwork tool** (a differentiator competitors lack):

- "Ferritin levels explained: low, optimal, and what to do"
- "Vitamin D blood levels: what's actually optimal?"
- "B12 levels: deficient, 'normal', and truly optimal"
- "Homocysteine, hs-CRP, HbA1c: 3 markers worth tracking"
- Each links to `/biomarkers/[marker]` + `/bloodwork` + relevant supplements.

### 🟡 Tier 3 — comparison cluster (your best-converting format)
You already rank well with "X vs Y." Extend it:

- "Magnesium glycinate vs L-threonate vs citrate" (consolidate the two existing into one definitive guide)
- "Creatine monohydrate vs HCl vs creatine gummies"
- "Whey vs plant protein vs collagen"
- "Melatonin vs magnesium vs glycine for sleep"

### 🟢 Tier 4 — authority / population content (slower, builds trust)
- "Supplements after 50: what changes"
- "Supplements for students (focus, exams, sleep)"
- "Prenatal supplements: what's evidence-based" (note YMYL — needs reviewer sign-off)
- "Drug–nutrient interactions everyone should know" (ties to `/interactions` tool)

---

## 3. Internal-linking rules (apply to every new + existing post)

1. **Link up** to the goal pillar (`/best/[goal]`) in the intro.
2. **Link down** to every ingredient mentioned (`/ingredients/[slug]`) on first mention.
3. **Link across** to 2–3 sibling posts in the same cluster ("Related reading").
4. **Funnel out** with one CTA to the quiz, the audit, or the bloodwork tool — matched to intent (sleep post → sleep stack; biomarker post → bloodwork tool).
5. Every comparison post links to the relevant `/compare/[slug]` and product pages.

The `related.ts` resolver + `RelatedContent` component already exist — ensure each new post is wired into them.

---

## 4. Suggested cadence

- **Weeks 1–2:** fix the duplicate slug + publish Tier 1 (1–2/week from existing ingredient data — fast because the research is already in `research.ts`/`supplements.ts`).
- **Weeks 3–6:** bloodwork cluster (Tier 2) — highest moat.
- **Ongoing:** Tier 3 comparisons (high conversion), then Tier 4 authority pieces once a clinical reviewer is onboarded.

**Measurement:** after ~2–4 weeks of GSC/Bing data, double down on whichever Tier 1 posts gain impressions; prune or rewrite any that don't.
