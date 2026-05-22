import { QuizData } from "@/types/quiz";
import { iherbLink } from "./iherb";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Supplement {
  id: string;
  name: string;
  brand: string;
  dose: string;
  timing: "morning" | "midday" | "evening" | "pre-train";
  purpose: string;
  why: string;
  evidence: "very strong" | "strong" | "moderate";
  monthlyCost: number;
  hue: string;
  tags: string[];           // positive matching tags
  vegan: boolean;
  iherbSearch: string;      // search term used to build the affiliate link
  warnings?: string[];      // condition-tags that EXCLUDE this supp
  priority?: number;        // higher = stronger preference within tier (0-10)
}

export interface WellnessScores {
  energy: number;
  sleep: number;
  recovery: number;
  focus: number;
  stress: number;
  mood: number;
}

export interface Recommendation {
  supplements: Supplement[];
  scores: WellnessScores;
  totalMonthlyCost: number;
  reasoning: string[];
  notes: string[];          // safety notes / advisories
}

// ─── Supplement Database (25 supplements, all available on iHerb) ────────────
export const SUPPLEMENT_DB: Supplement[] = [
  // ── Foundational ─────────────────────────────────────────────────────────
  {
    id: "d3k2", name: "Vitamin D3 + K2", brand: "Sports Research",
    dose: "5000 IU D3 + 90 mcg K2", timing: "morning",
    purpose: "Energy · bone · immune", evidence: "strong", monthlyCost: 12,
    why: "Supports mood, immune function, bone health, and calcium routing. Especially valuable indoors or above 40° latitude.",
    hue: "#c4944a", priority: 9,
    tags: ["energy", "immune", "general", "low-energy", "low-mood", "longevity", "female", "male", "bone"],
    vegan: false,
    iherbSearch: "Sports Research Vitamin D3 K2",
  },
  {
    id: "omega3", name: "Omega-3 Fish Oil (Triglyceride)", brand: "Sports Research",
    dose: "1250 mg EPA+DHA", timing: "morning",
    purpose: "Heart · brain · inflammation",
    evidence: "very strong", monthlyCost: 22, priority: 9,
    why: "High-EPA fish oil supports cardiovascular health, brain function, mood, and the inflammation curve after training.",
    hue: "#d4a96a",
    tags: ["focus", "recovery", "general", "weight", "stress", "brain-fog", "low-mood", "joint", "longevity", "heart"],
    vegan: false,
    iherbSearch: "Sports Research Omega-3 Fish Oil Triple Strength",
    warnings: ["blood-thinners"],
  },
  {
    id: "omega3-algae", name: "Algae Omega-3 EPA/DHA", brand: "Ovega-3",
    dose: "500 mg EPA+DHA", timing: "morning",
    purpose: "Heart · brain · inflammation (vegan)",
    evidence: "strong", monthlyCost: 28, priority: 8,
    why: "Plant-based EPA/DHA from algae — the same omega-3s as fish oil, since fish get them from algae in the first place.",
    hue: "#688a6b",
    tags: ["focus", "recovery", "general", "stress", "brain-fog", "vegan-only", "joint", "longevity", "heart"],
    vegan: true,
    iherbSearch: "Ovega-3 Algae Omega-3",
    warnings: ["fish-allergy", "blood-thinners"],
  },
  {
    id: "multivit", name: "Whole-food Multivitamin", brand: "Garden of Life",
    dose: "1 capsule", timing: "morning",
    purpose: "Baseline nutrition",
    evidence: "moderate", monthlyCost: 25, priority: 5,
    why: "Covers micronutrient gaps from imperfect nutrition. A reliable foundation when you can't be sure your diet's complete.",
    hue: "#d4a96a",
    tags: ["general", "longevity"],
    vegan: true,
    iherbSearch: "Garden of Life Vitamin Code mykind Organics Multivitamin",
  },

  // ── Sleep & nervous system ───────────────────────────────────────────────
  {
    id: "mag-glycinate", name: "Magnesium Glycinate", brand: "Doctor's Best",
    dose: "400 mg elemental", timing: "evening",
    purpose: "Sleep · stress · muscle relaxation",
    evidence: "strong", monthlyCost: 14, priority: 9,
    why: "Bioavailable, gentle, non-laxative magnesium. Supports deep sleep, calms the nervous system, eases muscle tension.",
    hue: "#7a6d92",
    tags: ["sleep", "stress", "recovery", "low-sleep", "high-stress", "general", "anxiety", "muscle-tension", "wake-at-night"],
    vegan: true,
    iherbSearch: "Doctor's Best High Absorption Magnesium Glycinate",
  },
  {
    id: "ashwagandha", name: "Ashwagandha KSM-66", brand: "Jarrow Formulas",
    dose: "600 mg standardised", timing: "evening",
    purpose: "Stress · cortisol · sleep onset",
    evidence: "strong", monthlyCost: 17, priority: 8,
    why: "A clinically-studied adaptogen that lowers cortisol under chronic stress while preserving daytime alertness.",
    hue: "#a3604a",
    tags: ["stress", "sleep", "high-stress", "low-sleep", "anxiety", "sleep-onset", "male", "active"],
    vegan: true,
    iherbSearch: "Jarrow Formulas Ashwagandha KSM-66",
    warnings: ["pregnant", "thyroid", "autoimmune"],
  },
  {
    id: "l-theanine", name: "L-Theanine (Suntheanine)", brand: "Now Foods",
    dose: "200 mg", timing: "midday",
    purpose: "Calm focus · stress",
    evidence: "strong", monthlyCost: 12, priority: 7,
    why: "Promotes alpha brain waves — calm, focused energy without sedation. Pairs beautifully with coffee.",
    hue: "#688a6b",
    tags: ["focus", "stress", "high-stress", "anxiety", "brain-fog", "poor-focus"],
    vegan: true,
    iherbSearch: "Now Foods L-Theanine Suntheanine 200mg",
  },
  {
    id: "glycine", name: "Glycine", brand: "Now Foods",
    dose: "3 g", timing: "evening",
    purpose: "Sleep depth · core body temperature",
    evidence: "moderate", monthlyCost: 11, priority: 6,
    why: "Lowers core body temperature at night to deepen sleep. Helps with sleep onset and quality of restorative sleep.",
    hue: "#7a6d92",
    tags: ["sleep", "low-sleep", "wake-at-night", "sleep-onset"],
    vegan: true,
    iherbSearch: "Now Foods Glycine Powder",
  },

  // ── Energy, focus, cognition ─────────────────────────────────────────────
  {
    id: "b12", name: "Methyl-B12", brand: "Jarrow Formulas",
    dose: "1000 mcg", timing: "morning",
    purpose: "Energy · nerves · cognition",
    evidence: "very strong", monthlyCost: 10, priority: 9,
    why: "Essential for energy production and red blood cell formation. Plant-based diets need it — period.",
    hue: "#c4944a",
    tags: ["energy", "vegan", "vegetarian", "low-energy", "brain-fog", "longevity"],
    vegan: true,
    iherbSearch: "Jarrow Formulas Methyl B-12 Methylcobalamin",
  },
  {
    id: "b-complex", name: "B-Complex", brand: "Thorne",
    dose: "1 capsule (active forms)", timing: "morning",
    purpose: "Energy · stress · methylation",
    evidence: "strong", monthlyCost: 22, priority: 7,
    why: "Methylated B-vitamins support energy metabolism, stress response, and methylation pathways.",
    hue: "#c4944a",
    tags: ["energy", "stress", "low-energy", "high-stress", "brain-fog", "longevity", "afternoon-crash"],
    vegan: true,
    iherbSearch: "Thorne Basic B Complex",
  },
  {
    id: "rhodiola", name: "Rhodiola Rosea", brand: "Now Foods",
    dose: "500 mg standardised", timing: "morning",
    purpose: "Energy · stress resilience · fatigue",
    evidence: "moderate", monthlyCost: 15, priority: 6,
    why: "Adaptogen that supports mental performance under fatigue and helps the body adapt to stress.",
    hue: "#a3604a",
    tags: ["energy", "stress", "focus", "low-energy", "afternoon-crash", "high-stress", "low-motivation"],
    vegan: true,
    iherbSearch: "Now Foods Rhodiola 500mg",
    warnings: ["pregnant", "bipolar"],
  },
  {
    id: "lions-mane", name: "Lion's Mane Mushroom", brand: "Host Defense",
    dose: "1000 mg", timing: "morning",
    purpose: "Cognition · neuroplasticity · focus",
    evidence: "moderate", monthlyCost: 24, priority: 5,
    why: "Functional mushroom that supports nerve growth factor (NGF) and may enhance cognition, memory, and focus.",
    hue: "#a3604a",
    tags: ["focus", "brain-fog", "poor-focus", "memory", "longevity"],
    vegan: true,
    iherbSearch: "Host Defense Lion's Mane",
  },

  // ── Recovery & performance ───────────────────────────────────────────────
  {
    id: "creatine", name: "Creatine Monohydrate", brand: "Optimum Nutrition",
    dose: "5 g micronised", timing: "morning",
    purpose: "Strength · cognition · recovery",
    evidence: "very strong", monthlyCost: 10, priority: 9,
    why: "The most-studied supplement on earth. Improves strength output, recovery, and short-term cognition. Yes — even for women.",
    hue: "#688a6b",
    tags: ["recovery", "focus", "active", "very-active", "memory", "strength", "general", "longevity"],
    vegan: true,
    iherbSearch: "Optimum Nutrition Creatine Monohydrate Micronized",
  },
  {
    id: "collagen", name: "Collagen Peptides", brand: "Sports Research",
    dose: "10 g", timing: "morning",
    purpose: "Skin · hair · nails · joints",
    evidence: "strong", monthlyCost: 28, priority: 6,
    why: "Type I & III collagen from grass-fed beef. Supports skin elasticity, hair strength, nail growth, and joint repair.",
    hue: "#d4a96a",
    tags: ["skin", "hair", "joint", "joint-pain", "recovery", "longevity", "beauty"],
    vegan: false,
    iherbSearch: "Sports Research Collagen Peptides",
  },
  {
    id: "curcumin", name: "Curcumin (with BioPerine)", brand: "Doctor's Best",
    dose: "500 mg + 5 mg piperine", timing: "morning",
    purpose: "Inflammation · joint · recovery",
    evidence: "strong", monthlyCost: 18, priority: 6,
    why: "Bioavailable curcumin paired with piperine for absorption. Strong evidence for joint comfort and inflammation modulation.",
    hue: "#c4944a",
    tags: ["joint", "joint-pain", "inflammation", "recovery", "very-active", "longevity"],
    vegan: true,
    iherbSearch: "Doctor's Best Curcumin Bioperine",
    warnings: ["blood-thinners"],
  },
  {
    id: "glucosamine", name: "Glucosamine + Chondroitin + MSM", brand: "Now Foods",
    dose: "1500 / 1200 / 500 mg", timing: "morning",
    purpose: "Cartilage · joint comfort",
    evidence: "moderate", monthlyCost: 20, priority: 5,
    why: "Classic joint triad. Helps maintain cartilage matrix and may reduce stiffness over 8–12 weeks of consistent use.",
    hue: "#688a6b",
    tags: ["joint", "joint-pain"],
    vegan: false,
    iherbSearch: "Now Foods Glucosamine Chondroitin MSM",
    warnings: ["shellfish-allergy"],
  },

  // ── Immune & gut ─────────────────────────────────────────────────────────
  {
    id: "vit-c", name: "Vitamin C (Buffered)", brand: "Nature's Way",
    dose: "1000 mg", timing: "morning",
    purpose: "Immune · antioxidant · collagen synthesis",
    evidence: "strong", monthlyCost: 9, priority: 6,
    why: "Immune support, antioxidant defense, and collagen synthesis. Buffered form is gentler on the stomach.",
    hue: "#c4944a",
    tags: ["immune", "general", "skin", "frequent-illness"],
    vegan: true,
    iherbSearch: "Nature's Way Vitamin C Buffered",
  },
  {
    id: "zinc", name: "Zinc Picolinate", brand: "Thorne",
    dose: "15 mg", timing: "evening",
    purpose: "Immune · hormones · skin",
    evidence: "strong", monthlyCost: 9, priority: 7,
    why: "Critical for immune function, testosterone synthesis, taste, and skin health. Most modern diets fall short.",
    hue: "#7a6d92",
    tags: ["immune", "general", "male", "active", "skin", "frequent-illness", "hair"],
    vegan: true,
    iherbSearch: "Thorne Zinc Picolinate 15mg",
  },
  {
    id: "elderberry", name: "Elderberry Extract", brand: "Sambucol",
    dose: "1 tsp / 5 mL", timing: "morning",
    purpose: "Immune support · seasonal",
    evidence: "moderate", monthlyCost: 16, priority: 4,
    why: "Black elderberry extract may shorten upper respiratory illness duration when taken at first symptom.",
    hue: "#a3604a",
    tags: ["immune", "frequent-illness"],
    vegan: true,
    iherbSearch: "Sambucol Black Elderberry",
    warnings: ["autoimmune"],
  },
  {
    id: "probiotic", name: "Multi-Strain Probiotic", brand: "Garden of Life",
    dose: "50B CFU, 15 strains", timing: "morning",
    purpose: "Gut · immunity · mood",
    evidence: "moderate", monthlyCost: 35, priority: 6,
    why: "Supports digestive balance, immune signalling, and the gut-brain axis that influences mood and cognition.",
    hue: "#688a6b",
    tags: ["general", "immune", "weight", "low-mood", "digestive-issues", "bloating"],
    vegan: true,
    iherbSearch: "Garden of Life Dr Formulated Probiotics Mood",
  },
  {
    id: "digestive-enzymes", name: "Digestive Enzymes (Broad-Spectrum)", brand: "Enzymedica",
    dose: "1 capsule with meals", timing: "midday",
    purpose: "Digestion · bloating · nutrient uptake",
    evidence: "moderate", monthlyCost: 24, priority: 5,
    why: "Broad-spectrum plant enzymes that help break down proteins, fats, and carbs — useful for bloating or low stomach acid.",
    hue: "#d4a96a",
    tags: ["digestive-issues", "bloating"],
    vegan: true,
    iherbSearch: "Enzymedica Digest Gold",
  },

  // ── Iron, heart, beauty, specialty ───────────────────────────────────────
  {
    id: "iron", name: "Iron Bisglycinate (Gentle)", brand: "Solgar",
    dose: "25 mg", timing: "morning",
    purpose: "Energy · oxygen transport (women)",
    evidence: "strong", monthlyCost: 13, priority: 8,
    why: "Gentle, well-absorbed iron. Especially relevant for menstruating individuals or low-energy / pale-skin profiles.",
    hue: "#a3604a",
    tags: ["energy", "female", "low-energy"],
    vegan: true,
    iherbSearch: "Solgar Gentle Iron Bisglycinate",
  },
  {
    id: "coq10", name: "CoQ10 (Ubiquinol)", brand: "Doctor's Best",
    dose: "100 mg ubiquinol", timing: "morning",
    purpose: "Cellular energy · heart",
    evidence: "strong", monthlyCost: 26, priority: 5,
    why: "The active form of CoQ10 — fuels cellular energy production and supports cardiovascular function. More relevant after 40.",
    hue: "#d4a96a",
    tags: ["energy", "longevity", "heart", "low-energy", "afternoon-crash"],
    vegan: true,
    iherbSearch: "Doctor's Best Ubiquinol CoQ10",
  },
  {
    id: "biotin", name: "Biotin", brand: "Sports Research",
    dose: "5000 mcg", timing: "morning",
    purpose: "Hair · skin · nails",
    evidence: "moderate", monthlyCost: 12, priority: 4,
    why: "Supports keratin production for hair growth and nail strength. Pair with collagen and protein for visible results.",
    hue: "#c4944a",
    tags: ["hair", "skin", "beauty"],
    vegan: true,
    iherbSearch: "Sports Research Biotin 5000mcg",
  },
];

// ─── Scoring helpers ──────────────────────────────────────────────────────────
function clamp(min: number, max: number, v: number) {
  return Math.max(min, Math.min(max, v));
}

function sleepHoursScore(h: string): number {
  if (h.includes("Less than 5") || h.includes("5-6")) return 0;
  if (h.includes("6-7")) return 5;
  if (h.includes("7-8") || h.includes("8+")) return 10;
  return 5;
}

function workoutBoost(freq: string): number {
  if (freq.includes("5+")) return 15;
  if (freq.includes("3") || freq.includes("3-4")) return 10;
  if (freq.includes("1-2") || freq.includes("1–2")) return 5;
  return 0;
}

export function computeScores(d: QuizData): WellnessScores {
  const energy = Math.round(clamp(20, 100,
    d.energy * 16 + (d.afternoonCrash === "No" ? 6 : d.afternoonCrash === "Yes" ? -4 : 0) + 12));
  const sleep = Math.round(clamp(20, 100,
    d.sleep * 16 + sleepHoursScore(d.sleepHours) + (d.sleepIssues.includes("None of these") ? 6 : -d.sleepIssues.length * 2) + 10));
  const recovery = Math.round(clamp(25, 100,
    d.sleep * 12 + workoutBoost(d.workoutFreq) + (d.bodyConcerns.includes("Joint pain or stiffness") ? -6 : 6) + 20));
  const focus = Math.round(clamp(25, 100,
    d.sleep * 7 + (6 - d.stress) * 6 + d.mood * 4 + (d.mindConcerns.includes("Brain fog") ? -6 : 0) + 18));
  const stress = Math.round(clamp(20, 100,
    (6 - d.stress) * 16 + (d.mindConcerns.includes("Anxiety") ? -5 : 0) + 12));
  const mood = Math.round(clamp(20, 100,
    d.mood * 16 + (d.mindConcerns.includes("Low motivation") ? -4 : 0) + 12));

  return { energy, sleep, recovery, focus, stress, mood };
}

// ─── Tag profile builder ─────────────────────────────────────────────────────
function buildTags(d: QuizData): Set<string> {
  const t = new Set<string>();

  // Goals
  for (const goal of d.goals) {
    if (goal.includes("energy")) t.add("energy");
    if (goal.includes("sleep")) t.add("sleep");
    if (goal.includes("focus")) t.add("focus");
    if (goal.includes("Stress")) t.add("stress");
    if (goal.includes("Muscle") || goal.includes("Recovery")) { t.add("recovery"); t.add("active"); }
    if (goal.includes("Immune")) t.add("immune");
    if (goal.includes("Weight")) t.add("weight");
    if (goal.includes("Healthy aging") || goal.includes("longevity")) t.add("longevity");
    if (goal.includes("mood")) t.add("low-mood");
    if (goal.includes("wellness")) t.add("general");
    if (goal.includes("skin") || goal.includes("hair") || goal.includes("Beauty")) t.add("beauty");
  }

  // Sleep
  if (d.sleep <= 2) { t.add("low-sleep"); t.add("sleep"); }
  for (const issue of d.sleepIssues) {
    if (issue.includes("falling asleep")) t.add("sleep-onset");
    if (issue.includes("Wake up at night")) t.add("wake-at-night");
    if (issue.includes("too early")) t.add("wake-at-night");
    if (issue.includes("rested")) t.add("low-sleep");
  }

  // Stress & mind
  if (d.stress >= 4) { t.add("high-stress"); t.add("stress"); }
  if (d.mood <= 2) t.add("low-mood");
  for (const concern of d.mindConcerns) {
    if (concern.includes("Brain fog")) t.add("brain-fog");
    if (concern.includes("Anxiety")) t.add("anxiety");
    if (concern.includes("Poor focus")) t.add("poor-focus");
    if (concern.includes("Memory")) t.add("memory");
    if (concern.includes("Low motivation")) t.add("low-motivation");
  }

  // Energy
  if (d.energy <= 2) { t.add("low-energy"); t.add("energy"); }
  if (d.afternoonCrash === "Yes") t.add("afternoon-crash");

  // Activity
  if (d.workoutFreq.includes("5+")) { t.add("very-active"); t.add("active"); t.add("recovery"); }
  else if (d.workoutFreq.includes("3-4") || d.workoutFreq.includes("3–4")) { t.add("active"); t.add("recovery"); }
  if (d.workoutType.includes("Strength")) t.add("strength");

  // Diet
  if (d.diet === "Vegan") t.add("vegan");
  if (d.diet === "Vegetarian") t.add("vegetarian");

  // Body concerns
  for (const c of d.bodyConcerns) {
    if (c.includes("Joint")) { t.add("joint"); t.add("joint-pain"); }
    if (c.includes("Digestive")) { t.add("digestive-issues"); }
    if (c.includes("Bloating")) t.add("bloating");
    if (c.includes("Skin")) t.add("skin");
    if (c.includes("Hair")) t.add("hair");
    if (c.includes("Frequent illness")) { t.add("immune"); t.add("frequent-illness"); }
    if (c.includes("Inflammation")) t.add("inflammation");
    if (c.includes("Heart") || c.includes("blood pressure")) t.add("heart");
  }

  // Demographic
  if (d.gender === "Female") t.add("female");
  if (d.gender === "Male") t.add("male");

  // Preference
  if (d.veganOnly || d.diet === "Vegan") t.add("vegan-only");

  return t;
}

// ─── Safety filter — exclude unsafe supplements ──────────────────────────────
function isSafe(s: Supplement, d: QuizData): boolean {
  if (!s.warnings) return true;
  for (const warn of s.warnings) {
    if (warn === "pregnant" && d.pregnant === "Yes") return false;
    if (warn === "blood-thinners" && d.conditions.includes("On blood thinners")) return false;
    if (warn === "thyroid" && d.conditions.includes("Thyroid condition")) return false;
    if (warn === "autoimmune" && d.conditions.includes("Autoimmune condition")) return false;
    if (warn === "bipolar" && d.conditions.includes("Bipolar")) return false;
    if (warn === "fish-allergy" && d.allergies.includes("Fish")) return false;
    if (warn === "shellfish-allergy" && d.allergies.includes("Shellfish")) return false;
  }
  return true;
}

// ─── Budget tier ─────────────────────────────────────────────────────────────
function budgetMax(b: string): number {
  if (b.includes("Under $20")) return 22;
  if (b.includes("$20 – $50")) return 52;
  if (b.includes("$50 – $100")) return 105;
  return 220;
}

function maxItems(b: string): number {
  if (b.includes("Under $20")) return 3;
  if (b.includes("$20 – $50")) return 5;
  if (b.includes("$50 – $100")) return 7;
  return 10;
}

// ─── Recommendation ──────────────────────────────────────────────────────────
export function recommend(d: QuizData): Recommendation {
  const tags = buildTags(d);

  // Score: tag-match score + priority + evidence boost
  const scored = SUPPLEMENT_DB.map(s => {
    const matches = s.tags.filter(t => tags.has(t)).length;
    const ev = s.evidence === "very strong" ? 1 : s.evidence === "strong" ? 0.5 : 0;
    const pr = (s.priority ?? 5) / 10;
    return { supp: s, score: matches * 2 + ev + pr };
  });

  // Safety filter
  let pool = scored.filter(({ supp }) => isSafe(supp, d));

  // Vegan filter
  if (tags.has("vegan-only")) pool = pool.filter(({ supp }) => supp.vegan);

  // Avoid recommending BOTH fish-omega and algae-omega
  // Prefer algae if vegan-only, otherwise fish (cheaper, higher dose)
  if (tags.has("vegan-only")) pool = pool.filter(({ supp }) => supp.id !== "omega3");
  else pool = pool.filter(({ supp }) => supp.id !== "omega3-algae");

  // Sort by score
  pool.sort((a, b) => b.score - a.score);

  // Greedy selection within budget
  const cap = budgetMax(d.budget);
  const limit = maxItems(d.budget);
  const chosen: Supplement[] = [];
  let total = 0;

  for (const { supp, score } of pool) {
    if (chosen.length >= limit) break;
    if (score < 2.5) continue; // skip very low-relevance items
    if (total + supp.monthlyCost > cap) continue;
    chosen.push(supp);
    total += supp.monthlyCost;
  }

  // If still nothing matched (unusual), force at least D3+K2 as a baseline
  if (chosen.length === 0) {
    const d3 = SUPPLEMENT_DB.find(s => s.id === "d3k2")!;
    chosen.push(d3); total += d3.monthlyCost;
  }

  // Build reasoning
  const reasoning: string[] = [];
  if (tags.has("low-sleep") || tags.has("wake-at-night") || tags.has("sleep-onset"))
    reasoning.push("Your sleep profile signals room for improvement — we prioritised supplements that calm the nervous system and deepen sleep.");
  if (tags.has("high-stress") || tags.has("anxiety"))
    reasoning.push("Stress is elevated — we added adaptogens and calming nutrients that support cortisol balance.");
  if (tags.has("low-energy") || tags.has("afternoon-crash"))
    reasoning.push("Low daytime energy or afternoon crashes — we focused on nutrients that fuel cellular energy and steady output.");
  if (tags.has("brain-fog") || tags.has("poor-focus"))
    reasoning.push("Mental clarity issues — we included cognitive support that targets focus and neural function.");
  if (tags.has("vegan"))
    reasoning.push("Plant-based diet — we included B12, algae-based omega-3, and other nutrients that commonly run low without animal products.");
  if (tags.has("vegan-only") && !tags.has("vegan"))
    reasoning.push("Per your preference, we kept the entire stack 100% plant-based.");
  if (tags.has("very-active"))
    reasoning.push("High training load — we emphasised recovery, anti-inflammatory support, and performance ingredients.");
  if (tags.has("joint-pain"))
    reasoning.push("Joint discomfort flagged — we included evidence-led joint and inflammation support.");
  if (tags.has("digestive-issues") || tags.has("bloating"))
    reasoning.push("Digestive concerns — we added gut-supportive ingredients to ease bloating and improve nutrient uptake.");
  if (tags.has("frequent-illness"))
    reasoning.push("Frequent illness — we strengthened the immune pillar of your stack.");
  if (tags.has("female") && tags.has("low-energy"))
    reasoning.push("As a woman with low energy, iron is a common culprit — we included a gentle, well-absorbed form.");

  // Safety notes
  const notes: string[] = [];
  if (d.pregnant === "Yes")
    notes.push("Some supplements (e.g. ashwagandha, lion's mane) were excluded due to pregnancy. Please consult your obstetrician before starting any new supplements.");
  if (d.conditions.includes("On blood thinners"))
    notes.push("Because you're on blood thinners, we excluded supplements that may affect coagulation (high-dose fish oil, curcumin). Discuss any new supplement with your prescriber.");
  if (d.conditions.length > 0 && !d.conditions.includes("None of these"))
    notes.push("Health conditions are noted. Please review this stack with a qualified healthcare professional before starting.");
  if (d.allergies.length > 0 && !d.allergies.includes("None of these"))
    notes.push("Allergens were considered when building your stack. Always re-check product labels for trace ingredients.");

  return {
    supplements: chosen,
    scores: computeScores(d),
    totalMonthlyCost: total,
    reasoning,
    notes,
  };
}

// ─── Export iherb link builder for convenience ───────────────────────────────
export { iherbLink } from "./iherb";
