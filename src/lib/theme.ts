/**
 * suppdoc.io — design system tokens v2
 * Inspired by Stripe: light primary, navy ink, sage/amber/coral accents
 */

export const TH = {
  bg: "#f6f5f1",                         // warm off-white page background
  surface: "#ffffff",                    // pure white cards
  elevated: "#ffffff",
  edge: "rgba(10, 37, 64, 0.08)",
  edgeStrong: "rgba(10, 37, 64, 0.14)",
  ink: "#0a2540",                        // deep navy — premium, trustworthy
  inkSoft: "#3c4858",
  muted: "#6b7280",
  mutedDim: "#a0a8b3",
  sage: "#5ba373",                       // friendly sage
  sageDeep: "#3f7a52",
  amber: "#e8a04a",                      // warm gold
  amberDeep: "#b5751e",
  coral: "#ff8b6b",                      // soft coral
  lavender: "#a78bfa",                   // soft lavender
  accentGlow: "rgba(91,163,115,0.12)",
} as const;

export const FONTS = {
  display: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif',
  serifItalic: '"Instrument Serif", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
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
  description: "Tell us how you sleep, train, and feel. We build your daily stack from clean, evidence-led ingredients — in minutes.",
} as const;
