/**
 * Site-data snapshot for the content agents.
 *
 * The Growth-OS spec imagined an MCP server exposing search_site_pages /
 * get_ingredient / list_internal_links tools. We don't need a separate server:
 * the agents run inside the Next.js app, so they can read suppdoc's own corpus
 * straight from the repo's data libs. This module turns that corpus into a
 * compact text brief the agents get in their prompt, plus real URL builders so
 * every internal link an agent emits resolves to a page that actually exists.
 *
 * Twice-weekly / daily runs make the few-thousand-token snapshot a non-issue.
 */
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, interactionSlug } from "@/lib/interactions";
import { TIMING_IDS } from "@/lib/timing";
import { SYMPTOM_SLUGS } from "@/lib/symptoms";
import { BIOMARKERS } from "@/lib/biomarkers";

export const SITE_ORIGIN = "https://www.suppdoc.io";

// ─── Real URL builders (single source of truth for internal links) ──────────
export const url = {
  ingredient: (id: string) => `/ingredients/${id}`,
  interaction: (a: string, b: string) => `/interactions/${interactionSlug(a, b)}`,
  timing: (slug: string) => `/timing/${slug}`,
  symptom: (slug: string) => `/symptoms/${slug}`,
  biomarker: (marker: string, direction?: "low" | "high") =>
    direction ? `/biomarkers/${marker}/${direction}` : `/biomarkers/${marker}`,
  library: (slug: string) => `/library/${slug}`,
  tool: {
    quiz: "/quiz",
    build: "/build",
    audit: "/audit",
    bloodwork: "/bloodwork",
    interactionChecker: "/interactions",
    embed: "/embed/interaction-checker",
    pricing: "/pricing",
  },
} as const;

export interface SiteStats {
  ingredients: number;
  interactions: number;
  timing: number;
  symptoms: number;
  biomarkers: number;
}

export function siteStats(): SiteStats {
  return {
    ingredients: SUPPLEMENT_DB.length,
    interactions: INTERACTIONS.length,
    timing: TIMING_IDS.length,
    symptoms: SYMPTOM_SLUGS.length,
    biomarkers: BIOMARKERS.length,
  };
}

/** Set of interaction pairs that already have a page, as "a|b" sorted keys. */
function existingPairKeys(): Set<string> {
  const s = new Set<string>();
  for (const it of INTERACTIONS) s.add([it.a, it.b].sort().join("|"));
  return s;
}

/**
 * Build the corpus brief the agents read. Memoised: the corpus is static at
 * runtime, so we compute the string once per server instance.
 */
let _brief: string | null = null;
export function siteBrief(): string {
  if (_brief) return _brief;
  const stats = siteStats();

  const ingredientList = SUPPLEMENT_DB
    .map(s => `${s.id} (${s.name}, ${s.evidence}${s.category ? ", " + s.category : ""})`)
    .join("; ");

  const interactionList = INTERACTIONS
    .map(it => `${it.a}+${it.b} [${it.kind}] -> ${url.interaction(it.a, it.b)}`)
    .join("; ");

  const timingList = TIMING_IDS.join(", ");
  const symptomList = SYMPTOM_SLUGS.join(", ");
  const biomarkerList = BIOMARKERS.map(b => b.key.replace(/_/g, "-")).join(", ");

  _brief = [
    `suppdoc.io corpus snapshot (everything that already has a live page).`,
    `Counts: ${stats.ingredients} ingredient guides, ${stats.interactions} interaction pages, ${stats.timing} timing pages, ${stats.symptoms} symptom/deficiency pages, ${stats.biomarkers} biomarkers.`,
    ``,
    `URL patterns (use these exact shapes for every internal link):`,
    `  ingredient: /ingredients/{id}`,
    `  interaction: /interactions/{slug}  (slug listed per pair below)`,
    `  timing: /timing/{slug}`,
    `  symptom: /symptoms/{slug}`,
    `  biomarker: /biomarkers/{marker} and /biomarkers/{marker}/low|high`,
    `  published library article: /library/{slug}`,
    `Tools to link as CTAs: ${Object.values(url.tool).join(", ")}`,
    ``,
    `INGREDIENTS (id -> page is /ingredients/{id}):`,
    ingredientList,
    ``,
    `INTERACTIONS (pair -> page url):`,
    interactionList,
    ``,
    `TIMING page slugs: ${timingList}`,
    ``,
    `SYMPTOM page slugs: ${symptomList}`,
    ``,
    `BIOMARKER markers: ${biomarkerList}`,
  ].join("\n");
  return _brief;
}

/**
 * A coverage-gap hint for Trend Discovery: ingredient ids that do NOT yet
 * appear in any interaction pair, i.e. obvious "X interaction" page gaps.
 */
export function ingredientsWithoutInteraction(): string[] {
  const pairs = existingPairKeys();
  const covered = new Set<string>();
  for (const k of pairs) for (const id of k.split("|")) covered.add(id);
  return SUPPLEMENT_DB.filter(s => !covered.has(s.id)).map(s => s.id);
}

/** Whether a slug already exists in a given cluster (cheap dedupe for agents). */
export function slugExists(cluster: "ingredient" | "timing" | "symptom", slug: string): boolean {
  if (cluster === "ingredient") return SUPPLEMENT_DB.some(s => s.id === slug);
  if (cluster === "timing") return TIMING_IDS.includes(slug);
  if (cluster === "symptom") return SYMPTOM_SLUGS.includes(slug);
  return false;
}
