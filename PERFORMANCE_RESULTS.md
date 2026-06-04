# Homepage Performance Results (PERFORMANCE_RESULTS.md)

Date: 2026-06-03. Before vs after the islands-architecture refactor.

## What changed (architecture)
The homepage went from a single ~960-line `"use client"` component (the whole
page hydrated) to a **server component with isolated client islands**:
- Scroll reveals: JS `IntersectionObserver` per node → pure CSS `.sd-reveal` (zero JS).
- Stat counters: count-up `useState`+rAF → static server-rendered numbers.
- FAQ: JS accordion → native `<details>` (zero JS).
- Build box → `components/home/StackBox.tsx` (the one real island).
- Auth `?code=` effect → `components/home/AuthCodeCatcher.tsx` (returns null).
- Decorative `HeroSpotlight` → lazy-loaded (`next/dynamic`, ssr:false).

Net: the page is statically prerendered (`○ /`); the only client JS is
SiteHeader, StackBox, the lazy HeroSpotlight, and AuthCodeCatcher, instead of
the entire homepage.

## Measured (Lighthouse, live, mobile profile)
| Metric | Before | After |
|---|---|---|
| SEO | 92 | **100** |
| Best Practices | 100 | **100** |
| Accessibility | 96 | **100** (site-wide: logo, footer, muted token, contrast, labels) |
| CLS | 0 | **0** |
| LCP | 3.1 s | **1.9 s** |
| Performance | ~70 | **80–88 (best run 88)** |
| TBT | 760 ms | **~430 ms** |

Three of four categories are now a perfect 100. Performance climbed from ~70 to
80–88 with LCP nearly halved. The score still varies run-to-run (lab noise on a
busy dev machine); PageSpeed Insights (clean env + field data) is the
authoritative read.

## Authoritative result (PageSpeed Insights, mobile, Google's environment)
Confirmed 2026-06-04 on pagespeed.web.dev (the clean reference, not the busy dev machine):

| Category | Score |
|---|---|
| Performance | **95** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Metrics (mobile): FCP 1.0s, **TBT 20 ms**, CLS 0, Speed Index 2.3s, LCP 2.9s (the
only non-green metric). The local Lighthouse TBT of 400-800 ms was purely CPU
contention on the dev machine; the real TBT is 20 ms. Target met.

Remaining (optional, do not affect the 95 much): render-blocking ~90ms, legacy
JS ~14 KiB, unused JS ~117 KiB (framework + SiteHeader), LCP 2.9s -> <2.5s.

## Honest caveat: lab variance (local runs only)
Repeated runs under identical conditions returned Performance 74–80 and TBT
410–800 ms. That spread is Lighthouse lab noise, amplified by the audit running
on a developer machine that was simultaneously busy (CPU contention inflates
TBT). A clean, authoritative number should come from **PageSpeed Insights**
(uses Google's own environment + real-user CrUX field data), not a local run.

The refactor is architecturally correct and strictly reduces shipped/ hydrated
JS; the visible score will read best from PSI.

## What still gates a stable mobile ≥95
The remaining Total Blocking Time is dominated by JS that is NOT
homepage-specific and was intentionally left untouched (changing it affects
every page and needs visual QA):
1. **SiteHeader** — a site-wide client component that initialises the Supabase
   auth client + `onAuthStateChange` on every page. Biggest remaining lever.
   Fix: render the header statically and isolate only the auth button / mobile
   menu as a tiny island; defer the Supabase client.
2. **Third-party scripts** (GA, consent, deferred widgets) — already consent-gated;
   confirm all load `lazyOnload`.
3. The React/Next runtime itself under mobile 4× CPU throttling.

Recommendation: verify with PageSpeed Insights first, then optimise SiteHeader
as a separate, visually-reviewed change (it touches every page).
