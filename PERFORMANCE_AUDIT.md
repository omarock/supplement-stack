# Homepage Performance Audit (PERFORMANCE_AUDIT.md)

Date: 2026-06-03. Measured with Lighthouse against the live home page.

## Baseline
| Metric | Value |
|---|---|
| Performance | ~70 |
| Total Blocking Time | 760 ms |
| LCP | 3.1 s |
| CLS | 0 (perfect) |
| Server response | 43 ms (excellent) |
| SEO / Best Practices / A11y | 100 / 100 / 96 |

## Root cause
Not network, not images, not server, not layout shift. The bottleneck is
**JavaScript execution + hydration**: the entire homepage was a single
`"use client"` component (`app/HomeClient.tsx`, ~960 lines). React shipped and
hydrated the whole tree on load, producing TBT 760 ms.

## What is actually interactive (everything else is static)
- **Hero Build box** — textarea + goal chips + "Build my stack" (useRouter, useState). TRUE island.
- **FAQ accordion** — useState open/close. Replaceable with native `<details>` (zero JS).
- **Stat counters** — count-up animation (useState + rAF). Replaceable with static numbers.
- **Scroll reveals** — IntersectionObserver per element (`useInView`/`Reveal`). Replaceable with CSS scroll-driven animation (`animation-timeline: view()`), zero JS.
- **Auth `?code=` catcher** — one-time `useEffect` redirect. Tiny client island returning null.
- **HeroSpotlight** — already its own client component (cursor visual). Kept.
- **SiteHeader** — already its own client component (auth/mobile nav). Kept.

Everything else (triptych links, trust strip, how-it-works, ingredients, sample
stack, testimonials, stats, CTA) is pure presentational markup that never needed
client JS.

## Plan (islands architecture)
1. Convert `HomeClient.tsx` from a client component to a **server component**.
2. Replace JS `Reveal`/`useInView` with a CSS-only `.sd-reveal` (scroll-driven, no observer, no hydration).
3. Replace the count-up `Counter` with static server-rendered numbers.
4. Replace the JS FAQ accordion with native `<details>/<summary>` (server, zero JS).
5. Extract the Build box into `components/home/StackBox.tsx` (the one real client island).
6. Move the auth `?code=` effect into `components/home/AuthCodeCatcher.tsx` (returns null).

Result: the homepage ships JS only for SiteHeader + HeroSpotlight + StackBox +
AuthCodeCatcher, instead of the whole page. Expected: large TBT drop.

See PERFORMANCE_RESULTS.md for the before/after measurement.
