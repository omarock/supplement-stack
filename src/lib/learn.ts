/**
 * Derivation helpers for the Learn UI kit. These turn data suppdoc already has
 * (purpose, tags, interactions) into the new visual modules. They never invent
 * facts, they only relabel and filter existing fields, so the YMYL safety rule
 * stays intact.
 */
import type { Supplement } from "@/lib/supplements";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, interactionSlug, KIND_META } from "@/lib/interactions";

/** "Energy · bone · immune" -> ["Energy", "Bone", "Immune"] (deduped, capitalised). */
export function benefitsFromPurpose(purpose: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of purpose.split(/[·,/|]/)) {
    const b = raw.trim().replace(/\(.*?\)/g, "").trim();
    if (!b) continue;
    const label = b.charAt(0).toUpperCase() + b.slice(1);
    const key = label.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(label); }
  }
  return out.slice(0, 6);
}

// Internal matching tags -> human "who should consider it" profiles. Only tags
// in this map render, so internal-only tags (general, female, vegan-only, etc.)
// never leak into the UI.
const PROFILE_MAP: Record<string, string> = {
  "low-energy": "Low energy or fatigue",
  "low-mood": "Low mood",
  "brain-fog": "Brain fog",
  focus: "Focus and concentration",
  stress: "Stress and tension",
  sleep: "Trouble sleeping",
  immune: "Immune support",
  joint: "Joint comfort",
  heart: "Heart health",
  bone: "Bone health",
  longevity: "A focus on longevity",
  recovery: "Training recovery",
  weight: "Weight management",
  gut: "Digestive health",
  hormonal: "Hormonal balance",
  skin: "Skin, hair, and nails",
};
export function profilesFromTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const label = PROFILE_MAP[t];
    if (label && !seen.has(label)) { seen.add(label); out.push(label); }
  }
  return out.slice(0, 6);
}

export interface Synergy { name: string; summary: string; verdict: string; evidence: string; href: string }
/** Real "works well with" pairs from the interaction data (synergy kind only). */
export function synergiesFor(id: string): Synergy[] {
  const nameOf = (x: string) => SUPPLEMENT_DB.find(s => s.id === x)?.name.split(" (")[0] ?? x;
  return INTERACTIONS
    .filter(i => (i.a === id || i.b === id) && i.kind === "synergy")
    .map(i => {
      const other = i.a === id ? i.b : i.a;
      return { name: nameOf(other), summary: i.summary, verdict: KIND_META.synergy.verdict, evidence: i.evidence, href: `/interactions/${interactionSlug(i.a, i.b)}` };
    })
    .slice(0, 6);
}

export interface CtaSpec { eyebrow: string; title: string; sub: string; href: string; cta: string; tone: "sage" | "ink" | "amber" }

/** The single best end-of-page action for this ingredient. */
export function pickContextualCTA(supp: Supplement, hasBiomarkers: boolean): CtaSpec {
  const name = supp.name.split(" (")[0];
  const t = new Set(supp.tags);
  if (hasBiomarkers)
    return { eyebrow: "Check your levels", title: `Do you actually need ${name}?`, sub: "Upload your bloodwork and get evidence led guidance on what to take, and what to skip.", href: "/bloodwork", cta: "Analyze my bloodwork →", tone: "ink" };
  if (t.has("sleep"))
    return { eyebrow: "Sleep better", title: `Build a sleep stack with ${name}`, sub: "Answer a few questions and we compose a calm, evidence led routine in minutes.", href: "/quiz", cta: "Take the quiz →", tone: "sage" };
  if (t.has("stress") || t.has("low-mood"))
    return { eyebrow: "Calm and focus", title: `Build a stack around ${name}`, sub: "Tell us how you feel and we match the right ingredients to your goals.", href: "/quiz", cta: "Take the quiz →", tone: "sage" };
  if (t.has("recovery") || t.has("performance"))
    return { eyebrow: "Train and recover", title: `Fit ${name} into a recovery stack`, sub: "Get a personalised stack matched to your training and your goals.", href: "/quiz", cta: "Take the quiz →", tone: "sage" };
  return { eyebrow: "Make it personal", title: `Not sure if ${name} is right for you?`, sub: "Take the quiz. We compose a personalised stack that fits your goals, body, and budget, in minutes.", href: "/quiz", cta: "Take the quiz →", tone: "amber" };
}

/** A mid-page nudge, only when there is a real "audit your stack" angle. */
export function pickMidCTA(supp: Supplement, hasInteractions: boolean): CtaSpec | null {
  if (!hasInteractions) return null;
  const name = supp.name.split(" (")[0];
  return { eyebrow: "Already taking this?", title: `Check ${name} against your other supplements`, sub: "Paste your current stack and we flag interactions and timing in seconds, free.", href: "/audit", cta: "Audit my stack →", tone: "sage" };
}
