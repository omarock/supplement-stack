import { SUPPLEMENT_DB, type Supplement } from "./supplements";

export interface PreMadeStack {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "Goal" | "Persona" | "Life Stage" | "Foundation";
  supplementIds: string[];
  optionalSupplementIds?: string[];      // suggested add-ons rendered as a separate "optional" section
  bestFor: string[];
  warnings?: string[];
  benefits: string[];
  monthlyCostRange: string;
  expectedTimeline: string;
  coverBg: string;
  coverGlyph: string;
  coverInk: string;
  popularity?: number; // 1 (most popular) → high (less)
}

// ─── 15 pre-made stacks ──────────────────────────────────────────────────────
export const STACKS: PreMadeStack[] = [
  {
    id: "foundation",
    slug: "foundation-stack",
    name: "The Foundation Stack",
    tagline: "The three supplements almost everyone benefits from.",
    description: "If you only take three supplements, take these. Vitamin D3 (most people are deficient), Omega-3 (modern diets are low in EPA/DHA), and Magnesium (50%+ of adults don't meet the RDA). This is the floor — everything else builds on top.",
    category: "Foundation",
    supplementIds: ["d3k2", "omega3", "mag-glycinate", "b-complex", "creatine"],
    optionalSupplementIds: ["probiotic"],
    bestFor: ["Beginners", "Anyone unsure where to start", "Budget-conscious", "General wellness"],
    benefits: [
      "Covers the 3 most common deficiencies in modern diets",
      "Backed by the strongest evidence base",
      "Maximum impact for minimum cost",
      "Safe for almost everyone with no underlying conditions",
    ],
    monthlyCostRange: "$40-55",
    expectedTimeline: "Cumulative benefits in 4-8 weeks.",
    coverBg: "linear-gradient(135deg, #a87a52 0%, #6b4d2f 100%)",
    coverGlyph: "◎", coverInk: "#fbf6ec", popularity: 1,
  },

  {
    id: "sleep",
    slug: "best-supplements-for-sleep",
    name: "The Sleep Stack",
    tagline: "Deeper sleep, fewer trips to the bathroom.",
    description: "A three-supplement evening ritual that calms the nervous system, lowers cortisol, and deepens restorative sleep cycles. Most users notice improvements within 1-2 weeks.",
    category: "Goal",
    supplementIds: ["mag-glycinate", "ashwagandha", "glycine", "l-theanine", "melatonin"],
    optionalSupplementIds: ["reishi"],
    bestFor: ["Trouble falling asleep", "Waking up at night", "Don't feel rested in the morning", "Stress-driven insomnia"],
    warnings: ["Skip ashwagandha if pregnant or on thyroid medication"],
    benefits: [
      "Faster sleep onset (10-30 min reduction in latency)",
      "Fewer middle-of-night wakings",
      "Deeper, more restorative sleep cycles",
      "Calmer evening wind-down",
    ],
    monthlyCostRange: "$40-50",
    expectedTimeline: "Initial improvements in 1-2 weeks. Full effect in 4-6 weeks.",
    coverBg: "linear-gradient(135deg, #324d36 0%, #1c2e1f 100%)",
    coverGlyph: "☾", coverInk: "#cfdcc8", popularity: 2,
  },

  {
    id: "energy",
    slug: "best-supplements-for-energy",
    name: "The Energy Stack",
    tagline: "Steady output, no caffeine crashes.",
    description: "Fuels cellular energy production at the root level. Supports mitochondrial function, addresses common nutrient gaps that cause fatigue, and adds an adaptogen for performance under stress.",
    category: "Goal",
    supplementIds: ["d3k2", "b-complex", "rhodiola", "coq10", "acetyl-l-carnitine"],
    optionalSupplementIds: ["iron"],
    bestFor: ["Persistent fatigue", "Afternoon crashes", "Low motivation", "Mental fog at work"],
    warnings: ["Skip rhodiola if pregnant or have bipolar disorder"],
    benefits: [
      "Sustained daytime energy without caffeine spikes",
      "Reduced afternoon energy crashes",
      "Better stress resilience under workload",
      "Sharper morning focus",
    ],
    monthlyCostRange: "$75-90",
    expectedTimeline: "Daily energy improvements in 2-4 weeks.",
    coverBg: "linear-gradient(135deg, #c4944a 0%, #8b6730 100%)",
    coverGlyph: "☀", coverInk: "#fbf6ec", popularity: 3,
  },

  {
    id: "focus",
    slug: "best-supplements-for-focus",
    name: "The Focus Stack",
    tagline: "Sharper mind, calmer attention.",
    description: "Combines the most well-studied cognitive enhancers. Omega-3 for brain structure, L-theanine for calm focus, lion's mane for neuroplasticity, and B-complex for neurotransmitter synthesis.",
    category: "Goal",
    supplementIds: ["omega3", "l-theanine", "lions-mane", "b-complex", "citicoline"],
    optionalSupplementIds: ["bacopa"],
    bestFor: ["Brain fog", "Work-from-home productivity", "Students", "Knowledge workers", "Memory concerns"],
    benefits: [
      "Improved sustained attention",
      "Reduced brain fog and mental fatigue",
      "Better short-term memory and recall",
      "Calm focus without jitters or crashes",
    ],
    monthlyCostRange: "$70-85",
    expectedTimeline: "L-theanine works same-day. Omega-3 and lion's mane build over 6-8 weeks.",
    coverBg: "linear-gradient(135deg, #4a6a4e 0%, #324d36 100%)",
    coverGlyph: "✦", coverInk: "#fbf6ec", popularity: 4,
  },

  {
    id: "stress",
    slug: "best-supplements-for-stress",
    name: "The Stress Stack",
    tagline: "Calmer baseline, no sedation.",
    description: "Four ingredients that modulate the stress response from different angles. Ashwagandha lowers cortisol, L-theanine eases acute anxiety, magnesium relaxes the nervous system, and rhodiola builds resilience to chronic stress.",
    category: "Goal",
    supplementIds: ["ashwagandha", "l-theanine", "mag-glycinate", "rhodiola", "holy-basil"],
    optionalSupplementIds: ["phosphatidylserine"],
    bestFor: ["Chronic stress", "Anxiety", "Burnout recovery", "High-pressure jobs", "Wired-but-tired evenings"],
    warnings: ["Skip ashwagandha if pregnant or on thyroid medication"],
    benefits: [
      "Lower baseline cortisol levels",
      "Calmer response to daily stressors",
      "Better sleep onset and quality",
      "Reduced muscle tension and tightness",
    ],
    monthlyCostRange: "$60-70",
    expectedTimeline: "L-theanine works same-day. Ashwagandha and rhodiola build over 4-8 weeks.",
    coverBg: "linear-gradient(135deg, #a3604a 0%, #6e3d2c 100%)",
    coverGlyph: "♡", coverInk: "#fbf6ec", popularity: 5,
  },

  {
    id: "recovery",
    slug: "best-supplements-for-recovery",
    name: "The Recovery Stack",
    tagline: "Train harder. Recover faster.",
    description: "Built for people who train 3+ times a week. Creatine for performance, omega-3 and curcumin for inflammation, collagen for joints and connective tissue, magnesium for sleep-based recovery.",
    category: "Persona",
    supplementIds: ["creatine", "omega3", "curcumin", "collagen", "mag-glycinate"],
    optionalSupplementIds: ["l-glutamine"],
    bestFor: ["Strength athletes", "Endurance training", "Joint stiffness", "Post-workout soreness", "Recovery between sessions"],
    warnings: ["Skip high-dose omega-3 and curcumin if on blood thinners"],
    benefits: [
      "Faster recovery between workouts",
      "Improved strength and output",
      "Reduced joint and muscle soreness",
      "Better sleep-driven recovery",
    ],
    monthlyCostRange: "$80-100",
    expectedTimeline: "Creatine effects in 2-3 weeks. Joint benefits in 6-12 weeks.",
    coverBg: "linear-gradient(135deg, #688a6b 0%, #4a6a4e 100%)",
    coverGlyph: "↺", coverInk: "#fbf6ec", popularity: 6,
  },

  {
    id: "immunity",
    slug: "best-supplements-for-immunity",
    name: "The Immunity Stack",
    tagline: "Resilient through every season.",
    description: "Strengthens the immune pillar with the four most-studied nutrients — vitamin D3, vitamin C, zinc — plus a multi-strain probiotic for the gut-immune axis. Elderberry on standby for the first sign of illness.",
    category: "Goal",
    supplementIds: ["d3k2", "vit-c", "zinc", "probiotic", "elderberry"],
    optionalSupplementIds: ["quercetin"],
    bestFor: ["Frequent colds or flu", "Seasonal immune support", "Recovery after illness", "Travelers"],
    warnings: ["Elderberry is not recommended for active autoimmune conditions"],
    benefits: [
      "Stronger first-line immune defense",
      "Reduced frequency of illness",
      "Shorter duration when sick",
      "Healthier gut microbiome",
    ],
    monthlyCostRange: "$55-75",
    expectedTimeline: "Foundational support immediately. Cumulative benefits in 2-3 months.",
    coverBg: "linear-gradient(135deg, #c2410c 0%, #9a2e08 100%)",
    coverGlyph: "⊕", coverInk: "#fbf6ec", popularity: 7,
  },

  {
    id: "vegan",
    slug: "vegan-essentials-stack",
    name: "The Vegan Essentials",
    tagline: "Plant-based, perfectly covered.",
    description: "Plant-based diets are nutrient-dense — but three specific things are missing, and three others run low. This stack fills every common gap so you can stay vegan with confidence.",
    category: "Persona",
    supplementIds: ["b12", "omega3-algae", "d3k2", "iron", "zinc", "creatine"],
    optionalSupplementIds: ["vit-k2"],
    bestFor: ["Vegans", "Strict vegetarians", "Plant-based athletes", "Anyone reducing animal products"],
    benefits: [
      "Covers the non-negotiable vegan gap: B12",
      "Plant-based EPA/DHA (no fish needed)",
      "Iron and zinc absorption support",
      "Creatine fills the muscle and cognition gap",
    ],
    monthlyCostRange: "$75-95",
    expectedTimeline: "B12 status improves in 4-8 weeks. Iron in 8-12 weeks.",
    coverBg: "linear-gradient(135deg, #688a6b 0%, #4a6a4e 100%)",
    coverGlyph: "✿", coverInk: "#fbf6ec", popularity: 8,
  },

  {
    id: "longevity",
    slug: "healthy-aging-stack",
    name: "The Healthy Aging Stack",
    tagline: "Age slower. Move better. Stay sharp.",
    description: "Six ingredients chosen for their cumulative evidence on healthspan — cardiovascular, joint, cognitive, and mitochondrial function. Especially valuable after 40, when natural reserves of these compounds drop.",
    category: "Life Stage",
    supplementIds: ["d3k2", "omega3", "curcumin", "coq10", "mag-glycinate", "collagen"],
    optionalSupplementIds: ["nac"],
    bestFor: ["Adults 40+", "Anyone focused on longevity", "Family history of heart or joint issues"],
    warnings: ["Skip high-dose omega-3 and curcumin if on blood thinners"],
    benefits: [
      "Supports cardiovascular and joint resilience",
      "Backed by strong longevity research",
      "Mitochondrial energy support via CoQ10",
      "Anti-inflammatory daily baseline",
    ],
    monthlyCostRange: "$100-120",
    expectedTimeline: "Energy benefits in 4-6 weeks. Joint/inflammation in 8-12 weeks.",
    coverBg: "linear-gradient(135deg, #8b6730 0%, #5a3f17 100%)",
    coverGlyph: "○", coverInk: "#fbf6ec", popularity: 9,
  },

  {
    id: "hormonal",
    slug: "hormonal-balance-stack",
    name: "The Hormonal Balance Stack",
    tagline: "Smoother cycles, steadier mood.",
    description: "A women's stack focused on the most common nutrient gaps that affect cycle regularity, PMS, mood, and energy. Magnesium and B6 (in B-complex) work synergistically for hormone signaling.",
    category: "Life Stage",
    supplementIds: ["mag-glycinate", "d3k2", "omega3", "b-complex", "iron"],
    optionalSupplementIds: ["inositol"],
    bestFor: ["PMS or PMDD symptoms", "Irregular cycles", "Mood swings", "Low energy through cycle", "Perimenopause"],
    warnings: ["Skip iron supplementation if not deficient — get a ferritin test first", "Consult a clinician if pregnant or planning pregnancy"],
    benefits: [
      "Supports hormone production and clearance",
      "Eases PMS symptoms (cramps, mood, bloating)",
      "Stabilises mood and energy through the cycle",
      "Replenishes iron lost during menstruation",
    ],
    monthlyCostRange: "$70-85",
    expectedTimeline: "PMS improvements in 1-2 cycles. Iron status in 8-12 weeks.",
    coverBg: "linear-gradient(135deg, #9d5060 0%, #6e3a45 100%)",
    coverGlyph: "♀", coverInk: "#fbf6ec", popularity: 10,
  },

  {
    id: "beauty",
    slug: "skin-hair-nails-stack",
    name: "The Beauty Stack",
    tagline: "Inside-out support for skin, hair, and nails.",
    description: "Beauty isn't topical. This stack supports the cellular building blocks — collagen and keratin synthesis, antioxidant defense against oxidative damage, and the omega-3s that keep skin barrier intact.",
    category: "Persona",
    supplementIds: ["collagen", "biotin", "vit-c", "omega3", "zinc"],
    optionalSupplementIds: ["astaxanthin"],
    bestFor: ["Skin elasticity concerns", "Hair thinning or shedding", "Brittle nails", "Slow wound healing"],
    benefits: [
      "Supports collagen synthesis from within",
      "Strengthens keratin in hair and nails",
      "Antioxidant defense against UV and oxidative stress",
      "Healthier skin barrier and hydration",
    ],
    monthlyCostRange: "$70-85",
    expectedTimeline: "Nail strength in 4-8 weeks. Hair and skin changes in 3-6 months.",
    coverBg: "linear-gradient(135deg, #c4794a 0%, #8a4d22 100%)",
    coverGlyph: "✧", coverInk: "#fbf6ec", popularity: 11,
  },

  // ── New stacks leveraging the expanded library ──────────────────────────
  {
    id: "longevity-advanced",
    slug: "longevity-blueprint-stack",
    name: "The Longevity Blueprint",
    tagline: "The frontier protocol for slower biological aging.",
    description: "Built around the same compounds discussed in the labs of Sinclair, Attia, and Huberman. NMN restores NAD+; urolithin A triggers mitophagy; fisetin clears senescent cells; pterostilbene activates sirtuins. The state of the art for cellular renewal.",
    category: "Life Stage",
    supplementIds: ["nmn", "urolithin-a", "fisetin", "pterostilbene", "tmg", "apigenin"],
    optionalSupplementIds: ["spermidine"],
    bestFor: ["Biohackers", "Adults 35+ thinking about healthspan", "Anyone with a family history of age-related decline"],
    warnings: ["Cycle fisetin (e.g. 2 days/month at higher dose)", "Pair NMN/NR with TMG to replace methyl groups"],
    benefits: [
      "Replenishes NAD+ levels via NMN",
      "Triggers mitophagy (cellular recycling) via urolithin A",
      "Selectively clears senescent ('zombie') cells with fisetin",
      "Activates sirtuin longevity pathways with pterostilbene",
    ],
    monthlyCostRange: "$180-220",
    expectedTimeline: "Energy and endurance in 4-8 weeks. Biomarker shifts (DNA methylation age) in 4-7 months.",
    coverBg: "linear-gradient(135deg, #6d4aa3 0%, #3f1f6e 100%)",
    coverGlyph: "∞", coverInk: "#f5efff", popularity: 12,
  },

  {
    id: "gut-advanced",
    slug: "gut-reset-stack",
    name: "The Gut Reset Stack",
    tagline: "Repair the lining. Rebalance the microbiome.",
    description: "A four-layer approach to gut healing: zinc-carnosine repairs the lining, S. boulardii crowds out opportunistic yeast, tributyrin feeds colon cells directly, DGL soothes the upper GI. Built for IBS, post-antibiotic recovery, and chronic bloating.",
    category: "Goal",
    supplementIds: ["zinc-carnosine", "s-boulardii", "tributyrin", "dgl", "probiotic", "l-glutamine"],
    optionalSupplementIds: ["digestive-enzymes"],
    bestFor: ["IBS or chronic bloating", "Recovery after antibiotics", "Acid reflux", "Suspected 'leaky gut'"],
    benefits: [
      "Repairs the gastric and intestinal lining",
      "Fuels colonocytes with direct butyrate",
      "Crowds out opportunistic gut yeast",
      "Soothes the upper GI between meals",
    ],
    monthlyCostRange: "$110-140",
    expectedTimeline: "Reflux and bloating relief in 2-4 weeks. Full microbiome rebalance in 3 months.",
    coverBg: "linear-gradient(135deg, #b5751e 0%, #6e4509 100%)",
    coverGlyph: "❀", coverInk: "#fff3dd", popularity: 13,
  },

  {
    id: "athletic-performance",
    slug: "athletic-performance-stack",
    name: "The Athletic Performance Stack",
    tagline: "Train harder. Recover smarter. Adapt faster.",
    description: "For serious athletes: creatine for power, beta-alanine for buffering, HMB for muscle preservation, tart cherry for inflammation and sleep recovery, omega-3 for joint resilience, and l-citrulline for blood flow. Built on the strongest evidence in sport science.",
    category: "Persona",
    supplementIds: ["creatine", "beta-alanine", "hmb", "tart-cherry", "omega3", "l-citrulline"],
    optionalSupplementIds: ["eaa"],
    bestFor: ["Strength athletes", "Endurance training 5+ days/week", "Competitive athletes", "Hybrid training"],
    warnings: ["Beta-alanine causes a harmless tingling sensation in some people"],
    benefits: [
      "Greater strength and power output",
      "Higher training volume tolerance",
      "Reduced inflammation and faster soreness recovery",
      "Better sleep-driven recovery between sessions",
    ],
    monthlyCostRange: "$95-130",
    expectedTimeline: "Creatine fully saturates in 3-4 weeks. Recovery benefits 2-6 weeks.",
    coverBg: "linear-gradient(135deg, #324d36 0%, #16241a 100%)",
    coverGlyph: "⚡", coverInk: "#d4e4d2", popularity: 14,
  },

  {
    id: "menopause",
    slug: "perimenopause-menopause-stack",
    name: "The Menopause Support Stack",
    tagline: "Steadier hormones through the transition.",
    description: "Designed for perimenopause and postmenopause. Black cohosh for hot flashes (the most-evidenced herb), chasteberry for luteal balance in perimenopause, magnesium for sleep and mood, D3+K2 and calcium for bone density, omega-3 for cardiovascular and mood support.",
    category: "Life Stage",
    supplementIds: ["black-cohosh", "chasteberry", "mag-glycinate", "d3k2", "calcium", "omega3"],
    optionalSupplementIds: ["ashwagandha"],
    bestFor: ["Perimenopause symptoms", "Hot flashes and night sweats", "Mood swings", "Bone density concerns"],
    warnings: ["Black cohosh should be continuous (not cycled) for at least 8 weeks", "Discuss with a clinician if on hormone therapy"],
    benefits: [
      "Reduced frequency and intensity of hot flashes",
      "Better sleep through the night",
      "Bone density support during the high-loss window",
      "Steadier mood and energy through cycle changes",
    ],
    monthlyCostRange: "$90-115",
    expectedTimeline: "Hot flash relief in 4-8 weeks. Mood stabilizes over 2-3 months.",
    coverBg: "linear-gradient(135deg, #a3604a 0%, #6e3d2c 100%)",
    coverGlyph: "♀", coverInk: "#fff3dd", popularity: 15,
  },
];

export function getStack(slug: string): PreMadeStack | undefined {
  return STACKS.find(s => s.slug === slug);
}

export function getStackSupplements(stack: PreMadeStack): Supplement[] {
  return stack.supplementIds
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s));
}

export function getStackOptionalSupplements(stack: PreMadeStack): Supplement[] {
  return (stack.optionalSupplementIds ?? [])
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s));
}

export function stackMonthlyCost(stack: PreMadeStack): number {
  return getStackSupplements(stack).reduce((sum, s) => sum + s.monthlyCost, 0);
}
