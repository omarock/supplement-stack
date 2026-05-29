/**
 * Editorial / clinical reviewers.
 *
 * E-E-A-T: health (YMYL) content ranks far better when it carries a named,
 * credentialed reviewer. This roster drives both the visible byline
 * (<ReviewedBy/>) and the structured-data `reviewedBy` on content pages.
 *
 * HOW TO ACTIVATE: once you've recruited a real reviewer, add them here. The
 * byline and schema upgrade automatically across every content page. Until
 * then, the byline shows an honest "reviewed against the research" statement
 * and pages are authored by the organisation — no fabricated names.
 */

export interface Reviewer {
  slug: string;          // /team/[slug]
  name: string;          // "Dr. Jane Smith"
  credential: string;    // "PharmD" | "RD" | "MD"
  title?: string;        // "Clinical Pharmacist"
  profileUrl?: string;   // LinkedIn / PubMed / clinic page (for sameAs)
}

// ⬇️ Add real clinicians here to activate named review across the site.
export const REVIEWERS: Reviewer[] = [];

export const hasReviewers = REVIEWERS.length > 0;

/** Schema.org node for the page author. */
export function authorSchema() {
  return { "@type": "Organization", name: "suppdoc", url: "https://www.suppdoc.io" };
}

/** Schema.org `reviewedBy` — Person(s) if we have real reviewers, else omit. */
export function reviewedBySchema() {
  if (!hasReviewers) return undefined;
  return REVIEWERS.map(r => ({
    "@type": "Person",
    name: `${r.name}, ${r.credential}`,
    ...(r.title ? { jobTitle: r.title } : {}),
    ...(r.profileUrl ? { sameAs: r.profileUrl } : {}),
  }));
}
