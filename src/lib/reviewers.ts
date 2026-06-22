/**
 * Editorial / clinical reviewers.
 *
 * E-E-A-T: health (YMYL) content ranks far better when it carries a named,
 * credentialed reviewer. This roster drives the /team profiles, the visible
 * byline (<ReviewedBy/>) and the structured-data `reviewedBy` on content pages.
 *
 * IMPORTANT: a reviewer's byline only appears on the SPECIFIC pages they have
 * actually reviewed (see PAGE_REVIEWS). We never imply a clinician reviewed a
 * page they have not seen, so the named byline is assigned per page, not globally.
 */

const BASE = "https://www.suppdoc.io";

export interface Reviewer {
  slug: string;          // /team/[slug]
  name: string;          // "Sara Khan"
  credential: string;    // "Dietitian" | "PharmD" | "RD" | "MD"
  title?: string;        // "BSc & MPhil, Nutrition & Dietetics"
  profileUrl?: string;   // LinkedIn / PubMed / clinic page (for sameAs)
}

// ⬇️ Real, credentialed clinicians. Listed on /team and /team/[slug].
export const REVIEWERS: Reviewer[] = [
  {
    slug: "sara-khan",
    name: "Sara Khan",
    credential: "Dietitian",
    title: "BSc & MPhil, Nutrition & Dietetics",
  },
];

export const hasReviewers = REVIEWERS.length > 0;

export function reviewerBySlug(slug: string): Reviewer | undefined {
  return REVIEWERS.find(r => r.slug === slug);
}

/**
 * Which named reviewer(s) have actually reviewed a given content page.
 * Keyed by ingredient slug. Only pages listed here show a named byline.
 */
export const PAGE_REVIEWS: Record<string, string[]> = {
  ashwagandha: ["sara-khan"],
  "mag-glycinate": ["sara-khan"],
  d3k2: ["sara-khan"],
  berberine: ["sara-khan"],
  iron: ["sara-khan"],
};

/** Reviewers assigned to a specific page (empty if none). */
export function reviewersFor(pageKey?: string): Reviewer[] {
  if (!pageKey) return [];
  const slugs = PAGE_REVIEWS[pageKey];
  if (!slugs) return [];
  return slugs.map(reviewerBySlug).filter((r): r is Reviewer => Boolean(r));
}

/** Schema.org node for the page author. */
export function authorSchema() {
  return { "@type": "Organization", name: "suppdoc", url: BASE };
}

/** Schema.org `reviewedBy` for the named reviewer(s) of a SPECIFIC page. */
export function reviewedBySchemaFor(pageKey?: string) {
  const rs = reviewersFor(pageKey);
  if (!rs.length) return undefined;
  return rs.map(r => ({
    "@type": "Person",
    name: `${r.name}, ${r.credential}`,
    url: `${BASE}/team/${r.slug}`,
    ...(r.title ? { jobTitle: r.title } : {}),
    ...(r.profileUrl ? { sameAs: r.profileUrl } : {}),
  }));
}

/**
 * Site-wide `reviewedBy` for pages that have no per-page named review.
 * No reviewer covers the whole catalogue, so this stays undefined: pages
 * without a specific reviewer show our honest "reviewed against the research"
 * byline rather than claiming a named clinical review.
 */
export function reviewedBySchema(): undefined {
  return undefined;
}
