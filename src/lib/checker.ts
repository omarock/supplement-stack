import { INTERACTIONS, interactionSlug } from "./interactions";
import { SUPPLEMENT_DB } from "./supplements";
// Type-only import (erased at build): does NOT pull the client component, nor
// the big data DBs, into each other's bundle.
import type { CheckerOption, CheckerResult } from "@/components/InteractionChecker";

const nm = (id: string) => SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;

/**
 * Build the serializable payload for the interactive interaction checker.
 * Returns the option list (only ingredients that appear in a logged pair) and
 * a lookup keyed by the order-independent pair slug. Computed server-side; only
 * this compact data crosses to the client.
 */
export function buildCheckerData(): { options: CheckerOption[]; data: Record<string, CheckerResult> } {
  const data: Record<string, CheckerResult> = {};
  const idSet = new Set<string>();
  for (const it of INTERACTIONS) {
    const slug = interactionSlug(it.a, it.b);
    data[slug] = { kind: it.kind, summary: it.summary, advice: it.advice, slug };
    idSet.add(it.a);
    idSet.add(it.b);
  }
  const options: CheckerOption[] = [...idSet]
    .map(id => ({ id, name: nm(id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { options, data };
}

/** Headline counts for the linkbait framing. */
export function checkerStats() {
  const ingredients = new Set<string>();
  INTERACTIONS.forEach(i => { ingredients.add(i.a); ingredients.add(i.b); });
  return { pairs: INTERACTIONS.length, ingredients: ingredients.size };
}
