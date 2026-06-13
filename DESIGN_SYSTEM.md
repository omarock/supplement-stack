# suppdoc.io — premium design & voice system

A design direction for a top-tier, trusted health brand. Grounded in the `ui-ux-pro-max` design database (closest matches: **Biohacking / Longevity** — scientific credibility + data storytelling; **Medical Clinic / Pharmacy** — Trust & Authority + Accessible & Ethical) and tailored to suppdoc's existing brand.

> This is a **direction**, not a live change. It is the system the post-launch homepage redesign (see `project_home_redesign_concept`) and every future page should follow.

---

## 1. Design DNA

| Axis | Verdict |
|---|---|
| **Feel** | Organic 2.0 + editorial minimalism. Calm, warm, credible. Not clinical-cold, not wellness-fluffy. |
| **Primary job** | Earn trust. Every screen should make an evidence-literate skeptic relax. |
| **Strategy** | Trust & Authority + Social Proof + Data-dense storytelling (show the evidence, don't claim it). |
| **One-line** | "The calm, honest second opinion." Premium like a private clinic, plain-spoken like a good doctor. |

**The premium comes from restraint, not decoration:** generous whitespace, one confident accent, real data, and impeccable typography — never gradients-for-the-sake-of-it.

---

## 2. Color system (semantic tokens)

Keep the brand. Use **semantic tokens**, never raw hex in components.

| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#f4f2ec` (warm cream) | page background — warmer and more premium than white |
| `--c-surface` | `#ffffff` | cards, raised surfaces |
| `--c-ink` | `#0c2a3f` (deep navy) | primary text, headings |
| `--c-ink-soft` | `#43586a` | body text |
| `--c-muted` | `#7d8a94` | captions, meta |
| `--c-sage` | `#3f8f63` | primary accent (buttons, links) |
| `--c-sage-deep` | `#1d6e56` (teal-green) | accent text, serif italics, hover |
| `--c-amber` | `#e0a13a` | secondary accent, "moderate evidence" |
| `--c-coral` | `#e08a63` | tertiary accent, warmth, "emerging" |
| `--c-destructive` | `#c0392b` | safety warnings only |
| `--c-edge` | `#e7e3d8` | hairline borders |

**Rules (from the skill, WCAG AA):**
- Body/background pairs ≥ **4.5:1**; large text ≥ 3:1. Navy `#0c2a3f` on cream passes comfortably; `--c-muted` is for non-essential text only.
- **Color is never the only signal.** Evidence tiers, safety flags, and states always pair color with an icon or label (colorblind-safe, YMYL-honest).
- **One signature gradient, used sparingly** — the hero band and the final CTA only: `linear-gradient(140deg,#06302a,#0e5a47 42%,#2f9070 78%,#62c194)`. Everywhere else = flat surfaces. Gradients are a moment, not a texture.
- **Dark mode** stays premium deep-navy (not black), designed as its own palette — never inverted. Contrast re-checked independently.

---

## 3. Typography

Your current stack is already a top-tier premium-editorial pairing (the skill's "Premium Sans + editorial serif" pattern, executed better than its generic suggestions). Keep it; apply it with discipline.

| Role | Font | Notes |
|---|---|---|
| Display / headings | **Bricolage Grotesque** 500–600 | confident, modern, a little characterful |
| Accent (1–3 words inside a heading) | **Instrument Serif** italic | the "premium" signature — e.g. *built for you* |
| Body / UI | **Inter** 400/500 | 16px min, line-height 1.5–1.65 |
| Numerals in data/tables | **Inter tabular** or JetBrains Mono | tabular figures so columns don't jump |

**Type scale:** 12 · 14 · 16 (body) · 18 · 22 · 26 · 32 · 40+. Weights: 400 body, 500 labels, 600 headings. Two weights of emphasis max.

**Hard rules (founder preference + premium):**
- **Sentence case everywhere.** Never ALL-CAPS, never Title Case.
- **No uppercase-mono "eyebrow" kickers** above titles or boxes — they read as AI/template. Lead with the headline. (Already swept site-wide; never reintroduce.)
- Line length 60–75 chars desktop / 35–60 mobile. One idea per paragraph.

---

## 4. Components

A consistent, restrained component language.

- **Radius scale:** 10 (chips/inputs) · 14–16 (cards) · 18–22 (feature cards/sections) · 999 (pills). One sided-border accent (e.g. left teal bar) → `border-radius: 0` on that side.
- **Elevation scale (consistent, never random):**
  - `e1` rest card: `0 1px 3px rgba(10,37,64,.04)`
  - `e2` raised: `0 12px 30px -14px rgba(8,40,30,.45)`
  - `e3` feature/hero: `0 28px 64px -28px rgba(11,58,49,.7)`
- **Buttons:** one **primary** per screen (solid sage→sageDeep, white text, pill). Secondary = white + hairline border. Min target **44×44px**, `cursor: pointer`, visible focus ring (2–3px), pressed scale `0.98`, transitions 150–250ms.
- **Badges/chips:** sentence-case display font, soft tinted bg with same-family dark text (e.g. teal text on `#e6f1ec`). Evidence badge = 3-pip strength meter + label.
- **Inputs:** visible label (never placeholder-only), helper text persists, error **below the field** stating cause + fix, validate on blur, ≥44px tall, correct mobile keyboard types.
- **Cards** carry one job each; a clear title, supporting line, and at most one action.

---

## 5. UX patterns that build trust (the core job)

From the skill's Trust & Authority + Accessible & Ethical guidance, made concrete for suppdoc:

1. **Show evidence, don't assert it.** Every claim links to its source (PubMed). Grade conservatively; when evidence is weak, say so on the page. The evidence-distribution graphic is the signature trust device.
2. **Honest social proof only.** Real counts (200 ingredients, 71,776 studies, 161 interactions), no invented testimonials, no fake star ratings. YMYL-safe.
3. **Transparency blocks.** "What we earn" (affiliate), "no house brand", reviewer byline + last-reviewed date — visible, not buried.
4. **Safety first, always reachable.** "When to see a doctor" / "Avoid if" blocks in the destructive color, never removed for aesthetics.
5. **Accessibility = table stakes for a health brand:** 4.5:1 contrast, full keyboard nav, `aria-label` on icon buttons, focus order = visual order, `prefers-reduced-motion` respected, alt text on meaningful images.
6. **Motion with meaning:** 150–300ms, transform/opacity only, enter ease-out / exit faster, stagger lists 30–50ms. Count-ups and bar-grows on the data section convey life; nothing decorative-only.
7. **One primary action per screen.** Reduce choice. The 3-card hero (quiz / build / audit) is the one place we offer three doors — keep it, but each card has a single CTA.
8. **No layout shift (CLS < 0.1):** reserve space for images/async; tabular numerals in data.

---

## 6. Voice & writing — premium, trustworthy

The way suppdoc *writes* is as much of the brand as how it looks. Target: **a brilliant doctor friend who refuses to hype.**

### Principles
1. **Plain over clever.** Short words, short sentences. If a sentence needs re-reading, cut it.
2. **Honest over impressive.** Name the limits. "Only a minority is strongly proven — and we say so" beats any superlative.
3. **Specific over vague.** "Standard dose 5000 IU D3 + 90 mcg K2, in the morning" — numbers build trust; adjectives erode it.
4. **Calm, never salesy.** No urgency tricks, no "miracle / breakthrough / fix everything", no exclamation stacking.
5. **You-first.** Talk to the reader ("your stack", "what you take"), not about ourselves.
6. **Sentence case, no kickers.** (See §3.)

### Tone by surface
- **Headlines:** confident + a touch editorial. *"The supplement stack built for you." · "Graded on the evidence, not the hype."*
- **Body:** explanatory, warm, exact.
- **CTAs:** plain verbs — "Take the quiz", "Build my stack", "Audit my stack". No "Unlock / Supercharge".
- **Safety/medical:** direct and unembellished. "This is education, not a diagnosis."

### Do / Don't
| Don't (hype/AI tell) | Do (premium/trust) |
|---|---|
| "Revolutionary AI-powered formula!" | "Matched to the published research." |
| "10,000+ happy customers" (invented) | "200 ingredients, each graded on the evidence." |
| "UNLOCK YOUR BEST SELF" | "Build a stack that actually fits you." |
| "Doctors hate this trick" | "When lifestyle is enough, we say so." |
| "The only supplement you'll ever need" | "A few proven basics cover most people." |

### Words to retire vs keep
- **Retire:** unlock, supercharge, game-changer, revolutionary, miracle, secret, hack, boost (as hype), "trusted by thousands" (unless true & specific), ALL-CAPS labels.
- **Keep:** evidence-graded, clinically studied, conservatively, honest, you can verify, when the evidence is weak, no house brand.

---

## 7. Pre-ship checklist (every new page)
- [ ] Leads with the headline — no uppercase-mono kicker
- [ ] Sentence case throughout; no hype words (§6)
- [ ] One primary CTA; 44px targets; visible focus
- [ ] Contrast ≥ 4.5:1; color never the only signal
- [ ] Claims sourced; safety blocks present; nothing fabricated
- [ ] Reduced-motion respected; no layout shift
- [ ] Light **and** dark mode checked

---
*Method: generated with the `ui-ux-pro-max` skill (product → style → color → typography → landing → UX reasoning) on 2026-06-13, then adapted to suppdoc's brand and YMYL constraints.*
