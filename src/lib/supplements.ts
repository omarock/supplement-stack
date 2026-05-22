import { QuizData } from "@/types/quiz";

// ─── Supplement Database ──────────────────────────────────────────────────────
export interface Supplement {
  id: string;
  name: string;
  dose: string;
  timing: "morning" | "midday" | "evening" | "pre-train";
  purpose: string;
  why: string;
  evidence: "very strong" | "strong" | "moderate";
  monthlyCost: number; // USD estimate
  hue: string;
  tags: string[]; // goals/conditions this addresses
}

export const SUPPLEMENT_DB: Supplement[] = [
  {
    id: "d3",
    name: "Vitamin D3",
    dose: "2000 IU",
    timing: "morning",
    purpose: "Energy · immunity · bone",
    why: "Supports mood, immune signalling, and bone health. Especially relevant if you spend most days indoors.",
    evidence: "strong",
    monthlyCost: 8,
    hue: "#c4944a",
    tags: ["energy", "immune", "general", "low-energy", "low-mood"],
  },
  {
    id: "omega3",
    name: "Omega-3 EPA/DHA",
    dose: "1 g",
    timing: "morning",
    purpose: "Heart · brain · recovery",
    why: "Polyunsaturated fats that support cardiovascular health, mood, and the inflammation curve after training.",
    evidence: "strong",
    monthlyCost: 18,
    hue: "#d4a96a",
    tags: ["focus", "recovery", "general", "weight", "stress"],
  },
  {
    id: "omega3-algae",
    name: "Omega-3 (Algae)",
    dose: "1 g",
    timing: "morning",
    purpose: "Heart · brain · recovery (plant-based)",
    why: "Vegan-friendly EPA/DHA from algae. Critical for plant-based diets as ALA conversion is limited.",
    evidence: "strong",
    monthlyCost: 24,
    hue: "#d4a96a",
    tags: ["focus", "recovery", "general", "vegan", "vegetarian"],
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    dose: "400 mg",
    timing: "evening",
    purpose: "Sleep · stress · muscle",
    why: "A bioavailable form that supports deep sleep, calms the nervous system, and helps muscles relax.",
    evidence: "strong",
    monthlyCost: 14,
    hue: "#7a6d92",
    tags: ["sleep", "stress", "recovery", "low-sleep", "high-stress", "general"],
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    dose: "600 mg",
    timing: "evening",
    purpose: "Stress · resilience · sleep",
    why: "A clinically-studied adaptogen that lowers cortisol response while preserving daytime alertness.",
    evidence: "strong",
    monthlyCost: 16,
    hue: "#a3604a",
    tags: ["stress", "sleep", "high-stress", "low-sleep"],
  },
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    dose: "5 g",
    timing: "morning",
    purpose: "Strength · cognition · recovery",
    why: "One of the most-studied supplements in existence. Improves output, recovery, and short-term cognition.",
    evidence: "very strong",
    monthlyCost: 12,
    hue: "#688a6b",
    tags: ["recovery", "focus", "active", "very-active"],
  },
  {
    id: "b12",
    name: "Vitamin B12 (Methylcobalamin)",
    dose: "1000 mcg",
    timing: "morning",
    purpose: "Energy · nerves · cognition",
    why: "Essential for energy production and red blood cell formation. Critical for plant-based diets.",
    evidence: "very strong",
    monthlyCost: 10,
    hue: "#c4944a",
    tags: ["energy", "vegan", "vegetarian", "low-energy"],
  },
  {
    id: "iron",
    name: "Iron Bisglycinate",
    dose: "25 mg",
    timing: "morning",
    purpose: "Energy · oxygen transport",
    why: "Gentle, well-absorbed iron. Especially relevant for menstruating individuals or low-energy profiles.",
    evidence: "strong",
    monthlyCost: 12,
    hue: "#a3604a",
    tags: ["energy", "female", "low-energy"],
  },
  {
    id: "zinc",
    name: "Zinc Picolinate",
    dose: "15 mg",
    timing: "evening",
    purpose: "Immunity · hormones · skin",
    why: "Critical for immune function, testosterone synthesis, and skin health. Often low in modern diets.",
    evidence: "strong",
    monthlyCost: 8,
    hue: "#7a6d92",
    tags: ["immune", "general", "male", "active"],
  },
  {
    id: "ltheanine",
    name: "L-Theanine",
    dose: "200 mg",
    timing: "midday",
    purpose: "Focus · calm alertness",
    why: "Promotes calm, focused energy without sedation. Pairs beautifully with coffee for steady focus.",
    evidence: "strong",
    monthlyCost: 14,
    hue: "#688a6b",
    tags: ["focus", "stress", "high-stress"],
  },
  {
    id: "rhodiola",
    name: "Rhodiola Rosea",
    dose: "300 mg",
    timing: "morning",
    purpose: "Energy · stress resilience",
    why: "Adaptogen that supports mental performance under fatigue and helps the body adapt to stress.",
    evidence: "moderate",
    monthlyCost: 18,
    hue: "#a3604a",
    tags: ["energy", "stress", "focus", "low-energy"],
  },
  {
    id: "probiotic",
    name: "Multi-Strain Probiotic",
    dose: "20B CFU",
    timing: "morning",
    purpose: "Gut · immunity · mood",
    why: "Supports digestive health, immune function, and the gut-brain axis that influences mood.",
    evidence: "moderate",
    monthlyCost: 22,
    hue: "#688a6b",
    tags: ["general", "immune", "weight"],
  },
  {
    id: "vitc",
    name: "Vitamin C",
    dose: "500 mg",
    timing: "morning",
    purpose: "Immunity · antioxidant",
    why: "Supports immune function, collagen synthesis, and acts as a powerful antioxidant.",
    evidence: "strong",
    monthlyCost: 6,
    hue: "#c4944a",
    tags: ["immune", "general"],
  },
  {
    id: "multivit",
    name: "Comprehensive Multivitamin",
    dose: "1 capsule",
    timing: "morning",
    purpose: "Foundational nutrition",
    why: "Covers micronutrient gaps from imperfect nutrition. A reliable baseline for general wellness.",
    evidence: "moderate",
    monthlyCost: 20,
    hue: "#d4a96a",
    tags: ["general"],
  },
];

// ─── Wellness Score Computation ───────────────────────────────────────────────
export interface WellnessScores {
  energy: number;
  sleep: number;
  recovery: number;
  focus: number;
  stress: number;
}

export function computeScores(d: QuizData): WellnessScores {
  // Convert 1-5 scale to 0-100 score
  const energyScore = Math.min(100, Math.max(20, d.energy * 18 + 10));
  const sleepScore = Math.min(100, Math.max(20, d.sleep * 18 + 10));
  // Recovery is influenced by sleep + exercise
  const exerciseBoost =
    d.workoutFreq.includes("5+") ? 15 :
    d.workoutFreq.includes("3-4") ? 10 :
    d.workoutFreq.includes("1-2") ? 5 : 0;
  const recoveryScore = Math.min(100, Math.max(25, d.sleep * 14 + exerciseBoost + 20));
  // Focus from sleep + stress (inverse)
  const focusScore = Math.min(100, Math.max(25, d.sleep * 10 + (6 - d.stress) * 8 + 25));
  // Stress score (lower stress = higher score)
  const stressScore = Math.min(100, Math.max(20, (6 - d.stress) * 18 + 10));

  return {
    energy: Math.round(energyScore),
    sleep: Math.round(sleepScore),
    recovery: Math.round(recoveryScore),
    focus: Math.round(focusScore),
    stress: Math.round(stressScore),
  };
}

// ─── Budget Tier ──────────────────────────────────────────────────────────────
function getBudgetMax(budget: string): number {
  if (budget.includes("Under $20")) return 20;
  if (budget.includes("$20 – $50")) return 50;
  if (budget.includes("$50 – $100")) return 100;
  return 250; // $100+
}

function getMaxSupplements(budget: string): number {
  if (budget.includes("Under $20")) return 3;
  if (budget.includes("$20 – $50")) return 5;
  if (budget.includes("$50 – $100")) return 7;
  return 9;
}

// ─── Recommendation Engine ────────────────────────────────────────────────────
export interface Recommendation {
  supplements: Supplement[];
  scores: WellnessScores;
  totalMonthlyCost: number;
  reasoning: string[];
}

export function recommend(d: QuizData): Recommendation {
  // Build a tag profile based on quiz answers
  const tags: string[] = [];

  // Goal tags
  for (const goal of d.goals) {
    if (goal.includes("energy")) tags.push("energy");
    if (goal.includes("sleep")) tags.push("sleep");
    if (goal.includes("focus")) tags.push("focus");
    if (goal.includes("Stress")) tags.push("stress");
    if (goal.includes("Muscle")) tags.push("recovery");
    if (goal.includes("Immune")) tags.push("immune");
    if (goal.includes("Weight")) tags.push("weight");
    if (goal.includes("wellness")) tags.push("general");
  }

  // Lifestyle tags
  if (d.sleep <= 2) tags.push("low-sleep", "sleep");
  if (d.stress >= 4) tags.push("high-stress", "stress");
  if (d.energy <= 2) tags.push("low-energy", "energy");

  // Activity tags
  if (d.workoutFreq.includes("5+")) tags.push("very-active", "active", "recovery");
  else if (d.workoutFreq.includes("3-4")) tags.push("active", "recovery");

  // Diet tags
  if (d.diet === "Vegan") tags.push("vegan");
  if (d.diet === "Vegetarian") tags.push("vegetarian");

  // Demographic tags
  if (d.gender === "Female") tags.push("female");
  if (d.gender === "Male") tags.push("male");

  // Score each supplement by tag matches
  const scored = SUPPLEMENT_DB.map(supp => {
    const matches = supp.tags.filter(t => tags.includes(t)).length;
    // Boost for "very strong" evidence
    const evidenceBoost = supp.evidence === "very strong" ? 0.5 : supp.evidence === "strong" ? 0.25 : 0;
    return { supp, score: matches + evidenceBoost };
  });

  // Vegan/vegetarian: prefer algae omega over fish omega
  let filtered = scored;
  if (d.diet === "Vegan" || d.diet === "Vegetarian") {
    filtered = scored.filter(s => s.supp.id !== "omega3");
  } else {
    filtered = scored.filter(s => s.supp.id !== "omega3-algae");
  }

  // Sort by score (highest first), then by evidence
  filtered.sort((a, b) => b.score - a.score);

  // Apply budget constraint
  const maxCost = getBudgetMax(d.budget);
  const maxSupplements = getMaxSupplements(d.budget);

  const chosen: Supplement[] = [];
  let totalCost = 0;

  for (const { supp, score } of filtered) {
    if (score < 0.5) continue; // require at least some relevance
    if (chosen.length >= maxSupplements) break;
    if (totalCost + supp.monthlyCost > maxCost) continue;
    chosen.push(supp);
    totalCost += supp.monthlyCost;
  }

  // Ensure at least 2 supplements always (foundational)
  if (chosen.length < 2 && d.budget.includes("Under $20")) {
    if (!chosen.find(s => s.id === "d3")) {
      const d3 = SUPPLEMENT_DB.find(s => s.id === "d3");
      if (d3 && totalCost + d3.monthlyCost <= maxCost) {
        chosen.push(d3);
        totalCost += d3.monthlyCost;
      }
    }
  }

  // Reasoning strings
  const reasoning: string[] = [];
  if (tags.includes("low-sleep")) reasoning.push("Your sleep score signals room for improvement — we prioritised sleep & recovery supplements.");
  if (tags.includes("high-stress")) reasoning.push("Stress is elevated — we added adaptogens to support cortisol balance.");
  if (tags.includes("low-energy")) reasoning.push("Low daytime energy — we focused on nutrients that support cellular energy production.");
  if (tags.includes("vegan")) reasoning.push("Plant-based diet — we included B12, algae-based omega-3, and other commonly-low nutrients.");
  if (tags.includes("vegetarian")) reasoning.push("Vegetarian diet — we adjusted for nutrients that can run low without meat or fish.");
  if (tags.includes("very-active")) reasoning.push("High training load — we emphasised recovery and performance ingredients.");

  return {
    supplements: chosen,
    scores: computeScores(d),
    totalMonthlyCost: totalCost,
    reasoning,
  };
}
