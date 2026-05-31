/**
 * Goal dataset for the programmatic "Best supplements for [goal]" pages
 * (/best/[slug]). Each goal either filters SUPPLEMENT_DB by `tags` or uses a
 * curated `ids` list for nuanced goals. Grounded in the existing ingredient
 * data, no thin pages.
 */
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";

export interface Goal {
  slug: string;
  label: string;        // "sleep"
  h1: string;           // "Best Supplements for Sleep"
  intro: string;        // 1-2 sentences
  tags?: string[];      // filter mode
  ids?: string[];       // curated mode (overrides tags)
  stackSlug?: string;   // link to a matching ready-made stack
  faq: { q: string; a: string }[];
}

export const GOALS: Goal[] = [
  {
    slug: "sleep", label: "sleep", h1: "Best Supplements for Sleep",
    intro: "The most evidence-backed supplements for falling asleep faster and sleeping more deeply, and how to take them. Sleep supplements work best alongside good sleep habits, not instead of them.",
    tags: ["sleep", "low-sleep", "sleep-onset", "wake-at-night"], stackSlug: "best-supplements-for-sleep",
    faq: [
      { q: "What is the best supplement for sleep?", a: "Magnesium glycinate and glycine are among the best-evidenced for sleep quality, with L-theanine for calming the mind and low-dose melatonin (0.5-1 mg) for sleep timing. The right one depends on whether your issue is falling asleep or staying asleep." },
      { q: "Is melatonin safe to take every night?", a: "Short-term use of low-dose melatonin is generally considered safe for most adults, but it's best used occasionally or for resetting sleep timing rather than indefinitely. Talk to a clinician for ongoing sleep problems." },
    ],
  },
  {
    slug: "energy", label: "energy", h1: "Best Supplements for Energy",
    intro: "Supplements that support real, sustained energy, by fixing common deficiencies and supporting your mitochondria, without the crash of caffeine.",
    tags: ["energy", "low-energy", "afternoon-crash"], stackSlug: "best-supplements-for-energy",
    faq: [
      { q: "Which supplements actually boost energy?", a: "If you're low, fixing vitamin D, B12, iron and magnesium often does the most. For mitochondrial energy, CoQ10 and a B-complex help, and rhodiola supports energy under stress, all without caffeine's crash." },
      { q: "Why am I always tired despite supplements?", a: "Persistent fatigue can come from low iron/ferritin, low vitamin D or B12, thyroid issues, poor sleep, or stress. A blood test is the fastest way to find the cause, upload yours to suppdoc's bloodwork analysis." },
    ],
  },
  {
    slug: "focus", label: "focus", h1: "Best Supplements for Focus & Concentration",
    intro: "Nootropic and foundational supplements that support attention, mental clarity and memory, graded by the strength of their evidence.",
    tags: ["focus", "brain-fog", "poor-focus", "memory"], stackSlug: "best-supplements-for-focus",
    faq: [
      { q: "What supplements help with focus?", a: "L-theanine (especially with caffeine), omega-3 (DHA), and citicoline have the best evidence for focus and clarity; lion's mane and bacopa support memory over weeks of use." },
      { q: "Do nootropics really work?", a: "Some do, modestly. The best-evidenced are unglamorous, omega-3, L-theanine, and fixing sleep and deficiencies. Be skeptical of 'limitless' claims; suppdoc grades each by real evidence." },
    ],
  },
  {
    slug: "stress", label: "stress", h1: "Best Supplements for Stress",
    intro: "Adaptogens and calming nutrients that lower the body's stress response and support a steadier baseline, with the evidence for each.",
    tags: ["stress", "high-stress", "anxiety"], stackSlug: "best-supplements-for-stress",
    faq: [
      { q: "What is the best supplement for stress?", a: "Ashwagandha has the strongest evidence for lowering cortisol and perceived stress; L-theanine and magnesium glycinate help with in-the-moment calm and relaxation." },
      { q: "How long do stress supplements take to work?", a: "L-theanine and magnesium can feel calming within an hour; adaptogens like ashwagandha usually take 2-4 weeks of daily use to show their full effect." },
    ],
  },
  {
    slug: "anxiety", label: "anxiety", h1: "Best Supplements for Anxiety",
    intro: "Calming supplements with evidence for easing everyday anxiety and tension. These support, but don't replace, professional care for anxiety disorders.",
    tags: ["anxiety", "stress", "high-stress"],
    faq: [
      { q: "What supplements help with anxiety?", a: "Ashwagandha, L-theanine, magnesium glycinate, and saffron have the most supportive evidence for everyday anxiety. If anxiety is significant or persistent, please speak with a healthcare professional." },
      { q: "Is magnesium good for anxiety?", a: "Magnesium (especially glycinate) supports the nervous system and many people find it calming, particularly if they're low. It's gentle and well tolerated." },
    ],
  },
  {
    slug: "recovery", label: "recovery", h1: "Best Supplements for Muscle Recovery",
    intro: "Supplements that reduce soreness, support repair, and get you back to training faster, ranked by evidence.",
    tags: ["recovery", "active", "joint"], stackSlug: "best-supplements-for-recovery",
    faq: [
      { q: "What helps muscle recovery the most?", a: "Protein and creatine for repair and performance, omega-3 and tart cherry to lower soreness and inflammation, and magnesium for sleep-driven recovery." },
      { q: "Should I take supplements before or after a workout?", a: "Creatine timing barely matters, consistency does. Protein within a few hours of training, tart cherry and omega-3 daily, and magnesium in the evening for recovery sleep." },
    ],
  },
  {
    slug: "immunity", label: "immunity", h1: "Best Supplements for Immunity",
    intro: "The supplements with real evidence for supporting immune function, and which to reach for at the first sign of a cold.",
    tags: ["immune", "frequent-illness"], stackSlug: "best-supplements-for-immunity",
    faq: [
      { q: "What are the best supplements for immunity?", a: "Vitamin D is foundational (especially if you're low); zinc and vitamin C (with quercetin) are most useful at the onset of a cold; elderberry may shorten symptoms." },
      { q: "Does vitamin C prevent colds?", a: "Vitamin C doesn't reliably prevent colds in most people, but it may modestly shorten them, especially when started early and paired with zinc." },
    ],
  },
  {
    slug: "longevity", label: "longevity", h1: "Best Supplements for Longevity",
    intro: "The most-discussed longevity supplements, from NAD+ precursors to senolytics, with an honest read on how strong (or early) the evidence really is.",
    tags: ["longevity", "anti-aging"], stackSlug: "longevity-blueprint-stack",
    faq: [
      { q: "What supplements are best for longevity?", a: "The best-evidenced 'longevity' basics are unglamorous: omega-3, vitamin D, and exercise-supporting nutrients. Frontier options like NMN/NR, fisetin, and urolithin A are promising but still early in human research." },
      { q: "Do NAD+ supplements like NMN work?", a: "NMN and NR reliably raise NAD+ levels in the blood, but whether that translates to living longer in humans isn't yet proven. They're reasonable to try with realistic expectations." },
    ],
  },
  {
    slug: "joint-pain", label: "joint comfort", h1: "Best Supplements for Joint Pain",
    intro: "Supplements that support cartilage, ease joint inflammation, and improve comfort and mobility, with the evidence for each.",
    tags: ["joint", "joint-pain", "recovery"],
    faq: [
      { q: "What is the best supplement for joint pain?", a: "Curcumin and omega-3 have the best evidence for easing joint inflammation; glucosamine and MSM may help cartilage and comfort over time; boswellia is a useful anti-inflammatory add-on." },
      { q: "How long until joint supplements work?", a: "Anti-inflammatories like curcumin can help within weeks; structural support from glucosamine often takes 2-3 months of consistent use." },
    ],
  },
  {
    slug: "mood", label: "mood", h1: "Best Supplements for Mood",
    intro: "Nutrients and botanicals with evidence for supporting a brighter, steadier mood. These support wellbeing but are not a substitute for treatment of depression.",
    tags: ["low-mood", "mood", "stress"],
    faq: [
      { q: "What supplements help mood?", a: "Omega-3 (high-EPA), vitamin D, saffron, and B-vitamins have the most supportive mood evidence. If your mood is persistently low, please reach out to a healthcare professional." },
      { q: "Can vitamin D affect mood?", a: "Low vitamin D is linked to lower mood, and correcting a deficiency can help. It's worth testing your level, upload your labs to suppdoc to see where you stand." },
    ],
  },
  {
    slug: "gut-health", label: "gut health", h1: "Best Supplements for Gut Health",
    intro: "Probiotics, prebiotics, and gut-lining support with evidence for digestion, bloating, and a healthier microbiome.",
    tags: ["gut", "digestive-issues", "bloating"], stackSlug: "gut-reset-stack",
    faq: [
      { q: "What are the best supplements for gut health?", a: "A quality probiotic plus a prebiotic fibre (a 'synbiotic') supports the microbiome; L-glutamine and zinc-carnosine support the gut lining; digestive enzymes help with breakdown." },
      { q: "Do probiotics help with bloating?", a: "For some people, yes, particularly specific strains. Pairing a probiotic with a prebiotic and easing into fibre (to avoid initial gas) tends to work best." },
    ],
  },
  {
    slug: "skin", label: "skin", h1: "Best Supplements for Skin",
    intro: "Supplements with evidence for skin hydration, elasticity, and a healthy glow, from collagen to antioxidants.",
    tags: ["skin", "beauty"], stackSlug: "skin-hair-nails-stack",
    faq: [
      { q: "What supplements are good for skin?", a: "Collagen (with vitamin C, which is required to build it), hyaluronic acid for hydration, omega-3 for the skin barrier, and astaxanthin as a protective antioxidant." },
      { q: "Does collagen actually improve skin?", a: "A growing body of trials suggests hydrolysed collagen can improve skin elasticity and hydration over 8-12 weeks. Pair it with vitamin C for best results." },
    ],
  },
  {
    slug: "hair", label: "hair", h1: "Best Supplements for Hair Growth",
    intro: "Supplements that support stronger, healthier hair, and an honest note on when a deficiency (like iron) is the real cause.",
    tags: ["hair", "beauty"], stackSlug: "skin-hair-nails-stack",
    faq: [
      { q: "What supplements help hair growth?", a: "If you're deficient, correcting iron/ferritin, vitamin D and zinc often matters most. Collagen, biotin and silica support the hair matrix, though biotin only helps if you're low." },
      { q: "Does biotin really work for hair?", a: "Biotin helps mainly in people who are genuinely deficient, which is uncommon. If your hair is thinning, check ferritin and thyroid first, a blood test is the fastest answer." },
    ],
  },
  {
    slug: "heart-health", label: "heart health", h1: "Best Supplements for Heart Health",
    intro: "Supplements with cardiovascular evidence, for cholesterol, triglycerides, blood pressure, and heart-muscle energy.",
    tags: ["heart"],
    faq: [
      { q: "What are the best supplements for heart health?", a: "Omega-3 (for triglycerides), CoQ10 (heart-muscle energy, especially on statins), and bergamot or aged garlic for cholesterol support have the most evidence." },
      { q: "Which supplement lowers cholesterol?", a: "Bergamot, red yeast rice, and aged garlic have evidence for lowering cholesterol, and omega-3 lowers triglycerides. Discuss with your doctor, particularly alongside statins." },
    ],
  },
  {
    slug: "testosterone", label: "testosterone", h1: "Best Supplements for Testosterone",
    intro: "Supplements with evidence for supporting healthy testosterone, most effective when you're correcting a deficiency rather than chasing 'boosts'.",
    ids: ["d3k2", "zinc", "mag-glycinate", "boron", "ashwagandha", "tongkat-ali", "d-aspartic", "maca"],
    faq: [
      { q: "What supplements increase testosterone?", a: "Correcting low vitamin D, zinc and magnesium helps most if you're deficient. Ashwagandha (via lower cortisol), boron, and tongkat ali have supportive evidence; D-aspartic acid's effect is modest and short-lived." },
      { q: "Do testosterone boosters actually work?", a: "Most 'boosters' do little in men with normal levels. The biggest levers are sleep, training, body fat, and fixing deficiencies. Test your level before spending on supplements." },
    ],
  },
  {
    slug: "weight-loss", label: "weight management", h1: "Best Supplements for Weight Management",
    intro: "Supplements that support metabolism, appetite, and blood sugar as an adjunct to diet and movement, with realistic expectations.",
    tags: ["weight"],
    faq: [
      { q: "What supplements help with weight loss?", a: "No supplement replaces a calorie deficit, but berberine and chromium support blood-sugar control, fibre (psyllium) supports fullness, and protein preserves muscle while dieting." },
      { q: "Does berberine help you lose weight?", a: "Berberine modestly improves insulin sensitivity and metabolic markers, which can support weight efforts, but it's a helper, not a substitute for diet and activity." },
    ],
  },
  {
    slug: "blood-sugar", label: "blood sugar", h1: "Best Supplements for Blood Sugar",
    intro: "Supplements with evidence for supporting healthy blood-sugar and insulin sensitivity, useful alongside diet, not instead of medical care.",
    ids: ["berberine", "chromium", "ala", "mag-glycinate", "inositol"],
    faq: [
      { q: "What is the best supplement for blood sugar?", a: "Berberine has the strongest evidence (often compared to metformin in trials); chromium, alpha-lipoic acid, and magnesium also support glucose metabolism and insulin sensitivity." },
      { q: "Can I take berberine with diabetes medication?", a: "Berberine can lower blood sugar meaningfully, so combining it with diabetes medication risks hypoglycaemia. Only do so under a clinician's supervision." },
    ],
  },
  {
    slug: "brain-fog", label: "brain fog", h1: "Best Supplements for Brain Fog",
    intro: "Supplements that support mental clarity when you're foggy, plus the common deficiencies and habits worth ruling out first.",
    tags: ["brain-fog", "memory", "focus"],
    faq: [
      { q: "What helps with brain fog?", a: "Omega-3, B12 and vitamin D (if low), and L-theanine for clarity have the best evidence. But brain fog is often driven by poor sleep, stress, dehydration, or a deficiency, worth checking first." },
      { q: "Can low B12 cause brain fog?", a: "Yes, low B12 is a classic cause of fogginess and fatigue, especially in vegans/vegetarians and older adults. A blood test will tell you quickly." },
    ],
  },
];

export function goalBySlug(slug: string): Goal | undefined {
  return GOALS.find(g => g.slug === slug);
}

function evidenceWeight(e: Supplement["evidence"]) {
  return e === "very strong" ? 3 : e === "strong" ? 2 : 1;
}

/** Resolve the ranked ingredient list for a goal (curated ids or tag filter). */
export function ingredientsForGoal(goal: Goal, limit = 10): Supplement[] {
  let list: Supplement[];
  if (goal.ids && goal.ids.length) {
    list = goal.ids.map(id => SUPPLEMENT_DB.find(s => s.id === id)).filter((s): s is Supplement => Boolean(s));
  } else {
    const tags = goal.tags ?? [];
    list = SUPPLEMENT_DB.filter(s => s.tags.some(t => tags.includes(t)));
  }
  return list
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || evidenceWeight(b.evidence) - evidenceWeight(a.evidence) || a.monthlyCost - b.monthlyCost)
    .slice(0, limit);
}
