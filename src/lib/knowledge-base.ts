/**
 * Compact internal-content index for the chat assistant.
 *
 * Built lazily at first call, then cached for the lifetime of the server
 * process. The full index serializes to ~22KB, fits comfortably in a single
 * system prompt and lets Claude ground every recommendation in a real
 * internal URL.
 */

import { SUPPLEMENT_DB, type Supplement } from "./supplements";
import { STACKS } from "./stacks";
import { POSTS } from "./blog";

export interface KBSupplement {
  id: string;
  name: string;
  url: string;          // /ingredients/[id]
  researchUrl: string;  // /ingredients/[id]/research
  purpose: string;
  evidence: Supplement["evidence"];
  tags: string[];       // top 5
  warnings?: string[];
  category?: string;
}

export interface KBStack {
  id: string;
  name: string;
  url: string;          // /stacks/[slug]
  tagline: string;
  bestFor: string[];
}

export interface KBPost {
  slug: string;
  title: string;
  url: string;
  excerpt: string;
  category: string;
}

export interface KnowledgeBase {
  supplements: KBSupplement[];
  stacks: KBStack[];
  posts: KBPost[];
  // Searchable token index (id+name+tags concatenated lowercase)
  searchIndex: Map<string, KBSupplement>;
}

let cached: KnowledgeBase | null = null;

export function getKnowledgeBase(): KnowledgeBase {
  if (cached) return cached;

  const supplements: KBSupplement[] = SUPPLEMENT_DB.map(s => ({
    id: s.id,
    name: s.name,
    url: `/ingredients/${s.id}`,
    researchUrl: `/ingredients/${s.id}/research`,
    purpose: s.purpose,
    evidence: s.evidence,
    tags: s.tags.slice(0, 5),
    warnings: s.warnings,
    category: s.category,
  }));

  const stacks: KBStack[] = STACKS.map(st => ({
    id: st.id,
    name: st.name,
    url: `/stacks/${st.slug}`,
    tagline: st.tagline,
    bestFor: st.bestFor.slice(0, 3),
  }));

  const posts: KBPost[] = POSTS.map(p => ({
    slug: p.slug,
    title: p.title,
    url: `/journal/${p.slug}`,
    excerpt: p.excerpt,
    category: p.category,
  }));

  const searchIndex = new Map<string, KBSupplement>();
  for (const s of supplements) searchIndex.set(s.id, s);

  cached = { supplements, stacks, posts, searchIndex };
  return cached;
}

/**
 * Detect supplement IDs mentioned in free-form text by substring matching
 * against the catalog. Returns IDs in order of first appearance.
 */
export function detectSupplementsInText(text: string): string[] {
  const kb = getKnowledgeBase();
  const lower = text.toLowerCase();
  const found: string[] = [];
  const seen = new Set<string>();

  for (const s of kb.supplements) {
    // Try multiple candidate strings: id, full name, short name
    const candidates: string[] = [s.id];
    const shortName = s.name.split(/[(,/]/)[0].trim();
    candidates.push(shortName);
    // Also try the name with hyphens removed (e.g. "L Theanine")
    candidates.push(s.name.replace(/-/g, " "));

    for (const cand of candidates) {
      if (cand.length < 3) continue;
      // Word-boundary-ish match: surround in optional non-word chars
      const needle = cand.toLowerCase();
      if (lower.includes(needle) && !seen.has(s.id)) {
        found.push(s.id);
        seen.add(s.id);
        break;
      }
    }
  }
  return found;
}

/**
 * Validate an internal URL is one of the known safe routes. Used by the
 * markdown renderer to decide whether to render a link as a citation chip
 * vs strip it. Returns null if invalid.
 */
export function validateInternalUrl(url: string): { type: "ingredient" | "stack" | "journal" | "build" | "quiz" | "audit" | "compare" | "research"; slug?: string } | null {
  if (!url.startsWith("/")) return null;

  const research = /^\/ingredients\/([a-z0-9-]+)\/research\/?$/.exec(url);
  if (research) return { type: "research", slug: research[1] };

  const ingredient = /^\/ingredients\/([a-z0-9-]+)\/?$/.exec(url);
  if (ingredient) return { type: "ingredient", slug: ingredient[1] };

  const stack = /^\/stacks\/([a-z0-9-]+)\/?$/.exec(url);
  if (stack) return { type: "stack", slug: stack[1] };

  const journal = /^\/journal\/([a-z0-9-]+)\/?$/.exec(url);
  if (journal) return { type: "journal", slug: journal[1] };

  if (/^\/(build|quiz|audit|compare|stacks|ingredients|journal)\/?$/.test(url)) {
    const type = url.slice(1).replace(/\/$/, "") as "build" | "quiz" | "audit" | "compare";
    return { type };
  }

  return null;
}

/**
 * Build the compact JSON catalog block we send to Claude in the system prompt.
 * Strips fields the model doesn't need to ground its answers.
 */
export function serializeCatalogForPrompt(): string {
  const kb = getKnowledgeBase();
  // We send a tight schema to keep tokens down (~20KB total)
  const supps = kb.supplements.map(s => ({
    id: s.id,
    name: s.name,
    purpose: s.purpose,
    ev: s.evidence,
    tags: s.tags,
    warn: s.warnings,
  }));
  const stacks = kb.stacks.map(s => ({
    id: s.id,
    name: s.name,
    url: s.url,
    tag: s.tagline,
  }));
  const posts = kb.posts.map(p => ({
    title: p.title,
    url: p.url,
    cat: p.category,
  }));
  return JSON.stringify({ supplements: supps, stacks, posts });
}

/**
 * Look up a supplement by id (used by the API for building the current-page
 * context block).
 */
export function lookupSupplement(id: string): KBSupplement | undefined {
  return getKnowledgeBase().searchIndex.get(id);
}
