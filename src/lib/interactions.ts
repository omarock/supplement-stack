/**
 * Supplement interaction dataset — powers the programmatic /interactions/[pair]
 * pages and grounds the audit engine. Each entry is a real, well-documented
 * pairwise relationship using ids that exist in SUPPLEMENT_DB.
 *
 * Honest by design: we only publish a page for a pair we have something real to
 * say about (no thin "no known interaction" filler).
 */

export type InteractionKind = "synergy" | "timing" | "caution" | "redundant";

export interface Interaction {
  a: string;            // supplement id
  b: string;            // supplement id
  kind: InteractionKind;
  summary: string;      // one-line verdict
  detail: string;       // why it happens (1-2 sentences, plain English)
  advice: string;       // what to do
  evidence: "strong" | "moderate" | "emerging";
}

export const KIND_META: Record<InteractionKind, { label: string; verdict: string; hue: string; bg: string }> = {
  synergy:   { label: "Works better together", verdict: "Take together", hue: "#3f7a52", bg: "#f0f9f3" },
  timing:    { label: "Separate the timing",   verdict: "Space them apart", hue: "#b5751e", bg: "#fffbeb" },
  caution:   { label: "Use with caution",      verdict: "Check with a clinician", hue: "#b91c1c", bg: "#fef2f2" },
  redundant: { label: "Redundant together",    verdict: "Pick one", hue: "#6b4fc7", bg: "#f4f1ff" },
};

export const INTERACTIONS: Interaction[] = [
  { a: "iron", b: "calcium", kind: "timing", evidence: "strong",
    summary: "Calcium blocks iron absorption by up to ~50%.",
    detail: "Calcium competes with non-heme iron for absorption in the gut, so taking them together blunts how much iron you actually absorb.",
    advice: "Take iron on an empty stomach (with vitamin C); take calcium with a different meal, at least 2 hours apart." },
  { a: "iron", b: "vit-c", kind: "synergy", evidence: "strong",
    summary: "Vitamin C dramatically boosts iron absorption.",
    detail: "Vitamin C converts iron into a more absorbable form and counteracts dietary inhibitors, increasing uptake several-fold.",
    advice: "Take them together — pair your iron with ~200 mg vitamin C or a citrus food for the best effect." },
  { a: "iron", b: "zinc", kind: "timing", evidence: "moderate",
    summary: "High-dose iron and zinc compete for absorption.",
    detail: "Taken together in large doses they share absorption pathways and can reduce each other's uptake.",
    advice: "Separate them by a couple of hours — e.g. iron in the morning, zinc with dinner." },
  { a: "calcium", b: "mag-glycinate", kind: "timing", evidence: "moderate",
    summary: "Large calcium and magnesium doses can compete.",
    detail: "At high doses calcium and magnesium use overlapping transport, so mega-dosing both at once is less efficient.",
    advice: "Modest doses together are fine; if you take large amounts, split them across the day." },
  { a: "coq10", b: "ubiquinol", kind: "redundant", evidence: "strong",
    summary: "CoQ10 and ubiquinol are the same nutrient.",
    detail: "Ubiquinol is simply the reduced (active) form of CoQ10 — taking both is paying twice for one nutrient.",
    advice: "Pick one: ubiquinol if you're over 40 or want higher bioavailability, regular CoQ10 if you're younger or cost-conscious." },
  { a: "omega3", b: "omega3-algae", kind: "redundant", evidence: "strong",
    summary: "Two omega-3 sources doing the same job.",
    detail: "Fish oil and algae oil both deliver EPA/DHA — stacking them just overlaps.",
    advice: "Choose one: fish oil for cost and higher EPA, algae oil if you're vegan or fish-allergic." },
  { a: "5-htp", b: "tryptophan", kind: "caution", evidence: "moderate",
    summary: "Both raise serotonin — combining is rarely needed.",
    detail: "5-HTP and L-tryptophan act at different points of the same serotonin pathway; together they can push serotonin too far, especially with antidepressants.",
    advice: "Use one, not both. If you take an SSRI/SNRI, talk to your doctor before either." },
  { a: "nmn", b: "tmg", kind: "synergy", evidence: "emerging",
    summary: "TMG replaces methyl groups NMN uses up.",
    detail: "Making NAD+ from NMN consumes methyl groups; TMG (betaine) donates them back, which may prevent a methylation shortfall.",
    advice: "Many people pair NMN with ~1 g TMG daily. Sensible, low-risk combination." },
  { a: "nr", b: "tmg", kind: "synergy", evidence: "emerging",
    summary: "TMG supports methylation alongside NR.",
    detail: "Like NMN, NR raises NAD+ and can draw on methyl groups; TMG helps replenish them.",
    advice: "Pairing NR with TMG is a common, reasonable longevity stack choice." },
  { a: "ashwagandha", b: "rhodiola", kind: "timing", evidence: "moderate",
    summary: "One calming, one stimulating adaptogen.",
    detail: "Ashwagandha is calming (good for evening); rhodiola is energizing (good for morning). Taken together they can pull in opposite directions.",
    advice: "Take rhodiola in the morning and ashwagandha in the evening rather than at the same time." },
  { a: "mag-glycinate", b: "mag-citrate", kind: "redundant", evidence: "strong",
    summary: "Two magnesium forms — usually one is enough.",
    detail: "Glycinate is gentle and calming; citrate is more laxative. Stacking both mostly adds elemental magnesium and GI effects.",
    advice: "Pick the form for your goal: glycinate for sleep/stress, citrate for constipation." },
  { a: "mag-glycinate", b: "mag-threonate", kind: "redundant", evidence: "moderate",
    summary: "Overlapping magnesium forms.",
    detail: "Threonate is marketed for cognition, glycinate for sleep/stress — but both raise total magnesium and rarely need to be combined.",
    advice: "Choose one based on your primary goal to avoid excess magnesium." },
  { a: "omega3", b: "ginkgo", kind: "caution", evidence: "moderate",
    summary: "Both can thin the blood.",
    detail: "Omega-3 and ginkgo each have mild anti-platelet effects; combined — especially with blood thinners — they may raise bleeding risk.",
    advice: "Fine for most people at normal doses, but check with your doctor if you take anticoagulants or have surgery coming up." },
  { a: "omega3", b: "nattokinase", kind: "caution", evidence: "moderate",
    summary: "Compounded blood-thinning effect.",
    detail: "Nattokinase has fibrinolytic activity and omega-3 is mildly anti-platelet; together they can meaningfully affect clotting.",
    advice: "Avoid combining without medical guidance if you take blood thinners or have a bleeding disorder." },
  { a: "berberine", b: "chromium", kind: "synergy", evidence: "moderate",
    summary: "Both support healthy blood sugar.",
    detail: "Berberine improves insulin signalling and chromium supports glucose metabolism — complementary mechanisms.",
    advice: "Reasonable to pair for metabolic support. Monitor closely if you take diabetes medication." },
  { a: "mag-glycinate", b: "d3k2", kind: "synergy", evidence: "moderate",
    summary: "Magnesium helps your body use vitamin D.",
    detail: "The enzymes that activate vitamin D depend on magnesium, so adequate magnesium helps D3 work properly.",
    advice: "A good foundational pairing — take D3+K2 in the morning and magnesium in the evening." },
  { a: "curcumin", b: "omega3", kind: "synergy", evidence: "moderate",
    summary: "Complementary anti-inflammatory effects.",
    detail: "Curcumin and omega-3 dampen inflammation through different pathways, which can add up.",
    advice: "Safe, common combination for joint and recovery support." },
  { a: "green-tea", b: "iron", kind: "timing", evidence: "moderate",
    summary: "Green tea tannins inhibit iron absorption.",
    detail: "Polyphenols in green tea bind non-heme iron and reduce how much you absorb.",
    advice: "Keep green tea and iron at least 1–2 hours apart." },
  { a: "l-theanine", b: "green-tea", kind: "synergy", evidence: "moderate",
    summary: "Calm, focused energy together.",
    detail: "L-theanine smooths the stimulation from green tea's caffeine, giving focus without the jitters.",
    advice: "A classic pairing for calm focus — fine to take together." },
  { a: "zinc", b: "vit-c", kind: "synergy", evidence: "moderate",
    summary: "Immune-support pairing.",
    detail: "Zinc and vitamin C support different parts of immune function and are commonly combined, especially at the first sign of a cold.",
    advice: "Safe together; take zinc with food to avoid nausea." },
  { a: "ashwagandha", b: "melatonin", kind: "synergy", evidence: "moderate",
    summary: "Both support sleep, different ways.",
    detail: "Ashwagandha lowers cortisol/stress while melatonin cues sleep timing — complementary for sleep onset.",
    advice: "Reasonable evening pairing. Start melatonin low (0.5–1 mg)." },
  { a: "selenium", b: "iodine", kind: "synergy", evidence: "moderate",
    summary: "Thyroid pairing — but balance matters.",
    detail: "Both are needed for thyroid hormone production and conversion; selenium also protects the thyroid when iodine is supplemented.",
    advice: "Useful together for thyroid support, but don't mega-dose iodine — check with a clinician if you have thyroid disease." },
];

/** Canonical slug for a pair, order-independent. */
export function interactionSlug(a: string, b: string): string {
  return [a, b].sort().join("-and-");
}

/** Find an interaction by two ids, in either order. */
export function findInteraction(a: string, b: string): Interaction | undefined {
  return INTERACTIONS.find(i => (i.a === a && i.b === b) || (i.a === b && i.b === a));
}

/** Find an interaction by its canonical slug. */
export function interactionBySlug(slug: string): Interaction | undefined {
  return INTERACTIONS.find(i => interactionSlug(i.a, i.b) === slug);
}
