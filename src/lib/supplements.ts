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
  description?: string;     // long-form SEO copy for /ingredients/[slug] pages (2-3 paragraphs)
  category?: "vitamins" | "minerals" | "amino-acids" | "omega-fats" | "adaptogens" | "nootropics" | "antioxidants" | "joint" | "gut" | "sleep" | "hormonal" | "heart" | "performance" | "greens" | "specialty";
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
    category: "vitamins",
  },

  // ─── EXTENDED LIBRARY (added 2026-05) ──────────────────────────────────────
  // Amino acids & antioxidants
  {
    id: "nac", name: "N-Acetyl Cysteine (NAC)", brand: "NOW Foods",
    dose: "600 mg", timing: "morning",
    purpose: "Liver · antioxidant · respiratory",
    evidence: "strong", monthlyCost: 14, priority: 6,
    why: "Precursor to glutathione — the body's master antioxidant. Supports liver detox, lung function, and recovery from oxidative stress.",
    hue: "#688a6b",
    tags: ["liver", "immune", "longevity", "general", "recovery", "brain-fog", "frequent-illness"],
    vegan: true,
    iherbSearch: "Now Foods NAC 600mg",
    warnings: ["pregnant"],
    category: "amino-acids",
    description: "N-Acetyl Cysteine (NAC) is a stable, bioavailable form of the amino acid cysteine and the most-studied precursor to glutathione, the body's master antioxidant. By supporting glutathione production, NAC plays a central role in liver detoxification, lung mucus regulation, and protection against oxidative stress. With decades of clinical safety data, it is used by emergency departments to treat acetaminophen overdose. Daily supplementation may support respiratory health during cold and flu season, reduce oxidative damage from intense exercise, and help the liver process alcohol or environmental toxins. Most adults take 600–1,200 mg per day, ideally on an empty stomach.",
  },
  {
    id: "taurine", name: "Taurine", brand: "NOW Foods",
    dose: "2000 mg", timing: "evening",
    purpose: "Heart · sleep · cellular hydration",
    evidence: "strong", monthlyCost: 12, priority: 5,
    why: "Conditionally-essential amino acid that supports cardiovascular function, electrical signaling in muscles, and neurological calm.",
    hue: "#7a6d92",
    tags: ["heart", "sleep", "recovery", "general", "longevity", "active", "stress"],
    vegan: true,
    iherbSearch: "NOW Foods Taurine 1000mg",
    category: "amino-acids",
    description: "Taurine is one of the most abundant amino acids in the human body, concentrated in the heart, brain, and skeletal muscle. Although the body produces small amounts, supplementation is increasingly studied for its role in cardiovascular health, blood pressure regulation, and mitochondrial function. A landmark 2023 Columbia University study linked taurine deficiency to accelerated aging in mice and primates. In humans, supplementation may improve exercise performance, support healthy lipid profiles, and modestly improve sleep quality through GABA receptor modulation. Common doses range from 1,000 to 3,000 mg daily, often taken in the evening to support relaxation.",
  },
  {
    id: "acetyl-l-carnitine", name: "Acetyl-L-Carnitine (ALCAR)", brand: "Jarrow Formulas",
    dose: "500 mg", timing: "morning",
    purpose: "Brain energy · focus · fat metabolism",
    evidence: "strong", monthlyCost: 15, priority: 6,
    why: "Brain-penetrating form of carnitine that supports cellular energy in neurons and may improve mental energy, focus, and mood in low-energy states.",
    hue: "#c4944a",
    tags: ["energy", "focus", "brain-fog", "low-energy", "memory", "longevity", "afternoon-crash"],
    vegan: false,
    iherbSearch: "Jarrow Formulas Acetyl L-Carnitine 500mg",
    category: "amino-acids",
    description: "Acetyl-L-Carnitine, often called ALCAR, is an acetylated form of L-carnitine that crosses the blood-brain barrier far more efficiently than its parent compound. Inside cells, carnitine shuttles long-chain fatty acids into mitochondria for energy production, supporting cellular ATP output in tissues with the highest energy demand — the brain, heart, and skeletal muscle. Clinical studies have explored ALCAR for mental energy, mild age-related cognitive decline, neuropathic discomfort, and mood support. Typical doses are 500–1,500 mg per day on an empty stomach. Benefits often build progressively over 4–8 weeks of consistent use.",
  },
  {
    id: "l-carnitine", name: "L-Carnitine Tartrate", brand: "NOW Foods",
    dose: "1500 mg", timing: "pre-train",
    purpose: "Fat metabolism · workout recovery",
    evidence: "moderate", monthlyCost: 16, priority: 5,
    why: "The tartrate form supports fat oxidation, exercise recovery, and reduced muscle soreness when taken around training.",
    hue: "#d4a96a",
    tags: ["recovery", "active", "very-active", "weight", "strength"],
    vegan: false,
    iherbSearch: "NOW Foods L-Carnitine Tartrate 1000mg",
    category: "amino-acids",
    description: "L-Carnitine Tartrate (LCLT) is the most-researched form of carnitine for athletic performance and fat metabolism. It transports long-chain fatty acids into mitochondria where they are oxidized for energy, theoretically allowing the body to use fat as fuel more efficiently during exercise. Research suggests LCLT may reduce post-workout muscle soreness, decrease exercise-induced muscle damage markers, and support faster recovery between training sessions. While weight-loss claims are often overstated, athletes and active adults may benefit from 1,000–3,000 mg per day, typically taken 30–60 minutes before training with a small amount of carbohydrate.",
  },
  {
    id: "ala", name: "Alpha-Lipoic Acid (ALA)", brand: "Doctor's Best",
    dose: "300 mg", timing: "morning",
    purpose: "Antioxidant · blood sugar · nerve health",
    evidence: "strong", monthlyCost: 14, priority: 5,
    why: "Universal antioxidant that works in both water- and fat-soluble compartments. Supports insulin sensitivity and nerve health.",
    hue: "#a3604a",
    tags: ["longevity", "energy", "general", "weight"],
    vegan: true,
    iherbSearch: "Doctor's Best Alpha Lipoic Acid 300mg",
    category: "antioxidants",
    description: "Alpha-Lipoic Acid (ALA) is a sulfur-containing fatty acid synthesized in the mitochondria, where it functions as a critical cofactor for energy-producing enzymes. Uniquely, ALA is soluble in both water and fat, allowing it to neutralize free radicals throughout the entire cell — earning it the title 'universal antioxidant.' It also regenerates other antioxidants including vitamins C and E, glutathione, and CoQ10. Clinical research has focused on ALA's role in supporting healthy blood sugar regulation, insulin sensitivity, and peripheral nerve health. Most studies use 300–600 mg per day, taken on an empty stomach for optimal absorption.",
  },
  {
    id: "berberine", name: "Berberine HCl", brand: "Thorne",
    dose: "500 mg", timing: "midday",
    purpose: "Blood sugar · metabolic health · gut",
    evidence: "strong", monthlyCost: 22, priority: 6,
    why: "Botanical compound that activates AMPK — supports healthy blood glucose, lipid profile, and metabolic flexibility.",
    hue: "#c4944a",
    tags: ["weight", "longevity", "general", "heart", "digestive-issues"],
    vegan: true,
    iherbSearch: "Thorne Berberine 500mg",
    warnings: ["pregnant"],
    category: "specialty",
    description: "Berberine is a yellow alkaloid extracted from plants like Berberis aristata, goldenseal, and Oregon grape, with a 3,000-year history in Traditional Chinese and Ayurvedic medicine. It is one of the most thoroughly studied natural compounds for metabolic health: clinical trials repeatedly show its ability to support healthy blood sugar, cholesterol, and triglyceride levels, often performing comparably to first-line metabolic medications. Its primary mechanism is activation of AMPK, the cellular 'metabolic master switch.' Standard dosing is 500 mg taken two to three times daily with meals. Berberine should not be combined with prescription glucose-lowering medications without clinician supervision.",
  },
  {
    id: "quercetin", name: "Quercetin (with Bromelain)", brand: "Solgar",
    dose: "500 mg", timing: "morning",
    purpose: "Immune · allergies · circulation",
    evidence: "moderate", monthlyCost: 18, priority: 5,
    why: "Plant flavonoid that supports a balanced histamine response, capillary integrity, and antiviral immune activity.",
    hue: "#688a6b",
    tags: ["immune", "frequent-illness", "longevity", "general"],
    vegan: true,
    iherbSearch: "Solgar Quercetin Complex with Bromelain",
    category: "antioxidants",
    description: "Quercetin is a flavonoid pigment abundant in onions, apples, capers, and red wine. As one of the most-studied plant polyphenols, it has been investigated for its antioxidant, anti-inflammatory, and immune-modulating effects. Quercetin stabilizes mast cells — the immune cells that release histamine — which is why many practitioners use it to support a balanced response during allergy season. It has also gained attention for its zinc-ionophore activity, helping zinc enter cells where it supports antiviral defenses. Bromelain (an enzyme from pineapple) is often paired with quercetin to enhance absorption. Typical doses are 500–1,000 mg daily.",
  },
  {
    id: "resveratrol", name: "Resveratrol (Trans)", brand: "Doctor's Best",
    dose: "500 mg trans-resveratrol", timing: "morning",
    purpose: "Longevity · circulation · antioxidant",
    evidence: "moderate", monthlyCost: 28, priority: 4,
    why: "Polyphenol from grapes and Japanese knotweed that activates longevity pathways (sirtuins) and supports cardiovascular health.",
    hue: "#7a6d92",
    tags: ["longevity", "heart", "general"],
    vegan: true,
    iherbSearch: "Doctor's Best Trans-Resveratrol 500mg",
    category: "antioxidants",
    description: "Resveratrol is a polyphenol concentrated in the skins of red grapes, Japanese knotweed, and a handful of berries. Made famous by the 'French paradox' — the observation that red-wine drinkers had unexpectedly low rates of heart disease — it has since become one of the most-studied longevity compounds. Resveratrol activates sirtuins (SIRT1 in particular), a family of enzymes that regulate metabolism and cellular repair. Research suggests benefits for endothelial function, blood pressure, and oxidative stress markers. Most supplements provide 250–500 mg of trans-resveratrol (the bioactive isomer) per day, often paired with a fat-containing meal for absorption.",
  },
  {
    id: "pqq", name: "PQQ (Pyrroloquinoline Quinone)", brand: "Life Extension",
    dose: "20 mg", timing: "morning",
    purpose: "Mitochondrial biogenesis · cellular energy",
    evidence: "moderate", monthlyCost: 32, priority: 4,
    why: "One of the few compounds shown to support the creation of new mitochondria — the energy factories of every cell.",
    hue: "#a3604a",
    tags: ["energy", "longevity", "low-energy", "afternoon-crash", "memory"],
    vegan: true,
    iherbSearch: "Life Extension PQQ Caps 20mg",
    category: "antioxidants",
    description: "Pyrroloquinoline Quinone (PQQ) is a small redox cofactor found in trace amounts in fermented foods, kiwi, parsley, and green tea. What makes PQQ unique among supplements is its documented ability to stimulate mitochondrial biogenesis — the creation of brand-new mitochondria within cells. Because mitochondrial density drives cellular energy output, PQQ has gained attention for supporting daytime energy, exercise capacity, and cognitive function with aging. It also functions as a potent antioxidant. Clinical studies typically use 10–20 mg per day. PQQ pairs well with CoQ10 or ubiquinol for full mitochondrial support.",
  },
  {
    id: "ubiquinol", name: "Ubiquinol (Active CoQ10)", brand: "Kaneka",
    dose: "100 mg", timing: "morning",
    purpose: "Heart · cellular energy · statin support",
    evidence: "strong", monthlyCost: 36, priority: 5,
    why: "The reduced, ready-to-use form of CoQ10. Better absorbed than ubiquinone — especially valuable after 40 or on statins.",
    hue: "#d4a96a",
    tags: ["energy", "heart", "longevity", "low-energy", "afternoon-crash"],
    vegan: true,
    iherbSearch: "Kaneka Ubiquinol 100mg",
    category: "antioxidants",
    description: "Ubiquinol is the reduced, active form of Coenzyme Q10 — the form your body actually uses to generate ATP in mitochondria and to protect cellular membranes from oxidation. While conventional CoQ10 (ubiquinone) must first be converted to ubiquinol before it works, this conversion becomes progressively less efficient with age and is impaired by statin medications. Direct ubiquinol supplementation bypasses this bottleneck. Clinical research supports its use for cardiovascular health, blood-pressure regulation, and energy in adults over 40. The Japan-developed Kaneka form is the standard used in most published studies. Typical doses are 50–200 mg daily with a fatty meal.",
  },

  // Magnesium variants & extra minerals
  {
    id: "mag-citrate", name: "Magnesium Citrate", brand: "NOW Foods",
    dose: "400 mg elemental", timing: "evening",
    purpose: "Constipation · general magnesium · cramps",
    evidence: "strong", monthlyCost: 11, priority: 6,
    why: "Higher-absorption, mildly laxative form of magnesium. A solid daily option when bowel regularity is also a goal.",
    hue: "#7a6d92",
    tags: ["sleep", "stress", "general", "digestive-issues", "muscle-tension"],
    vegan: true,
    iherbSearch: "NOW Foods Magnesium Citrate 400mg",
    category: "minerals",
    description: "Magnesium Citrate combines magnesium with citric acid, creating one of the most cost-effective and well-absorbed forms of this essential mineral. Magnesium itself is involved in more than 300 enzymatic reactions in the body — including muscle relaxation, nervous system regulation, blood sugar control, and energy production. The citrate form has a mild osmotic effect in the gut, making it especially useful for people who experience occasional constipation alongside general magnesium needs. Standard daily doses range from 200–400 mg of elemental magnesium, typically taken in the evening to support sleep and muscle recovery.",
  },
  {
    id: "mag-threonate", name: "Magnesium L-Threonate", brand: "Magtein",
    dose: "2000 mg (144 mg elemental)", timing: "evening",
    purpose: "Cognition · sleep depth · brain magnesium",
    evidence: "moderate", monthlyCost: 38, priority: 5,
    why: "The only magnesium form clinically shown to raise brain magnesium levels — supports memory, learning, and deep sleep.",
    hue: "#a78bfa",
    tags: ["sleep", "focus", "memory", "low-sleep", "brain-fog", "longevity", "poor-focus"],
    vegan: true,
    iherbSearch: "Magtein Magnesium L-Threonate",
    category: "minerals",
    description: "Magnesium L-Threonate (branded as Magtein) was developed at MIT to address a long-standing problem: most forms of magnesium cannot efficiently cross the blood-brain barrier. Threonate is a unique chelating molecule that shuttles magnesium directly into the central nervous system, raising brain magnesium concentrations in animal and early human studies. Clinical research suggests benefits for working memory, executive function, sleep depth, and age-related cognitive decline. Because the elemental magnesium content per serving is lower than other forms (~144 mg per 2,000 mg dose), it is best used as a brain-focused addition rather than a primary magnesium source.",
  },
  {
    id: "vit-k2", name: "Vitamin K2 MK-7", brand: "Doctor's Best",
    dose: "100 mcg", timing: "morning",
    purpose: "Bone · arterial calcium routing",
    evidence: "strong", monthlyCost: 16, priority: 6,
    why: "Routes calcium into bones and away from arteries. Critical companion when supplementing high-dose vitamin D3.",
    hue: "#688a6b",
    tags: ["bone", "heart", "longevity", "general"],
    vegan: false,
    iherbSearch: "Doctor's Best Vitamin K2 MK-7 100mcg",
    warnings: ["blood-thinners"],
    category: "vitamins",
    description: "Vitamin K2 (menaquinone-7, or MK-7) is the long-acting, animal-derived form of vitamin K that activates two proteins central to calcium routing in the body: osteocalcin, which directs calcium into bone, and matrix Gla protein, which keeps calcium out of arteries. While vitamin K1 (from leafy greens) primarily supports blood clotting, K2 is increasingly recognized as essential for bone density and cardiovascular health. The MK-7 form has a half-life of 72 hours — far longer than MK-4 — making once-daily dosing effective. It is especially important to pair with vitamin D3 supplementation. Typical doses are 90–200 mcg per day.",
  },
  {
    id: "selenium", name: "Selenium (Selenomethionine)", brand: "NOW Foods",
    dose: "200 mcg", timing: "morning",
    purpose: "Thyroid · antioxidant · immune",
    evidence: "strong", monthlyCost: 10, priority: 5,
    why: "Critical for thyroid hormone conversion and glutathione peroxidase — one of the body's main antioxidant enzymes.",
    hue: "#d4a96a",
    tags: ["immune", "general", "longevity", "thyroid"],
    vegan: true,
    iherbSearch: "NOW Foods Selenium 200mcg",
    category: "minerals",
    description: "Selenium is a trace mineral essential for the activity of selenoproteins — including glutathione peroxidase, one of the body's primary antioxidant enzymes, and the deiodinase enzymes that convert thyroid hormone T4 into its active form T3. Brazil nuts are the richest food source, but soil depletion makes consistent intake variable. Adequate selenium supports thyroid function, immune resilience, and protection against oxidative stress. The selenomethionine form has the highest bioavailability. Daily intake of 100–200 mcg covers most adults; the upper limit is 400 mcg/day. Excessive intake from high-dose supplements should be avoided.",
  },
  {
    id: "iodine", name: "Iodine (Kelp)", brand: "Nature's Way",
    dose: "150 mcg", timing: "morning",
    purpose: "Thyroid · hormone synthesis",
    evidence: "strong", monthlyCost: 8, priority: 4,
    why: "Essential building block of thyroid hormones. Modern diets low in seafood and iodized salt may fall short.",
    hue: "#7a6d92",
    tags: ["energy", "low-energy", "thyroid"],
    vegan: true,
    iherbSearch: "Nature's Way Kelp Iodine",
    warnings: ["thyroid", "autoimmune"],
    category: "minerals",
    description: "Iodine is a trace mineral that the body cannot produce on its own. It is the essential building block of thyroid hormones T3 and T4, which regulate metabolism, body temperature, energy production, and brain development. Modern Western diets — particularly those low in iodized salt, seafood, and dairy — can fall short of the 150 mcg daily recommendation. Mild deficiency may contribute to low energy, sluggish metabolism, and cognitive fog. Kelp-derived iodine is the most common natural form. People with thyroid conditions or on thyroid medication should consult a clinician before supplementing, as both deficiency and excess can disrupt thyroid function.",
  },
  {
    id: "chromium", name: "Chromium Picolinate", brand: "NOW Foods",
    dose: "200 mcg", timing: "morning",
    purpose: "Blood sugar · cravings · insulin sensitivity",
    evidence: "moderate", monthlyCost: 8, priority: 4,
    why: "Trace mineral that enhances insulin signaling. May support balanced blood sugar and reduce carbohydrate cravings.",
    hue: "#c4944a",
    tags: ["weight", "general"],
    vegan: true,
    iherbSearch: "NOW Foods Chromium Picolinate 200mcg",
    category: "minerals",
    description: "Chromium is a trace mineral required for normal carbohydrate, fat, and protein metabolism. It enhances the action of insulin at the cellular level, helping cells respond more efficiently to glucose. Picolinate is the most-studied bioavailable form. Clinical research suggests modest benefits for blood sugar regulation, lipid profile, and curbing carbohydrate or sugar cravings, particularly in adults with insulin resistance or pre-diabetes. Effects are subtle and build over weeks. Typical doses range from 200–500 mcg daily with food. Whole food sources include broccoli, grape juice, whole grains, and brewer's yeast.",
  },
  {
    id: "boron", name: "Boron Glycinate", brand: "NOW Foods",
    dose: "5 mg", timing: "morning",
    purpose: "Bone · hormones · joint",
    evidence: "moderate", monthlyCost: 9, priority: 4,
    why: "Trace mineral linked to free testosterone, vitamin D activation, and calcium routing into bone.",
    hue: "#688a6b",
    tags: ["bone", "male", "longevity", "joint"],
    vegan: true,
    iherbSearch: "NOW Foods Boron 3mg",
    category: "minerals",
    description: "Boron is an ultra-trace mineral with surprisingly broad effects on hormonal and skeletal health. Modest daily supplementation has been shown to support bone density by improving calcium and magnesium retention, to activate vitamin D, and — in small but consistent studies — to raise free testosterone and DHT while modestly lowering inflammatory markers and SHBG in men. It may also support joint comfort by reducing inflammation in connective tissue. Standard doses range from 3–10 mg daily, well below the 20 mg upper limit. Boron is found in raisins, almonds, avocado, and prunes.",
  },
  {
    id: "inositol", name: "Inositol (Myo + D-Chiro 40:1)", brand: "Wholesome Story",
    dose: "2000 mg", timing: "morning",
    purpose: "PCOS · hormonal balance · mood",
    evidence: "strong", monthlyCost: 22, priority: 7,
    why: "Vitamin-like compound clinically studied for ovarian function, insulin sensitivity, anxiety, and obsessive thought patterns.",
    hue: "#7a6d92",
    tags: ["female", "stress", "anxiety", "low-mood", "weight"],
    vegan: true,
    iherbSearch: "Wholesome Story Inositol Myo D-Chiro 40:1",
    category: "hormonal",
    description: "Inositol is a vitamin-like compound that serves as a second messenger for insulin and FSH (follicle-stimulating hormone). The 40:1 ratio of myo-inositol to D-chiro-inositol mirrors the body's natural plasma ratio and is the form used in nearly all published PCOS research. For women with polycystic ovary syndrome, regular supplementation has been shown to support ovulation, menstrual regularity, insulin sensitivity, and androgen balance. Inositol has also been studied at higher doses (12–18 g/day) for anxiety, panic, and obsessive-compulsive symptoms. Standard daily doses are 2–4 g, taken on an empty stomach or with a small meal.",
  },

  // Sleep & nervous system
  {
    id: "melatonin", name: "Melatonin (Low-Dose)", brand: "Life Extension",
    dose: "0.3–0.5 mg", timing: "evening",
    purpose: "Sleep onset · jet lag · circadian rhythm",
    evidence: "strong", monthlyCost: 7, priority: 6,
    why: "The body's master sleep hormone. Low physiological doses (0.3–0.5 mg) outperform high doses for sleep onset.",
    hue: "#7a6d92",
    tags: ["sleep", "low-sleep", "sleep-onset", "shift-work"],
    vegan: true,
    iherbSearch: "Life Extension Melatonin 300mcg",
    warnings: ["pregnant", "autoimmune"],
    category: "sleep",
    description: "Melatonin is the hormone produced by the pineal gland that signals darkness to the body and initiates the sleep cycle. While commercial supplements often contain 3–10 mg, research consistently shows that low physiological doses of 0.3–0.5 mg are equally or more effective for sleep onset, with fewer next-day side effects like grogginess and vivid dreams. Melatonin is particularly useful for jet lag, shift work, and delayed sleep phase. It is best taken 30–60 minutes before bedtime. Long-term, low-dose use also shows promise for antioxidant and longevity-related benefits, though chronic high-dose use is not recommended.",
  },
  {
    id: "5-htp", name: "5-HTP (Griffonia Seed)", brand: "NOW Foods",
    dose: "100 mg", timing: "evening",
    purpose: "Mood · sleep · serotonin precursor",
    evidence: "moderate", monthlyCost: 14, priority: 5,
    why: "Direct precursor to serotonin and melatonin. May support mood and sleep onset — use cautiously, not with SSRIs.",
    hue: "#a3604a",
    tags: ["sleep", "low-mood", "sleep-onset"],
    vegan: true,
    iherbSearch: "NOW Foods 5-HTP 100mg",
    warnings: ["pregnant", "ssri", "bipolar"],
    category: "sleep",
    description: "5-Hydroxytryptophan (5-HTP) is the immediate precursor to serotonin, the neurotransmitter that regulates mood, appetite, and the sleep-wake cycle. Derived from the West African Griffonia simplicifolia seed, it crosses the blood-brain barrier and is converted into serotonin without requiring tryptophan competition. Clinical research has explored 5-HTP for low mood, sleep onset difficulties, and appetite regulation. Doses typically range from 50–200 mg in the evening. 5-HTP should never be combined with SSRIs, MAOIs, or other serotonergic medications without medical supervision, due to the risk of serotonin syndrome. Cycling rather than continuous use is advised.",
  },
  {
    id: "valerian", name: "Valerian Root", brand: "Nature's Way",
    dose: "500 mg standardised", timing: "evening",
    purpose: "Sleep onset · mild anxiety",
    evidence: "moderate", monthlyCost: 11, priority: 4,
    why: "Traditional sedative herb that promotes faster sleep onset. Effects build over 2–4 weeks of consistent use.",
    hue: "#688a6b",
    tags: ["sleep", "stress", "sleep-onset", "anxiety"],
    vegan: true,
    iherbSearch: "Nature's Way Valerian Root 500mg",
    warnings: ["pregnant"],
    category: "sleep",
    description: "Valerian root has been used as a sleep and calming herb since at least ancient Greece. Its active compounds — valerenic acid and valepotriates — appear to modulate GABA receptors in a manner similar to mild sedatives, though without the dependence risk. Unlike fast-acting sleep aids, valerian's benefits typically emerge gradually over 2–4 weeks of consistent nightly use. Clinical reviews suggest improvements in sleep onset latency and subjective sleep quality, particularly in adults with mild insomnia. Standard doses range from 300–600 mg of standardized extract taken 30–60 minutes before bed. The earthy smell is famously strong — capsules are the preferred format.",
  },
  {
    id: "saffron", name: "Saffron Extract (Affron)", brand: "Sports Research",
    dose: "28 mg", timing: "morning",
    purpose: "Mood · mild low mood · PMS",
    evidence: "strong", monthlyCost: 24, priority: 6,
    why: "Clinically-studied spice extract that supports mood in mild-to-moderate low mood — comparable to first-line interventions in head-to-head trials.",
    hue: "#c4944a",
    tags: ["low-mood", "stress", "female", "anxiety"],
    vegan: true,
    iherbSearch: "Sports Research Saffron Affron",
    warnings: ["pregnant"],
    category: "adaptogens",
    description: "Saffron — the dried stigma of Crocus sativus — is the world's most expensive spice by weight, with a strikingly robust evidence base for emotional well-being. Multiple randomized controlled trials of standardized extracts (Affron and Satiereal are the most-studied) show meaningful improvements in mood, irritability, and PMS symptoms. Head-to-head studies have compared saffron favorably to common first-line mood treatments at clinical doses. Mechanistically, saffron's bioactive compounds (crocin, safranal, picrocrocin) appear to modulate serotonin, dopamine, and norepinephrine pathways. The clinical dose is 28–30 mg of standardized extract daily, with effects typically emerging within 4–6 weeks.",
  },
  {
    id: "holy-basil", name: "Holy Basil (Tulsi)", brand: "Organic India",
    dose: "500 mg", timing: "morning",
    purpose: "Stress adaptation · cortisol · immune",
    evidence: "moderate", monthlyCost: 14, priority: 5,
    why: "Ayurvedic adaptogen that gently lowers cortisol, supports immune resilience, and modestly aids blood sugar regulation.",
    hue: "#688a6b",
    tags: ["stress", "high-stress", "immune", "general", "anxiety"],
    vegan: true,
    iherbSearch: "Organic India Tulsi Holy Basil",
    warnings: ["pregnant"],
    category: "adaptogens",
    description: "Holy Basil, known as Tulsi in Sanskrit, has been revered in Ayurvedic medicine for over 3,000 years as the 'queen of herbs.' Unlike its culinary cousin sweet basil, holy basil is classified as an adaptogen — supporting the body's response to physical, chemical, and emotional stressors. Clinical research suggests benefits for cortisol regulation, blood sugar balance, immune resilience, and overall sense of well-being. Its active phytochemicals include eugenol, ursolic acid, and rosmarinic acid. Typical doses are 300–600 mg of leaf extract twice daily. It can also be enjoyed as a fragrant tea — an alternative for those preferring food-based supplementation.",
  },
  {
    id: "panax-ginseng", name: "Korean Red Ginseng (Panax)", brand: "Korean Ginseng Corp",
    dose: "500 mg standardised", timing: "morning",
    purpose: "Energy · cognitive performance · libido",
    evidence: "strong", monthlyCost: 28, priority: 6,
    why: "The classic 'true' ginseng. Supports physical endurance, mental performance, and circulation. Avoid in evening — stimulating.",
    hue: "#a3604a",
    tags: ["energy", "focus", "low-energy", "male", "low-motivation", "afternoon-crash"],
    vegan: true,
    iherbSearch: "Korea Ginseng Corp Korean Red Ginseng",
    warnings: ["pregnant", "blood-thinners"],
    category: "adaptogens",
    description: "Panax ginseng — the 'true' ginseng of Traditional Chinese Medicine — has been used for over 2,000 years to restore vital energy. Modern clinical research has investigated its standardized extracts (Ginsana, KRG, others) for mental performance, physical endurance, immune support, and male sexual function. The active ginsenosides modulate the HPA axis and support nitric oxide signaling. Korean red ginseng, which is steamed before drying, contains a higher proportion of the most bioactive ginsenosides. Typical doses are 200–600 mg daily of a standardized extract. Because it is gently stimulating, ginseng is best taken in the morning or early afternoon, not at night.",
  },

  // Nootropics
  {
    id: "bacopa", name: "Bacopa Monnieri", brand: "Himalaya",
    dose: "750 mg standardised", timing: "morning",
    purpose: "Memory · learning · stress modulation",
    evidence: "strong", monthlyCost: 13, priority: 6,
    why: "Ayurvedic herb with consistent evidence for memory consolidation and learning — but effects build slowly (8–12 weeks).",
    hue: "#688a6b",
    tags: ["focus", "memory", "stress", "brain-fog", "poor-focus", "longevity"],
    vegan: true,
    iherbSearch: "Himalaya Bacopa Monnieri",
    category: "nootropics",
    description: "Bacopa monnieri is a wetland herb central to Ayurvedic medicine, where it has been used for centuries as a brain tonic and longevity herb. Its active compounds — bacosides A and B — appear to enhance synaptic communication, support dendrite growth, and protect neurons from oxidative stress. Multiple randomized controlled trials have demonstrated improvements in memory consolidation, learning speed, and information retention, particularly with consistent use over 8–12 weeks. Unlike fast-acting nootropics, bacopa works gradually. Standard doses are 300 mg of extract (standardized to 45–50% bacosides) one to two times daily, ideally with a fat-containing meal.",
  },
  {
    id: "ginkgo", name: "Ginkgo Biloba", brand: "Nature's Way",
    dose: "120 mg standardised", timing: "morning",
    purpose: "Circulation · memory · concentration",
    evidence: "moderate", monthlyCost: 11, priority: 5,
    why: "Improves cerebral blood flow. Long studied for memory in adults over 50 and circulation-related cold extremities.",
    hue: "#a3604a",
    tags: ["focus", "memory", "longevity", "brain-fog", "poor-focus", "heart"],
    vegan: true,
    iherbSearch: "Nature's Way Ginkgo Biloba 120mg",
    warnings: ["blood-thinners"],
    category: "nootropics",
    description: "Ginkgo biloba is one of the oldest tree species on earth, with leaves that have been used in Traditional Chinese Medicine for thousands of years. Standardized extracts — typically EGb 761 with 24% flavonoid glycosides and 6% terpene lactones — are among the most-studied botanical interventions for cerebral circulation and age-related cognitive support. Ginkgo improves microcirculation and platelet function, which underlies its use for memory, concentration, tinnitus, and cold extremities. Clinical doses are 120–240 mg per day in divided doses. Because it has mild blood-thinning effects, it should not be combined with anticoagulant medications without medical supervision.",
  },
  {
    id: "citicoline", name: "Citicoline (CDP-Choline)", brand: "Cognizin",
    dose: "250 mg", timing: "morning",
    purpose: "Focus · attention · brain energy",
    evidence: "strong", monthlyCost: 26, priority: 6,
    why: "Choline source that converts into both phosphatidylcholine (membranes) and acetylcholine (signaling). Sharper than plain choline.",
    hue: "#a78bfa",
    tags: ["focus", "memory", "brain-fog", "poor-focus", "longevity", "energy"],
    vegan: true,
    iherbSearch: "Cognizin Citicoline 250mg",
    category: "nootropics",
    description: "Citicoline, also known as CDP-choline, is a naturally occurring compound that provides both choline (a precursor to the neurotransmitter acetylcholine) and cytidine (a precursor to uridine, important for synaptic plasticity). The Cognizin branded form has been used in placebo-controlled trials showing improvements in attention, focus, and information processing speed in healthy adults. Citicoline also supports phosphatidylcholine synthesis in neuronal membranes, contributing to long-term brain structural integrity. Standard daily doses range from 250–500 mg in the morning. It is one of the few nootropics with both acute and cumulative effects.",
  },
  {
    id: "alpha-gpc", name: "Alpha-GPC", brand: "NOW Foods",
    dose: "300 mg", timing: "morning",
    purpose: "Acetylcholine · power output · focus",
    evidence: "strong", monthlyCost: 22, priority: 5,
    why: "The most bioavailable choline source. Boosts acetylcholine for sharp focus and may modestly enhance growth hormone before training.",
    hue: "#c4944a",
    tags: ["focus", "memory", "active", "very-active", "brain-fog", "strength"],
    vegan: true,
    iherbSearch: "NOW Foods Alpha GPC 300mg",
    category: "nootropics",
    description: "Alpha-GPC (L-alpha-glycerylphosphorylcholine) is among the most bioavailable forms of choline, crossing the blood-brain barrier efficiently and serving as a direct precursor to the neurotransmitter acetylcholine. Acetylcholine governs focus, learning speed, memory recall, and the brain-muscle connection during movement. Clinical studies have shown benefits for cognitive function in healthy adults, as well as modest improvements in power output and growth hormone release when taken before exercise. Athletes and knowledge workers commonly use 300–600 mg per day. Combining Alpha-GPC with caffeine can produce a noticeably 'clean' stimulant effect without the typical jitter.",
  },
  {
    id: "phosphatidylserine", name: "Phosphatidylserine (PS)", brand: "Doctor's Best",
    dose: "100 mg", timing: "evening",
    purpose: "Cortisol · memory · stress recovery",
    evidence: "moderate", monthlyCost: 22, priority: 5,
    why: "Phospholipid that blunts cortisol response to mental and physical stress, and supports memory function with aging.",
    hue: "#a78bfa",
    tags: ["stress", "high-stress", "memory", "longevity", "brain-fog", "very-active"],
    vegan: false,
    iherbSearch: "Doctor's Best Phosphatidylserine 100mg",
    category: "nootropics",
    description: "Phosphatidylserine (PS) is a phospholipid concentrated in cell membranes, particularly within neurons. Its supplementation has two distinct evidence-based applications. First, in adults with age-related memory complaints, PS has been shown to support memory recall, recognition, and processing speed. Second, in stressed populations, PS appears to blunt the cortisol response to physical and mental stressors — a finding particularly relevant for athletes managing overtraining and for high-stress professionals. Most studies use 100 mg three times daily, though 100–300 mg once daily is also effective. PS is typically derived from soy lecithin or sunflower lecithin.",
  },

  // Joints & antioxidants
  {
    id: "astaxanthin", name: "Astaxanthin", brand: "Sports Research",
    dose: "12 mg", timing: "morning",
    purpose: "Skin · eye · UV defense · antioxidant",
    evidence: "strong", monthlyCost: 22, priority: 5,
    why: "The most powerful naturally-occurring antioxidant. Crosses the blood-brain and blood-retinal barriers. Supports skin elasticity from within.",
    hue: "#c4944a",
    tags: ["skin", "beauty", "longevity", "general"],
    vegan: true,
    iherbSearch: "Sports Research Astaxanthin 12mg",
    category: "antioxidants",
    description: "Astaxanthin is a deep-red carotenoid produced by the microalga Haematococcus pluvialis and concentrated in salmon, krill, and flamingos. It has the highest antioxidant capacity of any naturally occurring carotenoid — many times more potent than vitamin C or beta-carotene against certain types of oxidative stress. Unlike most antioxidants, astaxanthin crosses both the blood-brain barrier and the blood-retinal barrier, contributing to brain and eye health. Clinical studies support its use for skin elasticity, moisture, and protection against UV damage from within. Typical doses are 4–12 mg per day with a fat-containing meal for absorption.",
  },
  {
    id: "lutein", name: "Lutein + Zeaxanthin", brand: "Doctor's Best",
    dose: "20 mg / 4 mg", timing: "morning",
    purpose: "Eye · macula · blue-light defense",
    evidence: "strong", monthlyCost: 18, priority: 5,
    why: "The macular pigments. Filter high-energy blue light and protect central vision over decades.",
    hue: "#d4a96a",
    tags: ["eye", "longevity", "general"],
    vegan: true,
    iherbSearch: "Doctor's Best Lutein Zeaxanthin",
    category: "antioxidants",
    description: "Lutein and zeaxanthin are the two carotenoids that selectively accumulate in the macula — the central, high-resolution part of the retina. They function as a built-in 'eye sunscreen,' absorbing high-energy blue light from the sun, screens, and indoor lighting that would otherwise damage delicate photoreceptors. Higher macular pigment density is associated with sharper contrast sensitivity, reduced glare, and a lower long-term risk of age-related macular degeneration. The AREDS2 study established 10 mg lutein and 2 mg zeaxanthin as the clinical reference dose. Many modern supplements provide 20 mg lutein and 4 mg zeaxanthin for screen-heavy lifestyles.",
  },
  {
    id: "msm", name: "MSM (Methylsulfonylmethane)", brand: "Doctor's Best",
    dose: "3000 mg", timing: "morning",
    purpose: "Joint comfort · skin · post-workout",
    evidence: "moderate", monthlyCost: 15, priority: 5,
    why: "Bioavailable sulfur compound that supports joint comfort, connective tissue, and recovery from intense training.",
    hue: "#688a6b",
    tags: ["joint", "joint-pain", "recovery", "very-active", "skin", "inflammation"],
    vegan: true,
    iherbSearch: "Doctor's Best MSM 1500mg",
    category: "joint",
    description: "Methylsulfonylmethane (MSM) is an organic sulfur compound that provides bioavailable sulfur — an essential building block of joint cartilage, collagen, keratin, and the body's own antioxidant glutathione. Clinical research supports MSM for joint comfort and stiffness in mild osteoarthritis, with effects often appearing within 4–6 weeks. Athletes also use it for post-workout muscle soreness and recovery. The OptiMSM brand is the most-studied purified form. Typical doses range from 1,500–3,000 mg per day, in divided doses with meals. Higher doses (up to 6 g) have been studied safely over months in clinical trials.",
  },
  {
    id: "boswellia", name: "Boswellia (AKBA-Enhanced)", brand: "Life Extension",
    dose: "100 mg AprèsFlex", timing: "morning",
    purpose: "Joint comfort · inflammation modulation",
    evidence: "strong", monthlyCost: 19, priority: 6,
    why: "Frankincense extract standardized to AKBA — directly inhibits the 5-LOX inflammation pathway. Comparable to first-line joint interventions in trials.",
    hue: "#a3604a",
    tags: ["joint", "joint-pain", "inflammation", "longevity"],
    vegan: true,
    iherbSearch: "Life Extension Boswellia AprèsFlex",
    category: "joint",
    description: "Boswellia serrata, also known as Indian frankincense, has been used in Ayurvedic medicine for centuries to support joint comfort and inflammation. Its primary bioactive compound, acetyl-11-keto-beta-boswellic acid (AKBA), is one of the few naturally occurring substances shown to inhibit the 5-LOX enzyme — a key pathway in inflammatory leukotriene production that is not affected by typical NSAIDs. The enhanced-AKBA form known as AprèsFlex (or 5-Loxin) is the most clinically studied. Trials in osteoarthritis have shown meaningful improvements in pain, stiffness, and joint function within 5–7 days, with continued progress over 90 days at 100 mg daily.",
  },

  // Gut, liver, greens
  {
    id: "l-glutamine", name: "L-Glutamine Powder", brand: "Thorne",
    dose: "5 g", timing: "morning",
    purpose: "Gut lining · immune · recovery",
    evidence: "moderate", monthlyCost: 18, priority: 5,
    why: "The primary fuel for intestinal cells and immune cells. Useful during high stress, intense training, or gut barrier issues.",
    hue: "#d4a96a",
    tags: ["recovery", "general", "active", "very-active", "digestive-issues", "immune", "frequent-illness"],
    vegan: true,
    iherbSearch: "Thorne L-Glutamine Powder",
    category: "amino-acids",
    description: "L-Glutamine is the most abundant amino acid in the bloodstream and the primary fuel source for two of the body's most rapidly dividing cell populations: enterocytes (the cells lining the small intestine) and immune cells. Under normal conditions, the body produces enough glutamine to meet demand. But during prolonged stress, intense endurance training, injury recovery, or compromised gut barrier function, glutamine becomes 'conditionally essential.' Supplementation may support gut barrier integrity, immune resilience after hard training, and recovery from physical stressors. Standard doses are 5–10 g per day, mixed in water or a non-acidic beverage on an empty stomach.",
  },
  {
    id: "milk-thistle", name: "Milk Thistle (Silymarin)", brand: "Jarrow Formulas",
    dose: "300 mg standardised 80%", timing: "morning",
    purpose: "Liver support · antioxidant",
    evidence: "moderate", monthlyCost: 14, priority: 5,
    why: "The classic liver herb. Silymarin compounds stabilize liver cell membranes and support glutathione recycling.",
    hue: "#688a6b",
    tags: ["liver", "longevity", "general"],
    vegan: true,
    iherbSearch: "Jarrow Formulas Milk Thistle Silymarin",
    category: "specialty",
    description: "Milk thistle (Silybum marianum) has been used as a liver-supportive herb for over 2,000 years. Its active complex, silymarin — a group of flavonolignans including silybin, silydianin, and silychristin — works through multiple mechanisms: stabilizing hepatocyte cell membranes against toxin damage, supporting glutathione synthesis and recycling, and acting as a direct antioxidant within liver tissue. Clinical research has explored its use for general liver wellness, recovery from environmental and dietary stressors, and as adjunctive support alongside certain medications. Standard doses are 200–600 mg of extract standardized to 80% silymarin per day, taken in divided doses with meals.",
  },
  {
    id: "spirulina", name: "Spirulina (Hawaiian)", brand: "Nutrex",
    dose: "3 g (6 tablets)", timing: "morning",
    purpose: "Whole-food greens · iron · antioxidant",
    evidence: "moderate", monthlyCost: 18, priority: 4,
    why: "Blue-green algae with a remarkable nutrient profile: B vitamins, iron, GLA, and the antioxidant pigment phycocyanin.",
    hue: "#688a6b",
    tags: ["general", "energy", "low-energy", "vegan", "vegetarian", "immune"],
    vegan: true,
    iherbSearch: "Nutrex Hawaii Spirulina Pacifica",
    category: "greens",
    description: "Spirulina is a blue-green microalga (Arthrospira platensis) that has been consumed as a food since the Aztec civilization. It is one of the most nutrient-dense whole foods known: gram for gram, it provides exceptional levels of plant protein, B vitamins, bioavailable iron, gamma-linolenic acid, and the unique pigment phycocyanin — a potent antioxidant and anti-inflammatory compound. Hawaiian-grown spirulina (Nutrex's Spirulina Pacifica) is widely considered the cleanest source. Clinical studies suggest benefits for blood lipid profiles, iron status in deficient populations, and exercise endurance. Standard doses are 3–10 g daily, taken in tablet form to avoid the strong taste.",
  },
  {
    id: "chlorella", name: "Chlorella (Broken Cell Wall)", brand: "Sun Chlorella",
    dose: "3 g", timing: "morning",
    purpose: "Detox binding · greens · iron",
    evidence: "moderate", monthlyCost: 24, priority: 4,
    why: "Green algae with a fibrous cell wall that binds heavy metals and supports gentle detoxification. Rich in chlorophyll and B12.",
    hue: "#688a6b",
    tags: ["general", "longevity", "vegan", "vegetarian", "liver"],
    vegan: true,
    iherbSearch: "Sun Chlorella Broken Cell Wall",
    category: "greens",
    description: "Chlorella is a single-celled green freshwater alga renowned for its concentrated chlorophyll content and unique fibrous cell wall, which has been shown in animal and human studies to bind certain heavy metals and persistent organic pollutants in the digestive tract, gently supporting elimination. Because the intact cell wall is indigestible, only 'broken cell wall' or 'cracked cell wall' chlorella delivers usable nutrition. It is a notable plant source of vitamin B12 analogs, iron, and protein. Standard doses are 2–5 g per day, taken with meals. Look for purity testing — algae products can concentrate environmental contaminants if poorly sourced.",
  },
  {
    id: "beetroot", name: "Beetroot Powder", brand: "BeetElite",
    dose: "10 g (1 scoop)", timing: "pre-train",
    purpose: "Nitric oxide · circulation · endurance",
    evidence: "strong", monthlyCost: 30, priority: 5,
    why: "Dietary nitrates from beetroot convert to nitric oxide — improving blood flow, exercise efficiency, and blood pressure.",
    hue: "#a3604a",
    tags: ["active", "very-active", "heart", "energy", "strength"],
    vegan: true,
    iherbSearch: "BeetElite Beetroot Powder",
    category: "performance",
    description: "Beetroot is one of the highest dietary sources of inorganic nitrate. Once consumed, nitrate is converted by oral and gut bacteria into nitrite and ultimately nitric oxide — the signaling molecule that dilates blood vessels and improves blood flow. Clinical studies have shown that beetroot supplementation can lower resting blood pressure, improve exercise tolerance, and reduce the oxygen cost of activity at submaximal intensities. Standardized powders (such as BeetElite) provide consistent nitrate dosing — typically 400–600 mg of nitrate per serving — that whole beets do not. Best taken 60–90 minutes before exercise.",
  },
  {
    id: "l-citrulline", name: "L-Citrulline Malate", brand: "NOW Foods",
    dose: "6 g", timing: "pre-train",
    purpose: "Pumps · endurance · recovery",
    evidence: "strong", monthlyCost: 16, priority: 6,
    why: "Converts to arginine more efficiently than supplemental arginine itself. Boosts nitric oxide, training volume, and reduces next-day soreness.",
    hue: "#688a6b",
    tags: ["active", "very-active", "strength", "recovery"],
    vegan: true,
    iherbSearch: "NOW Foods L-Citrulline Pure Powder",
    category: "performance",
    description: "L-Citrulline is a non-essential amino acid that the body converts to L-arginine, the direct precursor to nitric oxide. Counterintuitively, supplemental citrulline raises plasma arginine levels more effectively than arginine itself, because it bypasses first-pass metabolism in the gut and liver. The malate form pairs citrulline with malic acid, which supports the Krebs cycle and may further enhance exercise capacity. Research demonstrates increased blood flow, reduced perceived exertion, greater training volume, and lower next-day muscle soreness. The standard ergogenic dose is 6–8 g taken 45–60 minutes before training.",
  },
  {
    id: "beta-alanine", name: "Beta-Alanine (CarnoSyn)", brand: "NOW Foods",
    dose: "3.2 g (split doses)", timing: "pre-train",
    purpose: "Muscular endurance · anaerobic capacity",
    evidence: "very strong", monthlyCost: 14, priority: 6,
    why: "Builds muscle carnosine, buffering acidity during high-intensity efforts. Most effective for 60-second to 4-minute exertion ranges.",
    hue: "#c4944a",
    tags: ["active", "very-active", "strength", "recovery"],
    vegan: true,
    iherbSearch: "NOW Foods Beta Alanine Powder",
    category: "performance",
    description: "Beta-alanine is a non-essential amino acid that, once consumed, combines with histidine to form carnosine — a dipeptide stored in skeletal muscle. Carnosine buffers hydrogen ion accumulation during high-intensity exercise, delaying the muscular acidity that limits anaerobic performance. Meta-analyses consistently show meaningful improvements in exercise capacity during efforts lasting 60 seconds to 4 minutes — sprints, CrossFit-style workouts, HIIT, and many team sports. Loading takes 2–4 weeks of consistent supplementation at 3.2–6.4 g per day, ideally split into smaller doses to minimize the characteristic harmless tingling sensation (paresthesia). CarnoSyn is the patented, research-grade form.",
  },
  {
    id: "mct-oil", name: "MCT Oil (C8 + C10)", brand: "Sports Research",
    dose: "1 tbsp (15 mL)", timing: "morning",
    purpose: "Ketones · sustained energy · brain fuel",
    evidence: "moderate", monthlyCost: 22, priority: 4,
    why: "Medium-chain triglycerides bypass normal fat digestion and convert rapidly to ketones — clean, sustained brain and muscle fuel.",
    hue: "#d4a96a",
    tags: ["energy", "low-energy", "focus", "weight", "afternoon-crash", "brain-fog"],
    vegan: true,
    iherbSearch: "Sports Research MCT Oil C8 C10",
    category: "performance",
    description: "Medium-chain triglycerides (MCTs) are saturated fatty acids of 6–12 carbons in length, derived primarily from coconut and palm kernel oils. Unlike long-chain fats, MCTs are absorbed directly into the portal circulation and metabolized rapidly in the liver, where they are partially converted to ketone bodies — an alternative fuel source for the brain and skeletal muscle. The C8 (caprylic acid) and C10 (capric acid) chains are the most ketogenic; pure C8 oils produce the steepest ketone rise. MCT oil is popular among low-carb practitioners, athletes seeking clean fuel, and adults pursuing sharper cognitive states. Start with 1 teaspoon to assess GI tolerance.",
  },

  // Hormonal & libido
  {
    id: "tongkat-ali", name: "Tongkat Ali (Eurycoma)", brand: "Double Wood",
    dose: "400 mg standardised", timing: "morning",
    purpose: "Testosterone · libido · stress resilience",
    evidence: "moderate", monthlyCost: 28, priority: 5,
    why: "Malaysian botanical that supports free testosterone, libido, and HPA-axis recovery from stress. Best results in men over 35.",
    hue: "#a3604a",
    tags: ["male", "stress", "high-stress", "active", "low-energy"],
    vegan: true,
    iherbSearch: "Double Wood Tongkat Ali",
    warnings: ["pregnant"],
    category: "hormonal",
    description: "Tongkat Ali (Eurycoma longifolia, also called Longjack) is a Southeast Asian flowering plant with a long history of use in Malaysian traditional medicine. Standardized extracts — particularly the patented Physta and LJ100 forms — have been studied for their effects on free testosterone, libido, sexual function, body composition, and stress resilience. Tongkat Ali appears to work by lowering sex hormone binding globulin (SHBG), thereby increasing the proportion of bioavailable testosterone, and by gently down-regulating cortisol under chronic stress. Most studies use 200–400 mg per day of a standardized extract over 8–12 weeks. Cycling on and off is commonly recommended.",
  },
  {
    id: "maca", name: "Maca Root (Black + Red + Yellow)", brand: "Navitas Organics",
    dose: "3 g powder", timing: "morning",
    purpose: "Libido · energy · hormonal balance",
    evidence: "moderate", monthlyCost: 18, priority: 5,
    why: "Peruvian root vegetable studied for libido and energy in both men and women — without affecting hormones directly.",
    hue: "#d4a96a",
    tags: ["male", "female", "energy", "low-energy", "low-motivation"],
    vegan: true,
    iherbSearch: "Navitas Organics Maca Powder",
    category: "hormonal",
    description: "Maca is a cruciferous root vegetable native to the high Andes of Peru, where it has been cultivated as both food and medicine for over 2,000 years. Modern clinical research has explored maca's effects on libido, sexual function, mood, and physical energy in adults of all genders. Notably, these effects appear to occur without directly altering hormone levels — making maca an interesting option for people seeking libido and vitality support without hormonal interference. Black maca is most studied for energy and male fertility; red maca for prostate and hormonal balance in women. Standard doses are 1.5–5 g of dried powder daily, easily added to smoothies or oatmeal.",
  },

  // Functional mushrooms & extra adaptogens
  {
    id: "cordyceps", name: "Cordyceps (CS-4 / Militaris)", brand: "Host Defense",
    dose: "1000 mg", timing: "morning",
    purpose: "Endurance · oxygen utilization · vitality",
    evidence: "moderate", monthlyCost: 22, priority: 5,
    why: "Functional mushroom traditionally used to support stamina, lung function, and aerobic capacity at altitude.",
    hue: "#c4944a",
    tags: ["energy", "low-energy", "active", "very-active", "afternoon-crash"],
    vegan: true,
    iherbSearch: "Host Defense Cordyceps",
    category: "adaptogens",
    description: "Cordyceps is a genus of parasitic fungi traditionally harvested from the Tibetan plateau, where it has been used for centuries to support stamina, sexual vitality, and respiratory function. Modern supplements use cultivated forms — primarily CS-4 (a Cordyceps sinensis strain) and Cordyceps militaris — which produce the same active compounds (cordycepin and adenosine derivatives) sustainably and at scale. Research suggests cordyceps may improve oxygen utilization (VO2 max), exercise tolerance, and energy production in skeletal muscle by enhancing ATP synthesis. Typical doses range from 1,000–3,000 mg per day. It pairs well with cordyceps-containing pre-workouts or coffee blends.",
  },
  {
    id: "reishi", name: "Reishi Mushroom", brand: "Host Defense",
    dose: "1000 mg", timing: "evening",
    purpose: "Stress · sleep · immune balance",
    evidence: "moderate", monthlyCost: 22, priority: 5,
    why: "The 'mushroom of immortality' in Taoist tradition. Supports relaxation, sleep quality, and balanced immune signaling.",
    hue: "#7a6d92",
    tags: ["sleep", "stress", "immune", "low-sleep", "high-stress", "longevity"],
    vegan: true,
    iherbSearch: "Host Defense Reishi",
    warnings: ["blood-thinners"],
    category: "adaptogens",
    description: "Reishi (Ganoderma lucidum), known in China as Lingzhi or 'the mushroom of immortality,' has been used in East Asian medicine for over 2,000 years as a calming, immune-balancing adaptogen. Its bioactive polysaccharides (beta-glucans) and triterpenes appear to modulate immune signaling, supporting the body's response under both immune-suppressed and immune-overactive conditions. Reishi has a gentle calming effect that makes it well-suited for evening use, where it may support sleep depth and relaxation without sedation. Standard doses are 1–3 g of dual-extracted whole-mushroom powder per day. It pairs well with magnesium and ashwagandha for an evening wind-down routine.",
  },

  // Methylation & B-vitamins
  {
    id: "methylfolate", name: "Methylfolate (L-5-MTHF)", brand: "Thorne",
    dose: "1 mg", timing: "morning",
    purpose: "Methylation · mood · MTHFR support",
    evidence: "strong", monthlyCost: 16, priority: 6,
    why: "The bioactive form of folate — bypasses the MTHFR enzyme, supporting methylation, mood, and homocysteine balance.",
    hue: "#688a6b",
    tags: ["low-mood", "stress", "longevity", "female", "general", "brain-fog"],
    vegan: true,
    iherbSearch: "Thorne 5-MTHF L-Methylfolate",
    category: "vitamins",
    description: "L-5-MTHF (L-methylfolate) is the biologically active, ready-to-use form of folate (vitamin B9). Unlike synthetic folic acid, which requires conversion through the MTHFR enzyme, methylfolate is absorbed and used directly — making it the preferred form for people with common MTHFR gene variants (estimated to affect 30–50% of the population). Methylfolate is essential for methylation, the biochemical 'on/off' switch that regulates DNA expression, neurotransmitter synthesis, and homocysteine recycling. Adequate methylfolate supports mood, cognition, cardiovascular health, and is critical during pregnancy. Standard doses are 400 mcg–1 mg per day.",
  },
  {
    id: "vit-a", name: "Vitamin A (Retinyl Palmitate)", brand: "NOW Foods",
    dose: "10,000 IU", timing: "morning",
    purpose: "Vision · skin · immune",
    evidence: "strong", monthlyCost: 9, priority: 4,
    why: "True retinol vitamin A — critical for night vision, skin cell turnover, and mucosal immune barriers.",
    hue: "#c4944a",
    tags: ["skin", "immune", "eye", "general"],
    vegan: false,
    iherbSearch: "NOW Foods Vitamin A 10000 IU",
    warnings: ["pregnant"],
    category: "vitamins",
    description: "Vitamin A is a fat-soluble vitamin essential for vision, skin cell turnover, mucosal immune barriers, and reproductive health. It exists in two forms: preformed retinol (from animal sources like liver and egg yolk) and pro-vitamin A carotenoids (from plants), which the body converts at variable efficiency. People with certain genetic variants convert beta-carotene poorly, making true retinol supplementation valuable. Vitamin A supports a healthy skin barrier — which is why dermatologists use its derivatives (retinoids) for acne and aging — and is critical for low-light vision. Standard doses are 3,000–10,000 IU per day. Pregnant women should not exceed 10,000 IU due to teratogenic risk at higher doses.",
  },
  {
    id: "vit-e", name: "Vitamin E (Mixed Tocopherols)", brand: "Now Foods",
    dose: "400 IU", timing: "morning",
    purpose: "Antioxidant · skin · cardiovascular",
    evidence: "moderate", monthlyCost: 12, priority: 4,
    why: "Mixed tocopherols protect cell membranes from lipid peroxidation. Skip synthetic dl-alpha — always choose mixed natural forms.",
    hue: "#d4a96a",
    tags: ["skin", "longevity", "heart", "general"],
    vegan: true,
    iherbSearch: "NOW Foods Vitamin E Mixed Tocopherols 400IU",
    warnings: ["blood-thinners"],
    category: "vitamins",
    description: "Vitamin E refers to a family of eight fat-soluble compounds — four tocopherols and four tocotrienols. Of these, alpha-tocopherol is the form most actively retained by the body, but research increasingly suggests that the full spectrum of mixed tocopherols provides superior protection against lipid peroxidation in cell membranes. Synthetic dl-alpha-tocopherol (common in cheap supplements) is biologically inferior to the natural d-alpha and mixed forms. Vitamin E supports skin integrity, cardiovascular health, and immune function. Standard doses are 100–400 IU per day with a fat-containing meal. Higher doses may interfere with vitamin K and blood clotting.",
  },
  {
    id: "phosphatidylcholine", name: "Phosphatidylcholine (PC)", brand: "Bodybio",
    dose: "1300 mg", timing: "morning",
    purpose: "Liver · brain · cell membrane integrity",
    evidence: "moderate", monthlyCost: 32, priority: 4,
    why: "The primary phospholipid in cell membranes. Critical for liver function (fat transport) and brain plasticity.",
    hue: "#a78bfa",
    tags: ["liver", "memory", "longevity", "focus", "brain-fog"],
    vegan: true,
    iherbSearch: "BodyBio PC Phosphatidylcholine",
    category: "nootropics",
    description: "Phosphatidylcholine (PC) is the most abundant phospholipid in every cell membrane in the human body, where it provides structural integrity and fluidity to the lipid bilayer. The liver depends on PC to package and transport fats out to circulation; deficiency contributes to fatty liver accumulation. In the brain, PC is the precursor to acetylcholine and a structural backbone of myelin and synaptic membranes. Supplementation supports liver health, cell membrane repair, and cognitive function with age. Highly purified PC formulations (such as BodyBio PC) deliver intact phospholipids in a lipid carrier. Standard doses are 900–2,600 mg per day.",
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
