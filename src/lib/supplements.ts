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
    category: "vitamins",
    description: "Vitamin D3 (cholecalciferol) is the form your skin produces from sunlight and the form your body uses for hundreds of processes — from immune function and mood regulation to bone density and calcium absorption. Modern life keeps most adults indoors, and roughly 40% of the global population is now estimated to have insufficient D3 levels. Pairing D3 with vitamin K2 (MK-7) is essential: K2 directs calcium into bones and away from arteries, mitigating the cardiovascular risk that high-dose D3 alone can carry. The combined daily dose of 5,000 IU D3 with 90 mcg K2 is well-evidenced for adults at all latitudes.",
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
    category: "omega-fats",
    description: "Omega-3 fish oil delivers EPA and DHA — the two long-chain omega-3 fatty acids your brain, heart, joints, and inflammation pathways depend on. The triglyceride form used by premium brands like Sports Research is more bioavailable and stable than the ethyl ester form found in cheap supplements. Decades of research support omega-3s for cardiovascular function, mood, joint comfort, and recovery from physical stress. The American Heart Association recommends 1–2 g of combined EPA+DHA daily for general health and 2–4 g for cardiovascular support. Always store fish oil refrigerated and check the lot's third-party purity testing before buying.",
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
    category: "omega-fats",
    description: "Algae oil is the original source of EPA and DHA — fish only contain these long-chain omega-3s because they eat algae or other fish that ate algae. Direct algae supplements provide the same omega-3s without involving fish, making them the cleanest option for vegans, vegetarians, and people with fish or shellfish allergies. They are also typically free of the heavy-metal and PCB contamination concerns associated with ocean-sourced products. Ovega-3 and Nordic Naturals' algae line each provide 500–700 mg of combined EPA+DHA per serving. Daily intake of at least 500 mg of EPA+DHA is associated with cardiovascular and cognitive benefits.",
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
    category: "vitamins",
    description: "A high-quality multivitamin provides insurance against gaps in dietary micronutrient intake — vitamins and minerals the body needs in small amounts but that even careful eaters can miss. Whole-food multivitamins like Garden of Life Vitamin Code use vitamins cultured on whole-food substrates, providing them alongside the natural cofactors that enhance absorption. While a multivitamin is no substitute for a varied diet, daily use ensures consistent coverage of foundational nutrients — particularly B vitamins, magnesium, zinc, and vitamin D — which support energy, mood, immune function, and long-term cellular health. Look for forms standardized to active vitamins (methylfolate, methylcobalamin, P-5-P).",
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
    category: "minerals",
    description: "Magnesium glycinate combines the essential mineral magnesium with the amino acid glycine, creating one of the most bioavailable and gentle forms of magnesium available. Glycine itself has calming properties, which makes this form especially well-suited for evening use to support deep sleep and nervous system relaxation. An estimated 50% of adults in industrialized countries fall short of daily magnesium needs — a deficit linked to poor sleep quality, muscle tension, anxiety, and elevated blood pressure. Unlike magnesium citrate, glycinate does not cause laxative effects, making it appropriate for higher daily doses. Standard intake is 200–400 mg of elemental magnesium per evening, with food.",
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
    category: "adaptogens",
    description: "Ashwagandha (Withania somnifera) is the most-studied adaptogenic herb in Ayurvedic medicine, used for over 3,000 years to support resilience to physical and mental stress. The KSM-66 extract — standardized to 5% withanolides and made from the root only — is the gold-standard clinical form, with over 20 published placebo-controlled trials. Research consistently shows reductions in perceived stress, lower cortisol levels in chronically stressed adults, improved sleep onset, and modest improvements in strength and recovery in active populations. The standard dose is 600 mg of KSM-66 per day. Avoid during pregnancy, with autoimmune conditions, or alongside thyroid medication without clinician supervision.",
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
    category: "amino-acids",
    description: "L-Theanine is a unique amino acid found almost exclusively in tea leaves, particularly green tea. It crosses the blood-brain barrier and promotes the production of alpha brain waves — the electrical pattern associated with calm, focused alertness without sedation. This is why a cup of green tea feels different from coffee even when both contain caffeine. Clinical research supports L-theanine for anxiety reduction, focus enhancement, and as a companion to caffeine to smooth the stimulant edge while extending its benefits. The Suntheanine branded form is pure L-isomer (not the racemic DL mix) and is the form used in most published studies. Standard dose is 100–400 mg.",
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
    category: "amino-acids",
    description: "Glycine is the smallest of the 20 amino acids — and one of the most underappreciated. It is the primary inhibitory neurotransmitter in the spinal cord and brainstem, helps regulate core body temperature (which must drop slightly to initiate deep sleep), and is a building block of glutathione, collagen, and creatine. Supplementing 3 g of glycine 30–60 minutes before bed has been shown in clinical trials to improve subjective sleep quality and reduce next-day fatigue, particularly in people who report poor sleep. Glycine has a faintly sweet taste and dissolves easily in water or tea. It is also relevant for those eating diets low in connective-tissue cuts of meat.",
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
    category: "vitamins",
    description: "Vitamin B12 (methylcobalamin) is essential for red blood cell formation, DNA synthesis, and the protective myelin sheath around nerves. Unlike most vitamins, B12 is produced exclusively by microorganisms and accumulates in animal foods — making vegans and vegetarians universally at risk of deficiency. Older adults are also at risk because stomach acid declines with age, impairing B12 absorption from food. Symptoms of deficiency include fatigue, brain fog, tingling in the hands and feet, and mood changes. Methylcobalamin is the active form the body uses directly, bypassing the conversion step required of cheaper cyanocobalamin. Standard daily doses are 500–1,000 mcg sublingually or oral.",
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
    category: "vitamins",
    description: "A B-complex provides all eight B vitamins in their bioactive forms — methylfolate, methylcobalamin, P-5-P, and so on — rather than the cheaper synthetic forms that require enzymatic activation in the liver. The B vitamins work synergistically: B6, B12, and folate together regulate homocysteine (a cardiovascular risk marker); B1, B2, B3, and B5 drive cellular energy metabolism; biotin and B12 support nervous system function. Adequate B intake supports mood, mental clarity, energy production, and the methylation reactions that regulate gene expression. Standard doses provide 5–25 mg of each B vitamin, with active forms ensuring usability even for people with common MTHFR variants.",
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
    category: "adaptogens",
    description: "Rhodiola rosea is a hardy adaptogen native to Arctic regions of Europe and Asia, traditionally used by Vikings before raids and by Soviet cosmonauts to enhance stamina under stress. Modern clinical research supports its use for stress-related fatigue, mental performance under pressure, and mood support. The active rosavins and salidrosides appear to modulate cortisol and serotonin pathways, helping the body adapt without the sedation of some other adaptogens. Effects are typically perceived within days, unlike other adaptogens that take weeks. Standard doses are 200–600 mg of standardized extract daily, taken in the morning to avoid sleep interference. Avoid during pregnancy and with bipolar disorder.",
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
    category: "nootropics",
    description: "Lion's mane (Hericium erinaceus) is a functional mushroom whose cascading white spines resemble its namesake. It is one of the few natural compounds shown in published research to support nerve growth factor (NGF) and brain-derived neurotrophic factor (BDNF) — proteins essential for neuron health and the brain's capacity for plasticity. Clinical studies have explored lion's mane for cognitive support in mild memory complaints, mood, and peripheral nerve health. Effects typically build over 8–12 weeks of consistent use, paralleling neuroplastic timescales. Dual-extracted forms (water and alcohol) deliver both the polysaccharides and the terpene compounds. Standard dose is 500–1,500 mg of fruiting body extract daily.",
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
    category: "performance",
    description: "Creatine monohydrate is the most-studied performance supplement in the world, with over 500 published studies establishing its safety and efficacy. It works by saturating muscle phosphocreatine stores, enabling faster ATP regeneration during high-intensity efforts. Benefits include modest strength and power gains, improved high-intensity training capacity, faster recovery between sets, and emerging evidence for cognitive support — particularly under sleep deprivation and in vegetarians. The 'monohydrate' form is the gold standard; fancier creatine salts cost more without measurable advantage. The standard daily dose is 5 g, taken at any time of day with water. A loading phase is optional. Effects build over 2–4 weeks of consistent use.",
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
    category: "joint",
    description: "Collagen is the most abundant protein in the human body — the structural scaffolding of skin, joints, bones, tendons, and connective tissue. After age 25, the body's own collagen production declines about 1–2% per year, contributing to skin thinning, joint stiffness, and tissue fragility. Hydrolyzed collagen peptides (type I and III from grass-fed bovine, or type II from chicken) are broken into bioactive di- and tripeptides the body can use as both raw material and as signaling molecules to stimulate its own collagen production. Multiple randomized trials show benefits for skin elasticity and hydration, joint comfort, and nail strength. Standard dose is 10–20 g daily, mixed in coffee or smoothies.",
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
    category: "antioxidants",
    description: "Curcumin is the bright yellow polyphenol that gives turmeric its color and most of its therapeutic potential. Despite turmeric's culinary popularity, plain turmeric powder contains only 3% curcumin and has poor oral bioavailability. Modern supplements use either piperine (black pepper extract) to enhance absorption by up to 2,000% or proprietary formulations like Meriva and Theracurmin. Clinical research consistently shows curcumin's value for joint comfort, modulating chronic inflammation, and supporting recovery from intense exercise. Standard doses are 500–1,500 mg of curcumin per day. Because of mild blood-thinning effects, curcumin should be discontinued before scheduled surgery and used cautiously alongside anticoagulant medications.",
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
    category: "joint",
    description: "The classic joint-support triad of glucosamine, chondroitin, and MSM has been used for over 30 years to support cartilage health and reduce joint stiffness. Glucosamine provides the precursor for glycosaminoglycans in cartilage matrix; chondroitin attracts water to cartilage and inhibits cartilage-degrading enzymes; MSM provides bioavailable sulfur for connective tissue. Clinical evidence is most robust for symptom relief in mild-to-moderate osteoarthritis, with effects building over 8–12 weeks of consistent use. The shellfish-derived form of glucosamine is most studied; vegan glucosamine HCl made from fermentation is an alternative. Standard combined dose is 1,500 mg glucosamine, 1,200 mg chondroitin, and 500 mg MSM daily.",
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
    category: "vitamins",
    description: "Vitamin C is a water-soluble vitamin that the human body — unlike most mammals — cannot synthesize. It functions as a powerful antioxidant, a cofactor for collagen synthesis (essential for skin, blood vessels, and connective tissue), and a key player in immune defense. Buffered vitamin C is paired with minerals like calcium, magnesium, or potassium, raising the pH and making it gentler on the stomach than ascorbic acid alone — particularly important at higher doses. While the 90 mg daily reference intake prevents scurvy, optimal intake for general health is debated but often cited as 500–1,000 mg per day. Doses above 2 g can cause loose stools.",
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
    category: "minerals",
    description: "Zinc is an essential trace mineral involved in over 300 enzymatic reactions, immune function, taste, smell, wound healing, and testosterone synthesis. Its bioavailability varies dramatically by form: picolinate, citrate, and bisglycinate are well-absorbed; oxide is poorly absorbed and best avoided. Modern diets — especially those heavy in refined grains and low in oysters, red meat, and pumpkin seeds — often fall short of the 11 mg (men) or 8 mg (women) daily reference intake. Athletes, vegetarians, and people with frequent illness benefit most from supplementation. Standard daily doses are 10–25 mg with food. Doses above 40 mg long-term can interfere with copper absorption.",
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
    category: "specialty",
    description: "Black elderberry (Sambucus nigra) is one of the most-studied botanicals for upper respiratory immune support. Its concentrated dark-purple anthocyanins appear to inhibit viral attachment to cell membranes and modulate cytokine signaling during the early stages of viral illness. Multiple clinical trials, including placebo-controlled studies of the Sambucol extract, have shown reductions in cold and flu duration when supplementation begins within 48 hours of symptom onset. Elderberry should not be used as a daily preventive in people with autoimmune conditions, as it gently activates immune signaling. Standard dose during the early stages of upper respiratory illness is 1 teaspoon of standardized syrup three to four times daily.",
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
    category: "gut",
    description: "A diverse, multi-strain probiotic supplements the trillions of beneficial bacteria that line your digestive tract — collectively known as the gut microbiome. The microbiome influences immune function (70% of immune cells live in or around the gut), neurotransmitter production (90% of serotonin is made in the gut), and digestion itself. The best probiotic supplements contain 10 or more clinically-studied strains, deliver at least 25 billion CFU per dose, and use delayed-release capsules to protect bacteria from stomach acid. Garden of Life's Mood-specific formula includes strains studied for the gut-brain axis. Standard dose is one capsule daily; benefits typically emerge within 2–4 weeks.",
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
    category: "gut",
    description: "Digestive enzymes break down the macronutrients in food — proteins (protease), carbohydrates (amylase), fats (lipase), and fiber (cellulase) — into the smaller molecules your intestines can absorb. The pancreas produces these enzymes naturally, but production declines with age, stress, and certain conditions. A broad-spectrum plant-based enzyme blend, taken with meals, can support digestion in people experiencing bloating, gas, or a feeling of incomplete digestion. They are particularly useful for those with low stomach acid, eating large meals, or following a high-fiber plant-based diet. Standard dose is one capsule with each main meal, taken at the start of the meal.",
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
    category: "minerals",
    description: "Iron is essential for hemoglobin — the protein in red blood cells that transports oxygen from your lungs to every tissue. Iron deficiency is the most common nutrient deficiency worldwide, particularly affecting menstruating women, pregnant women, endurance athletes, and people on plant-based diets. Symptoms include unusual fatigue, paleness, shortness of breath, cold extremities, and impaired exercise capacity. Iron bisglycinate (Ferrochel) is far gentler on the stomach and better absorbed than the harsh ferrous sulfate found in cheap supplements. Standard supplemental dose is 15–25 mg of elemental iron, taken with vitamin C and away from coffee, tea, calcium, or dairy for optimal absorption.",
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
    category: "antioxidants",
    description: "Coenzyme Q10 (CoQ10) is a vitamin-like substance found in every cell of the body, where it powers the production of ATP — the molecular currency of cellular energy — and protects mitochondria from oxidative damage. The heart, kidneys, and liver contain the highest concentrations because of their continuous energy demands. CoQ10 production declines with age (starting in the late 30s) and is significantly depleted by statin medications, which inhibit the same enzyme responsible for both cholesterol and CoQ10 synthesis. Standard ubiquinone CoQ10 is suitable for adults under 40; ubiquinol (the reduced form) is preferred after age 40 or alongside statins. Standard dose is 100–200 mg with a fat-containing meal.",
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
    description: "Biotin (vitamin B7) is a water-soluble B vitamin essential for the metabolism of fats, carbohydrates, and amino acids, as well as for the production of keratin — the structural protein in hair, skin, and nails. Frank biotin deficiency is rare but can manifest as hair thinning, brittle nails, and skin issues. High-dose biotin (5,000 mcg) is widely used as a beauty supplement, with subjective improvements in hair shaft thickness and nail growth often reported within 2–3 months of consistent use. Note that high-dose biotin can interfere with certain blood tests (especially thyroid panels) — discontinue 48 hours before lab work. Standard supplemental dose is 2,500–10,000 mcg daily.",
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

  // ─── EXTENDED LIBRARY · BATCH 2 (added 2026-05) ─────────────────────────
  // B-vitamins individually
  {
    id: "choline", name: "Choline Bitartrate", brand: "NOW Foods",
    dose: "500 mg", timing: "morning",
    purpose: "Liver · brain · acetylcholine",
    evidence: "strong", monthlyCost: 11, priority: 5,
    why: "Essential nutrient most adults don't get enough of. Powers liver fat metabolism and acetylcholine production for memory and focus.",
    hue: "#c4944a",
    tags: ["liver", "focus", "memory", "brain-fog", "longevity"],
    vegan: true,
    iherbSearch: "NOW Foods Choline Bitartrate 500mg",
    category: "vitamins",
    description: "Choline is an essential nutrient that the body cannot produce in adequate amounts. Despite its critical roles in liver fat metabolism, neurotransmitter synthesis, and cell membrane structure, an estimated 90% of adults fall short of the recommended daily intake. Choline is the precursor to acetylcholine — the neurotransmitter that governs memory, focus, and the brain-muscle connection — and to phosphatidylcholine, a structural backbone of every cell membrane. Adequate choline supports liver health (preventing fat accumulation), cognitive function, and is especially important during pregnancy for fetal brain development. Standard doses are 250–1,000 mg per day with food.",
  },
  {
    id: "vit-b6", name: "Vitamin B6 (P-5-P)", brand: "Pure Encapsulations",
    dose: "50 mg active P-5-P", timing: "morning",
    purpose: "Mood · PMS · neurotransmitter synthesis",
    evidence: "strong", monthlyCost: 13, priority: 5,
    why: "The active P-5-P form bypasses conversion bottlenecks. Cofactor for serotonin, dopamine, and GABA — directly supports mood and PMS.",
    hue: "#a78bfa",
    tags: ["female", "stress", "low-mood", "anxiety", "longevity"],
    vegan: true,
    iherbSearch: "Pure Encapsulations P5P 50 Pyridoxal 5 Phosphate",
    category: "vitamins",
    description: "Vitamin B6 in its active pyridoxal-5-phosphate (P-5-P) form is a critical cofactor for over 140 enzymatic reactions in the body, including the synthesis of every major neurotransmitter — serotonin, dopamine, norepinephrine, GABA, and melatonin. Standard B6 (pyridoxine HCl) requires liver activation to become P-5-P, a process that can be impaired by certain medications, age, or genetic variations. Direct P-5-P supplementation bypasses this bottleneck. Clinical research supports B6 for PMS symptoms, premenstrual mood changes, morning sickness, and homocysteine reduction. Standard doses range from 10–100 mg of P-5-P per day. Long-term high-dose use (above 200 mg) should be avoided due to neuropathy risk.",
  },
  {
    id: "vit-b1", name: "Thiamine (B1) — Benfotiamine", brand: "Doctor's Best",
    dose: "300 mg benfotiamine", timing: "morning",
    purpose: "Nervous system · blood sugar · energy",
    evidence: "moderate", monthlyCost: 14, priority: 4,
    why: "Fat-soluble form of B1 — 100x more bioavailable than thiamine HCl. Supports nerve health and AGE protection in metabolic stress.",
    hue: "#c4944a",
    tags: ["energy", "longevity", "general", "weight"],
    vegan: true,
    iherbSearch: "Doctor's Best Benfotiamine 300mg",
    category: "vitamins",
    description: "Thiamine (vitamin B1) is essential for converting carbohydrates into usable energy via the Krebs cycle and for nerve signal transmission. Benfotiamine is a fat-soluble derivative of thiamine that achieves significantly higher plasma and tissue concentrations than the water-soluble form, allowing it to cross cell membranes and reach nerve tissue more effectively. Clinical research on benfotiamine has focused on its role in protecting against the formation of advanced glycation end-products (AGEs) — damaging compounds elevated in poorly-controlled blood sugar — and supporting peripheral nerve function. Standard doses are 150–600 mg per day, taken in divided doses with food.",
  },
  {
    id: "vit-b3", name: "Niacinamide (B3, Non-Flush)", brand: "Thorne",
    dose: "500 mg", timing: "morning",
    purpose: "Skin · NAD+ · joint comfort",
    evidence: "strong", monthlyCost: 11, priority: 5,
    why: "The non-flushing form of B3. Precursor to NAD+ for cellular energy and DNA repair. Topical-quality skin from within.",
    hue: "#d4a96a",
    tags: ["skin", "longevity", "joint", "general", "beauty"],
    vegan: true,
    iherbSearch: "Thorne Niacinamide 500mg",
    category: "vitamins",
    description: "Niacinamide (also called nicotinamide) is the non-flushing form of vitamin B3 and a direct precursor to NAD+ — the central coenzyme of cellular energy production and DNA repair. Unlike its cousin niacin, niacinamide does not cause the characteristic skin flush. Clinical research supports niacinamide for skin barrier function, reducing fine lines, supporting joint comfort in mild osteoarthritis, and as adjunctive support during dermatologic treatments. As a NAD+ precursor, it is also studied in the context of cellular aging and longevity research. Standard doses range from 500–1,500 mg per day, typically in divided doses with food.",
  },
  {
    id: "vit-b2", name: "Riboflavin (B2) — Activated", brand: "NOW Foods",
    dose: "100 mg", timing: "morning",
    purpose: "Energy · migraine · mitochondrial",
    evidence: "strong", monthlyCost: 10, priority: 4,
    why: "Cofactor in cellular energy production. High-dose riboflavin is one of the few well-evidenced nutritional interventions for migraine prevention.",
    hue: "#c4944a",
    tags: ["energy", "low-energy", "general", "migraine"],
    vegan: true,
    iherbSearch: "NOW Foods Riboflavin 100mg",
    category: "vitamins",
    description: "Riboflavin (vitamin B2) is essential for converting food into cellular energy. Inside cells, it is incorporated into the cofactors FAD and FMN, which power the electron transport chain in mitochondria — the site of ATP production. Beyond foundational energy metabolism, high-dose riboflavin (400 mg/day) has unusually strong clinical evidence for the prevention of migraine headaches, with effects building over 8–12 weeks. It is also necessary for the recycling of glutathione, the body's master antioxidant, and for activating other B vitamins. Standard supplemental doses are 25–100 mg daily for general support, or 400 mg for migraine prevention. A harmless bright yellow urine is normal.",
  },

  // ZMA & specialty stacks
  {
    id: "zma", name: "ZMA (Zn + Mg + B6)", brand: "Optimum Nutrition",
    dose: "30 mg Zn / 450 mg Mg / 11 mg B6", timing: "evening",
    purpose: "Sleep · recovery · testosterone (male)",
    evidence: "moderate", monthlyCost: 14, priority: 5,
    why: "Classic recovery stack for active individuals. Zinc and magnesium often run low in heavy trainers — replenishing supports sleep and hormone production.",
    hue: "#7a6d92",
    tags: ["sleep", "recovery", "male", "active", "very-active", "low-sleep"],
    vegan: true,
    iherbSearch: "Optimum Nutrition ZMA",
    category: "specialty",
    description: "ZMA combines zinc, magnesium, and vitamin B6 in a clinically-studied ratio originally developed for athletes. Heavy training accelerates the depletion of both zinc (via sweat) and magnesium (via increased cellular demand), and inadequate status of either has been linked to suppressed testosterone production, poor sleep quality, and impaired recovery. ZMA is best taken on an empty stomach 30–60 minutes before bed, away from calcium or dairy which can blunt zinc absorption. While not a hormonal supplement per se, repletion of these minerals may support recovery, sleep depth, and baseline hormone levels in active adults whose intake is marginal.",
  },
  {
    id: "lithium-orotate", name: "Lithium Orotate (Low-Dose)", brand: "Pure Encapsulations",
    dose: "5 mg elemental lithium", timing: "morning",
    purpose: "Mood stability · neuroprotection",
    evidence: "moderate", monthlyCost: 16, priority: 4,
    why: "Microdose lithium — far below pharmaceutical levels. May support stable mood and neurological resilience. Not for treating diagnosed mood disorders.",
    hue: "#a78bfa",
    tags: ["low-mood", "stress", "longevity", "anxiety"],
    vegan: true,
    iherbSearch: "Pure Encapsulations Lithium Orotate 5mg",
    warnings: ["pregnant", "bipolar"],
    category: "specialty",
    description: "Lithium is a naturally occurring trace mineral found in drinking water, vegetables, and grains. While high-dose lithium carbonate (600–1,800 mg) is a prescription medication for bipolar disorder, micro-dose lithium orotate (typically 5–20 mg of elemental lithium) supplies just a fraction of that amount — closer to the range found in mineral-rich drinking water. Epidemiological studies have observed that populations with higher lithium content in their water supply show lower rates of mood disorders, suicide, and dementia. Research suggests microdose lithium may support neuroprotection, mood stability, and cellular repair pathways. People with diagnosed mood disorders or on lithium medication should not use this without clinician supervision.",
  },

  // Hormonal & women's health
  {
    id: "fenugreek", name: "Fenugreek (Testofen)", brand: "Life Extension",
    dose: "600 mg", timing: "morning",
    purpose: "Free testosterone · libido (male)",
    evidence: "moderate", monthlyCost: 22, priority: 4,
    why: "Standardized Testofen extract studied for free testosterone, sexual function, and body composition in active men.",
    hue: "#d4a96a",
    tags: ["male", "active", "low-motivation"],
    vegan: true,
    iherbSearch: "Life Extension Fenugreek Testofen",
    category: "hormonal",
    description: "Fenugreek (Trigonella foenum-graecum) is a culinary and medicinal herb native to the Mediterranean and Western Asia. The patented Testofen extract — standardized to 50% fenuside glycosides — has been studied in placebo-controlled trials for its effects on free testosterone, libido, sexual function, and body composition in active adult men. The proposed mechanism is inhibition of the enzymes that convert testosterone to estrogen (aromatase) and DHT (5-alpha-reductase), preserving more testosterone in its free, bioavailable form. Standard dose is 600 mg of Testofen per day for 8–12 weeks. Whole-food fenugreek seeds also have a strong evidence base for blood sugar support.",
  },
  {
    id: "dim", name: "DIM (Diindolylmethane)", brand: "Pure Encapsulations",
    dose: "100 mg", timing: "morning",
    purpose: "Estrogen metabolism · hormonal balance",
    evidence: "moderate", monthlyCost: 26, priority: 5,
    why: "Active compound concentrated from cruciferous vegetables. Supports favorable 2:16 ratio of estrogen metabolites — relevant for both women and men.",
    hue: "#688a6b",
    tags: ["female", "male", "hormonal", "beauty"],
    vegan: true,
    iherbSearch: "Pure Encapsulations DIM Detox 100mg",
    warnings: ["pregnant"],
    category: "hormonal",
    description: "Diindolylmethane (DIM) is a bioactive compound formed in the stomach when indole-3-carbinol from cruciferous vegetables — broccoli, kale, cauliflower, cabbage — is exposed to gastric acid. You would need to eat about 2 pounds of broccoli to get the equivalent of a typical DIM supplement. DIM modulates estrogen metabolism by shifting the balance toward the favorable 2-hydroxyestrone pathway and away from the less-desirable 16-hydroxyestrone pathway. This affects both women (PMS, cyclical breast tenderness, estrogen dominance) and men (where excess estrogen can disrupt the testosterone-to-estrogen ratio). Standard dose is 100–200 mg per day with food.",
  },
  {
    id: "saw-palmetto", name: "Saw Palmetto Extract", brand: "NOW Foods",
    dose: "320 mg standardised", timing: "morning",
    purpose: "Prostate · DHT-related hair loss",
    evidence: "moderate", monthlyCost: 16, priority: 5,
    why: "Berry extract that mildly inhibits 5-alpha-reductase. Used for prostate comfort and DHT-driven hair loss in men.",
    hue: "#a3604a",
    tags: ["male", "hair", "longevity"],
    vegan: true,
    iherbSearch: "NOW Foods Saw Palmetto 320mg Standardized",
    category: "hormonal",
    description: "Saw palmetto (Serenoa repens) is a small palm native to the southeastern United States, whose berries have been used in traditional medicine for over a century to support prostate and urinary health in men. The standardized extract (containing 85–95% free fatty acids and sterols) mildly inhibits 5-alpha-reductase — the enzyme that converts testosterone into dihydrotestosterone (DHT). DHT drives both benign prostatic enlargement and the androgen-mediated hair loss pattern in genetically susceptible men. Clinical research supports its use for urinary symptoms and is investigated for its mild adjunctive role in male pattern hair loss. Standard dose is 320 mg of standardized extract daily.",
  },
  {
    id: "evening-primrose", name: "Evening Primrose Oil", brand: "Nature's Way",
    dose: "1300 mg (130 mg GLA)", timing: "morning",
    purpose: "Skin · PMS · hormonal balance",
    evidence: "moderate", monthlyCost: 17, priority: 4,
    why: "Rich source of gamma-linolenic acid (GLA) — an omega-6 the body uses to produce anti-inflammatory prostaglandins. Long used for PMS and skin support.",
    hue: "#d4a96a",
    tags: ["female", "skin", "beauty", "joint"],
    vegan: true,
    iherbSearch: "Nature's Way Evening Primrose Oil 1300mg",
    warnings: ["blood-thinners"],
    category: "omega-fats",
    description: "Evening primrose oil is extracted from the seeds of the wildflower Oenothera biennis. Its therapeutic value comes from its uniquely high content of gamma-linolenic acid (GLA), an omega-6 fatty acid that the body converts into prostaglandin E1 — a signaling molecule with anti-inflammatory and hormonal-balancing effects. Clinical research has explored EPO for cyclical breast discomfort, PMS-related symptoms, atopic skin conditions, and mild joint inflammation. Because most modern Western diets are rich in pro-inflammatory omega-6 forms, GLA supplementation can shift the balance toward the more beneficial prostaglandins. Standard doses range from 1,300–3,000 mg per day (delivering 130–300 mg of GLA).",
  },

  // Heart & circulation
  {
    id: "cranberry", name: "Cranberry Extract (PACran)", brand: "Solgar",
    dose: "500 mg standardised", timing: "morning",
    purpose: "Urinary tract · UTI prevention",
    evidence: "strong", monthlyCost: 18, priority: 5,
    why: "Concentrated extract delivering 36 mg PACs daily — the dose shown to reduce recurrent UTI risk. Replaces drinking gallons of juice.",
    hue: "#a3604a",
    tags: ["female", "general", "frequent-illness"],
    vegan: true,
    iherbSearch: "Solgar Cranberry Extract PACran",
    category: "specialty",
    description: "Cranberries contain a unique class of polyphenols called proanthocyanidins (PACs) — particularly A-type PACs — that prevent E. coli bacteria from adhering to the bladder wall, where they would otherwise multiply and cause urinary tract infections. Clinical research suggests that a daily dose of 36 mg of A-type PACs (the amount in concentrated extracts like PACran) meaningfully reduces the risk of recurrent UTIs, particularly in women prone to them. Capsule extracts deliver this dose without the added sugar of juice. Standard dose is 500 mg of standardized extract daily. Cranberry is preventive — it does not treat an active infection, which requires antibiotics.",
  },
  {
    id: "hawthorn", name: "Hawthorn Berry Extract", brand: "Nature's Way",
    dose: "565 mg standardised", timing: "morning",
    purpose: "Heart function · blood pressure",
    evidence: "moderate", monthlyCost: 14, priority: 4,
    why: "Traditional cardiotonic herb. Standardized extracts support healthy blood pressure, blood flow, and capillary integrity.",
    hue: "#a3604a",
    tags: ["heart", "longevity", "general"],
    vegan: true,
    iherbSearch: "Nature's Way Hawthorn Berries 565mg",
    warnings: ["blood-thinners"],
    category: "heart",
    description: "Hawthorn (Crataegus species) has been used as a heart-supportive botanical in European herbal medicine for over a thousand years. Its bioactive flavonoids — vitexin, hyperoside, and oligomeric proanthocyanidins — appear to support coronary blood flow, mildly dilate blood vessels, and gently improve the heart's pumping efficiency. Clinical studies of standardized extracts have shown benefits in mild functional cardiac complaints and the early stages of heart-related fatigue. Hawthorn is considered one of the safest and gentlest cardiotonic herbs, with cumulative benefits emerging over 4–8 weeks. Standard doses are 160–900 mg of standardized extract per day.",
  },
  {
    id: "aged-garlic", name: "Aged Garlic Extract (Kyolic)", brand: "Kyolic",
    dose: "1200 mg", timing: "morning",
    purpose: "Cardiovascular · cholesterol · blood pressure",
    evidence: "strong", monthlyCost: 22, priority: 5,
    why: "Aged at low heat for 20+ months — odorless, with concentrated, stable bioactives clinically shown to support healthy cholesterol and BP.",
    hue: "#688a6b",
    tags: ["heart", "longevity", "general", "immune"],
    vegan: true,
    iherbSearch: "Kyolic Aged Garlic Extract Cardiovascular",
    warnings: ["blood-thinners"],
    category: "heart",
    description: "Aged Garlic Extract (AGE) is produced by aging organically grown garlic in stainless steel tanks for up to 20 months without heat. This process converts the harsh, unstable sulfur compounds in fresh garlic into milder, more bioavailable forms — particularly S-allyl-cysteine — while eliminating odor. Kyolic AGE has over 800 published studies, more than any other garlic preparation, supporting its use for cardiovascular health, cholesterol balance, blood pressure regulation, and immune function. Standard doses are 600–1,200 mg per day, taken with meals. Because of mild blood-thinning properties, garlic supplements should be discontinued 1–2 weeks before scheduled surgery.",
  },
  {
    id: "nattokinase", name: "Nattokinase (NSK-SD)", brand: "Doctor's Best",
    dose: "100 mg (2000 FU)", timing: "morning",
    purpose: "Circulation · fibrin breakdown · clot prevention",
    evidence: "moderate", monthlyCost: 19, priority: 4,
    why: "Enzyme isolated from fermented soybeans (natto). Supports healthy blood flow by promoting normal fibrin breakdown.",
    hue: "#688a6b",
    tags: ["heart", "longevity", "general"],
    vegan: true,
    iherbSearch: "Doctor's Best Nattokinase 2000 FU",
    warnings: ["blood-thinners", "pregnant"],
    category: "heart",
    description: "Nattokinase is a proteolytic enzyme produced when soybeans are fermented with Bacillus subtilis natto, creating the traditional Japanese food natto. The enzyme has documented fibrinolytic activity, meaning it helps the body break down fibrin — the protein meshwork involved in blood clot formation. Clinical research suggests benefits for circulatory health, healthy blood viscosity, and post-flight leg circulation. Because of these effects on the clotting system, nattokinase should be discontinued at least two weeks before any scheduled surgery and is not appropriate for people on blood-thinning medications without clinician oversight. Standard dose is 100 mg (2,000 Fibrinolytic Units) per day on an empty stomach.",
  },

  // Gut & digestion
  {
    id: "psyllium", name: "Psyllium Husk Powder", brand: "NOW Foods",
    dose: "5 g (1 tbsp)", timing: "morning",
    purpose: "Fiber · cholesterol · regularity",
    evidence: "very strong", monthlyCost: 10, priority: 5,
    why: "Soluble fiber with strong evidence for cholesterol reduction, blood sugar moderation, and bowel regularity.",
    hue: "#d4a96a",
    tags: ["heart", "weight", "digestive-issues", "general", "longevity"],
    vegan: true,
    iherbSearch: "NOW Foods Psyllium Husk Powder",
    category: "gut",
    description: "Psyllium husk is a soluble dietary fiber derived from the seeds of Plantago ovata. When mixed with water, it forms a gel-like mass that slows digestion, traps cholesterol-carrying bile acids for elimination, and adds bulk to stool. Decades of clinical research support psyllium for healthy LDL cholesterol reduction, post-meal blood sugar moderation, and supporting both constipation and loose stools (it normalizes either direction). It is the only dietary fiber with an FDA-approved heart health claim. Standard dose is 5–15 g per day, mixed with at least 8 oz of water and consumed immediately. Start low to allow gut adaptation.",
  },
  {
    id: "inulin", name: "Inulin (Prebiotic Fiber)", brand: "NOW Foods",
    dose: "5 g", timing: "morning",
    purpose: "Prebiotic · gut microbiome · regularity",
    evidence: "strong", monthlyCost: 14, priority: 4,
    why: "Selective prebiotic that feeds beneficial Bifidobacterium and Lactobacillus. Supports microbiome diversity and short-chain fatty acid production.",
    hue: "#688a6b",
    tags: ["digestive-issues", "general", "immune", "weight"],
    vegan: true,
    iherbSearch: "NOW Foods Inulin Powder Prebiotic",
    category: "gut",
    description: "Inulin is a soluble fiber naturally found in chicory root, Jerusalem artichokes, garlic, onions, and asparagus. Because human enzymes cannot break it down, it passes intact to the large intestine where it is selectively fermented by beneficial bacteria — particularly Bifidobacterium and Lactobacillus species. This fermentation produces short-chain fatty acids like butyrate, which nourish colon cells and modulate immune function. Research supports inulin for microbiome diversity, regularity, calcium absorption, and metabolic markers. Start with 2–5 g per day to allow gut adaptation; some people experience initial gas or bloating that resolves within 1–2 weeks. Can be added to smoothies or coffee.",
  },
  {
    id: "ginger", name: "Ginger Root Extract", brand: "NOW Foods",
    dose: "500 mg standardised", timing: "morning",
    purpose: "Digestion · nausea · inflammation",
    evidence: "strong", monthlyCost: 11, priority: 5,
    why: "Three thousand years of digestive use, now backed by clinical evidence for nausea, IBS symptoms, and inflammation modulation.",
    hue: "#c4944a",
    tags: ["digestive-issues", "bloating", "joint", "inflammation"],
    vegan: true,
    iherbSearch: "NOW Foods Ginger Root Extract",
    warnings: ["blood-thinners"],
    category: "gut",
    description: "Ginger (Zingiber officinale) is one of the most-studied culinary herbs for its medicinal properties. Its active compounds — gingerols and shogaols — have been shown in randomized trials to relieve nausea (motion, pregnancy, post-operative, and chemotherapy-induced), reduce digestive bloating, support gastric emptying, and modulate inflammatory pathways relevant to joint comfort and exercise recovery. Standardized extracts deliver consistent gingerol content that fresh ginger does not. Standard doses range from 250–1,500 mg per day depending on the indication. Higher doses (above 4 g) should be approached cautiously alongside blood-thinning medications due to mild antiplatelet effects.",
  },

  // Antioxidants & nootropics extension
  {
    id: "green-tea", name: "Green Tea EGCG", brand: "Life Extension",
    dose: "400 mg EGCG", timing: "morning",
    purpose: "Antioxidant · metabolism · longevity",
    evidence: "strong", monthlyCost: 18, priority: 5,
    why: "Concentrated EGCG — the most-studied catechin. Supports thermogenesis, cardiovascular markers, and acts as a potent antioxidant.",
    hue: "#688a6b",
    tags: ["longevity", "weight", "heart", "general"],
    vegan: true,
    iherbSearch: "Life Extension Mega Green Tea Extract Decaffeinated",
    warnings: ["liver"],
    category: "antioxidants",
    description: "Green tea is one of the most-researched plant beverages in human medicine. Its primary bioactive — epigallocatechin gallate (EGCG) — is a potent polyphenol with antioxidant, mild thermogenic, and metabolic effects. Concentrated extracts deliver in a single capsule what would require 4–8 cups of brewed tea. Clinical research supports green tea EGCG for healthy cholesterol levels, metabolic rate, post-meal glucose handling, and as part of comprehensive longevity protocols. Decaffeinated versions are preferred for evening use or sensitive individuals. Standard doses are 300–600 mg of EGCG per day, taken with food to optimize absorption and minimize the rare risk of liver irritation seen at very high doses.",
  },
  {
    id: "l-tyrosine", name: "L-Tyrosine", brand: "NOW Foods",
    dose: "500 mg", timing: "morning",
    purpose: "Focus under stress · dopamine precursor",
    evidence: "strong", monthlyCost: 12, priority: 5,
    why: "Direct precursor to dopamine, norepinephrine, and thyroid hormone. Most impactful during acute stress, sleep deprivation, or cognitive demand.",
    hue: "#c4944a",
    tags: ["focus", "stress", "high-stress", "low-motivation", "brain-fog"],
    vegan: true,
    iherbSearch: "NOW Foods L-Tyrosine 500mg",
    category: "amino-acids",
    description: "L-Tyrosine is an amino acid that serves as the direct precursor to the catecholamines — dopamine, norepinephrine, and epinephrine — and to thyroid hormones. Under normal conditions, the body synthesizes adequate tyrosine from phenylalanine. But under acute stress, sleep deprivation, cold exposure, or intense cognitive demand, catecholamine production can outpace tyrosine availability, leading to decrements in working memory, attention, and mood. Military and aviation research consistently shows that tyrosine supplementation (1–2 g) preserves cognitive performance under these challenging conditions. It is best taken on an empty stomach 30–60 minutes before a stressful event. Less useful during ordinary unstressed circumstances.",
  },
  {
    id: "tudca", name: "TUDCA (Tauroursodeoxycholic Acid)", brand: "Nutricost",
    dose: "500 mg", timing: "evening",
    purpose: "Liver · bile flow · cellular stress",
    evidence: "moderate", monthlyCost: 32, priority: 4,
    why: "Bile acid that supports liver detox, bile flow, and protects cells against ER stress. Used by athletes alongside hormonal compounds.",
    hue: "#a78bfa",
    tags: ["liver", "longevity", "general"],
    vegan: false,
    iherbSearch: "Nutricost TUDCA 500mg",
    warnings: ["pregnant"],
    category: "specialty",
    description: "Tauroursodeoxycholic acid (TUDCA) is a bile acid naturally produced in trace amounts by gut bacteria from ursodeoxycholic acid (UDCA), a compound originally isolated from bear bile and used in human medicine for over a century to treat gallstones and certain liver conditions. TUDCA's standout property is its protective effect against endoplasmic reticulum (ER) stress — a state of cellular protein-folding overload implicated in liver disease, neurodegeneration, and diabetes. Supplementation supports liver function, healthy bile flow, eye health, and is often used as cycle support by athletes taking hepatotoxic compounds. Standard dose is 250–1,000 mg per day. Most TUDCA is bovine-derived; vegan synthetic options exist but are less common.",
  },
  {
    id: "whey-isolate", name: "Whey Protein Isolate", brand: "Naked Nutrition",
    dose: "25 g (1 scoop)", timing: "pre-train",
    purpose: "Muscle protein synthesis · recovery",
    evidence: "very strong", monthlyCost: 45, priority: 6,
    why: "Highest-quality, fast-absorbing protein with optimal leucine content for muscle protein synthesis. The default post-workout choice for non-vegans.",
    hue: "#d4a96a",
    tags: ["recovery", "active", "very-active", "strength", "weight"],
    vegan: false,
    iherbSearch: "Naked Whey Protein Isolate Grass Fed",
    warnings: ["dairy-allergy"],
    category: "performance",
    description: "Whey protein isolate is the most-studied protein supplement in sports nutrition. It contains all nine essential amino acids in a highly bioavailable form, with the highest leucine content per gram of any whole-food protein source — making it particularly effective at triggering muscle protein synthesis. Compared to whey concentrate, isolate is processed further to remove most fat and lactose (under 1%), making it suitable for many lactose-sensitive individuals. Grass-fed, undenatured sources retain the beneficial immunoglobulins and growth factors of fresh milk. Standard post-workout dose is 20–40 g within two hours of training. Whey isolate also supports satiety and lean mass preservation during fat loss.",
  },
  {
    id: "plant-protein", name: "Plant Protein Blend (Pea + Rice)", brand: "Naked Pea",
    dose: "25 g", timing: "pre-train",
    purpose: "Vegan muscle protein synthesis · recovery",
    evidence: "strong", monthlyCost: 42, priority: 6,
    why: "Complementary pea and rice proteins create a complete amino acid profile rivaling whey. The best vegan choice for muscle building.",
    hue: "#688a6b",
    tags: ["recovery", "active", "very-active", "strength", "vegan", "vegan-only", "weight"],
    vegan: true,
    iherbSearch: "Naked Pea Plant Protein",
    category: "performance",
    description: "Plant protein blends combining pea and brown rice protein create a complete amino acid profile that rivals whey protein for supporting muscle protein synthesis. Pea protein is naturally high in BCAAs and lysine but lower in methionine; brown rice protein is the inverse, making them perfect complementary sources. Single-source pea or rice proteins are not nutritionally inferior — but the blend simplifies things. Modern plant proteins have come a long way in texture and flavor. Choose minimally-processed brands with no added sugars or artificial sweeteners. Standard dose is 25–40 g post-workout. Sprouted varieties may improve digestibility and reduce phytate content.",
  },
  {
    id: "dha-prenatal", name: "DHA (Prenatal-Grade)", brand: "Nordic Naturals",
    dose: "480 mg DHA", timing: "morning",
    purpose: "Fetal brain · pregnancy · postpartum",
    evidence: "very strong", monthlyCost: 38, priority: 7,
    why: "Pregnancy increases DHA demand significantly. Adequate maternal DHA is critical for fetal brain development and reduces postpartum mood disorders.",
    hue: "#a78bfa",
    tags: ["female", "longevity", "memory"],
    vegan: false,
    iherbSearch: "Nordic Naturals Prenatal DHA",
    category: "omega-fats",
    description: "Docosahexaenoic acid (DHA) is the structural omega-3 fatty acid that makes up roughly 25% of the dry weight of the brain and retina. During the third trimester of pregnancy and the first two years of life, the developing infant brain accumulates DHA at an unprecedented rate, sourced almost entirely from the mother. Inadequate maternal DHA status is associated with reduced visual acuity in the infant, lower cognitive scores, and increased risk of postpartum mood disorders in the mother. The American College of Obstetricians and Gynecologists recommends at least 200–300 mg of DHA per day during pregnancy and lactation. Prenatal-grade DHA is tested for ultra-low mercury and PCBs.",
  },
  {
    id: "bcaa", name: "BCAAs (2:1:1 Leucine ratio)", brand: "Scivation Xtend",
    dose: "7 g", timing: "pre-train",
    purpose: "Intra-workout · muscle preservation",
    evidence: "moderate", monthlyCost: 28, priority: 4,
    why: "Branched-chain amino acids — leucine, isoleucine, valine — that preserve muscle during fasted or long training sessions.",
    hue: "#688a6b",
    tags: ["recovery", "active", "very-active", "strength"],
    vegan: true,
    iherbSearch: "Scivation Xtend BCAA",
    category: "performance",
    description: "Branched-chain amino acids (BCAAs) — leucine, isoleucine, and valine — are three of the nine essential amino acids and the only ones metabolized primarily in skeletal muscle rather than the liver. Leucine is the primary trigger of muscle protein synthesis via the mTOR pathway. BCAA supplementation is most valuable in specific contexts: during fasted training, long endurance sessions, or for individuals struggling to consume adequate total protein. For people already meeting protein targets (around 1.6 g/kg/day), adding whey or a complete protein source is generally more effective than isolated BCAAs. The standard 2:1:1 leucine ratio at 5–10 g per serving is the most-studied dose.",
  },
  {
    id: "eaa", name: "Essential Amino Acids (EAAs)", brand: "Kion",
    dose: "10 g", timing: "pre-train",
    purpose: "Complete muscle protein synthesis stimulus",
    evidence: "strong", monthlyCost: 38, priority: 5,
    why: "All 9 essential amino acids in optimal ratios. More effective than BCAAs alone for triggering muscle protein synthesis.",
    hue: "#c4944a",
    tags: ["recovery", "active", "very-active", "strength", "longevity"],
    vegan: true,
    iherbSearch: "Kion Aminos Essential Amino Acids",
    category: "performance",
    description: "Essential amino acids (EAAs) are the nine amino acids the body cannot synthesize and must obtain from diet: leucine, isoleucine, valine, lysine, methionine, threonine, phenylalanine, tryptophan, and histidine. While BCAA supplementation focuses on just three of these, more recent research consistently shows that complete EAA blends produce a stronger and more sustained muscle protein synthesis response — because all nine amino acids are required to build new muscle tissue. EAAs are particularly useful for older adults (whose anabolic resistance demands a stronger leucine threshold), fasted training, and people pursuing recomposition. Standard dose is 5–15 g per serving, taken before or during training.",
  },
  {
    id: "moringa", name: "Moringa Leaf Powder", brand: "Kuli Kuli",
    dose: "5 g", timing: "morning",
    purpose: "Greens · iron · vitamin A · plant nutrition",
    evidence: "moderate", monthlyCost: 18, priority: 3,
    why: "One of the most nutrient-dense leafy greens on earth. Concentrated source of iron, vitamins A and C, protein, and antioxidants.",
    hue: "#688a6b",
    tags: ["general", "vegan", "vegetarian", "energy", "low-energy"],
    vegan: true,
    iherbSearch: "Kuli Kuli Moringa Powder Organic",
    category: "greens",
    description: "Moringa oleifera is a small fast-growing tree native to northern India and used for centuries as a food and medicine across South Asia and East Africa. Often called the 'miracle tree,' its leaves are exceptionally nutrient-dense — gram for gram providing significant amounts of vitamin A, vitamin C, calcium, iron, and complete plant protein. Modern research has explored moringa's bioactive compounds (particularly the isothiocyanates and quercetin) for antioxidant effects, blood sugar support, and inflammation modulation. The leaf powder has a slightly earthy taste and can be added to smoothies, soups, or warm water. Standard doses are 2–8 g of powder per day.",
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
