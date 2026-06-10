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

// ── REAL testimonials only (founder-provided early-user feedback). ───────────
// No `rating` field on purpose: these are quotes, not star reviews, so the wall
// shows no fabricated stars and emits no AggregateRating/Review schema. Add a
// numeric `rating` ONLY for genuine star reviews from real, consenting users.
export const TESTIMONIALS: Testimonial[] = [
  { quote: "SuppDoc made supplement research much easier for me. Instead of opening ten different tabs, I can check ingredients, interactions, and build a stack in one place.", name: "Fitness enthusiast", context: "United States" },
  { quote: "The interaction checker is surprisingly useful. I caught a combination I was taking without realizing it could interfere with absorption.", name: "Wellness-focused user", context: "United Kingdom" },
  { quote: "What I like most is that SuppDoc feels evidence-based instead of hype-driven. The explanations are clear and grounded in research.", name: "Biohacker", context: "Canada" },
  { quote: "I used to spend hours comparing supplements manually. SuppDoc gives me a structured view and helps me decide faster.", name: "Busy professional", context: "Germany" },
  { quote: "I like being able to build stacks around specific goals instead of getting generic supplement recommendations.", name: "Health optimization enthusiast", context: "France" },
  { quote: "The ingredient pages are detailed without being overwhelming. It's one of the few supplement tools that feels both trustworthy and easy to use.", name: "Nutrition-conscious user", context: "United States" },
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
