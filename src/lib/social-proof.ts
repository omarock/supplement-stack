/**
 * Single source of truth for founder identity + customer testimonials.
 *
 * INTEGRITY RULE (do not break): only REAL, consented reviews go in TESTIMONIALS.
 * Fabricated customer reviews are an FTC violation and the fastest way to destroy
 * trust on a health (YMYL) site. The premium testimonial wall + AggregateRating
 * schema activate automatically the moment this array has real entries.
 */

export type Testimonial = {
  quote: string;
  name: string;
  /** Short context, e.g. "Founding member" or "Sleep stack, 6 weeks". */
  context?: string;
  /** 1-5; omit if not a star review. Drives the aggregate rating + schema. */
  rating?: number;
  /** Optional real photo URL; when absent we render tasteful initials (never a stock photo). */
  avatarUrl?: string;
  /** Set true once you've confirmed the person is a real, consenting customer. */
  verified?: boolean;
};

// ── REAL testimonials only. Empty until we have them. ────────────────────────
// TODO(founder): paste real quotes here (even one is enough to flip the wall on),
// e.g. { quote: "...", name: "Sarah K.", context: "Founding member", rating: 5, verified: true }
export const TESTIMONIALS: Testimonial[] = [];

// ── SAMPLE testimonials: layout placeholders ONLY. ───────────────────────────
// These render ONLY on non-production (preview/dev) deployments, each visibly
// labelled "EXAMPLE", so you can see the premium wall before you have real
// quotes. They are NEVER shown on the live production site and NEVER emit review
// schema. Replace them by adding real entries to TESTIMONIALS above.
export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  { quote: "I was stacking eight things off a podcast. SuppDoc cut it to four, told me which two to drop, and linked the studies. Cleaner, and cheaper.", name: "Mara T.", context: "Energy + sleep", rating: 5 },
  { quote: "The interaction checker caught that my magnesium and zinc were competing. No one had ever told me that.", name: "Devin R.", context: "Founding member", rating: 5 },
  { quote: "What sold me: it told me a supplement I'd already bought wasn't worth it. A site that says 'skip this' is one I trust.", name: "Priya N.", context: "Stack audit", rating: 5 },
  { quote: "Bloodwork upload to a real plan in two minutes, doses and timing included. I walked into my doctor actually prepared.", name: "Jonas K.", context: "Bloodwork + plan", rating: 4 },
];

// ── Founder identity (shared by the FounderNote block AND the Organization schema).
// `as` cast so TS keeps the union (a plain `= null` annotation gets narrowed to
// `null` and flags the populated branches as unreachable).
// TODO(founder): set this to show a personal founder card + add `founder` to schema.
//   e.g. { name: "Omar Fakir", title: "Founder", photoUrl: "/founder.jpg",
//          url: "https://www.linkedin.com/in/...", note: "I built this because..." }
export const FOUNDER = null as null | {
  name: string;
  title?: string;
  photoUrl?: string;
  url?: string;
  /** Optional personal note that replaces the default team mission copy. */
  note?: string;
};

/** Average rating + count across rated testimonials, or null when there are none. */
export function aggregateRating(items: Testimonial[] = TESTIMONIALS) {
  const rated = items.filter((t) => typeof t.rating === "number");
  if (!rated.length) return null;
  const sum = rated.reduce((s, t) => s + (t.rating as number), 0);
  return { ratingValue: Math.round((sum / rated.length) * 10) / 10, reviewCount: rated.length };
}
