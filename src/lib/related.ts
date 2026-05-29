/**
 * Relationship resolver — the semantic graph that interlinks every entity
 * (ingredient ↔ goal ↔ biomarker ↔ interaction ↔ stack ↔ research).
 *
 * Everything is *computed from existing structured data* — no generated prose,
 * no fabricated relationships. This is what turns isolated programmatic pages
 * into a tightly connected topical-authority web (and a graph AI engines can
 * traverse for retrieval).
 */
import { SUPPLEMENT_DB } from "./supplements";
import { GOALS, ingredientsForGoal, type Goal } from "./goals";
import { INTERACTIONS, interactionSlug, type Interaction } from "./interactions";
import { BIOMARKERS, type BiomarkerDef } from "./biomarkers";
import { STACKS } from "./stacks";
import { RESEARCH } from "./research";

export interface LinkRef { href: string; label: string }

export const ingName = (id: string): string =>
  SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;

const bmHref = (key: string) => `/biomarkers/${key.replace(/_/g, "-")}`;

// ─── Ingredient-centric edges ─────────────────────────────────────────────────
export function goalsForIngredient(id: string): LinkRef[] {
  const supp = SUPPLEMENT_DB.find(s => s.id === id);
  if (!supp) return [];
  return GOALS
    .filter(g => (g.tags ?? []).some(t => supp.tags.includes(t)) || (g.ids ?? []).includes(id))
    .map(g => ({ href: `/best/${g.slug}`, label: `Best for ${g.label}` }));
}

export function interactionsForIngredient(id: string): LinkRef[] {
  return INTERACTIONS
    .filter(i => i.a === id || i.b === id)
    .map(i => ({ href: `/interactions/${interactionSlug(i.a, i.b)}`, label: `with ${ingName(i.a === id ? i.b : i.a)}` }));
}

export function biomarkersForIngredient(id: string): LinkRef[] {
  return BIOMARKERS
    .filter(b => (b.supplementsForLow ?? []).includes(id) || (b.supplementsForHigh ?? []).includes(id))
    .map(b => ({ href: bmHref(b.key), label: b.label }));
}

export function stacksForIngredient(id: string): LinkRef[] {
  return STACKS.filter(st => st.supplementIds.includes(id)).map(st => ({ href: `/stacks/${st.slug}`, label: st.name }));
}

// ─── Goal-centric edges ───────────────────────────────────────────────────────
export function biomarkersForGoal(goal: Goal): LinkRef[] {
  const ids = new Set(ingredientsForGoal(goal, 12).map(s => s.id));
  const seen = new Set<string>();
  const out: LinkRef[] = [];
  for (const b of BIOMARKERS) {
    const supps = [...(b.supplementsForLow ?? []), ...(b.supplementsForHigh ?? [])];
    if (supps.some(s => ids.has(s)) && !seen.has(b.key)) { seen.add(b.key); out.push({ href: bmHref(b.key), label: b.label }); }
  }
  return out.slice(0, 6);
}

export function interactionsForGoal(goal: Goal): LinkRef[] {
  const ids = new Set(ingredientsForGoal(goal, 12).map(s => s.id));
  return INTERACTIONS
    .filter(i => ids.has(i.a) && ids.has(i.b))
    .map(i => ({ href: `/interactions/${interactionSlug(i.a, i.b)}`, label: `${ingName(i.a)} + ${ingName(i.b)}` }))
    .slice(0, 6);
}

export function relatedGoals(slug: string, limit = 5): LinkRef[] {
  const base = GOALS.find(g => g.slug === slug);
  if (!base) return [];
  const baseTags = new Set(base.tags ?? []);
  return GOALS
    .filter(g => g.slug !== slug && (g.tags ?? []).some(t => baseTags.has(t)))
    .slice(0, limit)
    .map(g => ({ href: `/best/${g.slug}`, label: `Best for ${g.label}` }));
}

// ─── Biomarker-centric edges ──────────────────────────────────────────────────
export function goalsForBiomarker(b: BiomarkerDef): LinkRef[] {
  const supps = new Set([...(b.supplementsForLow ?? []), ...(b.supplementsForHigh ?? [])]);
  const out: LinkRef[] = [];
  const seen = new Set<string>();
  for (const g of GOALS) {
    const gids = ingredientsForGoal(g, 12).map(s => s.id);
    if (gids.some(id => supps.has(id)) && !seen.has(g.slug)) { seen.add(g.slug); out.push({ href: `/best/${g.slug}`, label: `Best for ${g.label}` }); }
  }
  return out.slice(0, 5);
}

export function stacksForBiomarker(b: BiomarkerDef): LinkRef[] {
  const supps = new Set([...(b.supplementsForLow ?? []), ...(b.supplementsForHigh ?? [])]);
  return STACKS.filter(st => st.supplementIds.some(id => supps.has(id))).slice(0, 4).map(st => ({ href: `/stacks/${st.slug}`, label: st.name }));
}

export function otherBiomarkers(b: BiomarkerDef): LinkRef[] {
  return BIOMARKERS.filter(x => x.key !== b.key && x.category === b.category).slice(0, 5).map(x => ({ href: bmHref(x.key), label: x.label }));
}

// ─── Interaction-centric edges ────────────────────────────────────────────────
export function otherInteractionsFor(id: string, excludeSlug: string): LinkRef[] {
  return INTERACTIONS
    .filter(i => (i.a === id || i.b === id) && interactionSlug(i.a, i.b) !== excludeSlug)
    .map(i => ({ href: `/interactions/${interactionSlug(i.a, i.b)}`, label: `${ingName(i.a)} + ${ingName(i.b)}` }))
    .slice(0, 5);
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function ingredientLink(id: string): LinkRef { return { href: `/ingredients/${id}`, label: ingName(id) }; }
export function hasResearch(id: string): boolean { return Boolean(RESEARCH[id]); }
