/**
 * suppdoc.io, design system tokens v3 (theme-aware)
 *
 * Every color resolves to a CSS variable defined in globals.css for BOTH the
 * light and dark themes. Because the whole UI styles inline from this object,
 * toggling <html data-theme="dark"> re-themes the entire app with no
 * per-component work.
 *
 * IMPORTANT: OG images (Satori / next/og) and emails do NOT import TH, they use
 * literal hex, because CSS variables and color-mix() are unsupported in those
 * renderers. Keep it that way.
 *
 * Semantic roles:
 *  - ink     = primary foreground text (light in dark mode)
 *  - inkBg   = the deep-navy band / primary-button surface; stays dark in BOTH
 *              themes so the white text that sits on it never becomes invisible
 *  - surface = card background (dark in dark mode)
 */
export const TH = {
  bg: "var(--c-bg)",                     // page background
  surface: "var(--c-surface)",           // cards
  elevated: "var(--c-elevated)",         // modals, popovers, dropdowns
  edge: "var(--c-edge)",                 // hairline borders
  edgeStrong: "var(--c-edge-strong)",    // stronger borders
  ink: "var(--c-ink)",                   // primary text
  inkBg: "var(--c-ink-bg)",              // deep-navy band / primary button bg
  inkSoft: "var(--c-ink-soft)",          // secondary text
  muted: "var(--c-muted)",               // tertiary text
  mutedDim: "var(--c-muted-dim)",        // faint labels
  sage: "var(--c-sage)",                 // friendly green
  sageDeep: "var(--c-sage-deep)",        // deep green accent / links
  amber: "var(--c-amber)",               // warm gold
  amberDeep: "var(--c-amber-deep)",      // deep gold
  coral: "var(--c-coral)",               // soft coral
  lavender: "var(--c-lavender)",         // soft lavender
  accentGlow: "var(--c-accent-glow)",    // faint sage glow
  success: "var(--c-success)",           // semantic: positive
  warning: "var(--c-warning)",           // semantic: caution
  destructive: "var(--c-destructive)",   // semantic: danger / errors
} as const;

// These reference the CSS variables defined by next/font (src/app/layout.tsx),
// self-hosted, so inline-style usages render the same self-hosted fonts as the
// stylesheet. The trailing names stay as an ultimate fallback.
export const FONTS = {
  display: 'var(--font-display), "Inter Display", system-ui, sans-serif',
  serifItalic: 'var(--font-serif), Georgia, serif',
  body: 'var(--font-sans), system-ui, sans-serif',
  mono: 'var(--font-mono), ui-monospace, monospace',
} as const;

// Convenience style snippets
export const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
export const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic", fontWeight: 400 } as const;
export const MM = { fontFamily: FONTS.mono } as const;

// Brand strings
export const BRAND = {
  name: "suppdoc.io",
  nameShort: "suppdoc",
  domain: "io",
  tagline: "The supplement stack made for just you.",
  description: "Tell us how you sleep, train, and feel. We build your daily stack from clean, evidence-led ingredients, in minutes.",
} as const;
