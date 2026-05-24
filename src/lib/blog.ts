import React from "react";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  description: string;        // SEO meta description (150-160 chars)
  keywords: string;           // SEO keywords
  author: string;
  date: string;               // ISO date
  readTime: string;
  category: "Sleep" | "Stress" | "Energy" | "Recovery" | "Nutrition" | "Guides" | "Women's Health";
  coverBg: string;            // gradient / colour for cover
  coverGlyph: string;         // big symbol shown on cover
  coverInk: string;           // text colour on cover
  content: () => React.ReactElement;
}

const r = React.createElement;
const P = (...c: (string | React.ReactNode)[]) => r("p", null, ...c);
const H2 = (text: string) => r("h2", null, text);
const H3 = (text: string) => r("h3", null, text);
const UL = (...items: (string | React.ReactNode)[]) =>
  r("ul", null, ...items.map((item, i) => r("li", { key: i }, item)));
const Strong = (text: string) => r("strong", null, text);
const Em = (text: string) => r("em", null, text);
const A = (href: string, text: string) => r("a", { href }, text);
const BQ = (text: string) => r("blockquote", null, text);
const Table = (rows: string[][]) =>
  r("table", null,
    r("thead", null, r("tr", null, ...rows[0].map((h, i) => r("th", { key: i }, h)))),
    r("tbody", null, ...rows.slice(1).map((row, ri) =>
      r("tr", { key: ri }, ...row.map((cell, ci) => r("td", { key: ci }, cell)))
    ))
  );
const CTA = () =>
  r("p", { style: { background: "rgba(74,106,78,0.08)", border: "1px solid rgba(74,106,78,0.15)", padding: "20px 24px", borderRadius: 14, margin: "32px 0 0" } },
    r("strong", null, "Want a stack matched to you? "),
    r("a", { href: "/quiz", style: { color: "#7d2e3a" } }, "Take our 3-minute quiz →")
  );

// ─── 10 articles ──────────────────────────────────────────────────────────────
export const POSTS: BlogPost[] = [
  {
    slug: "magnesium-glycinate-vs-citrate",
    title: "Magnesium Glycinate vs. Citrate: Which Is Right For You?",
    excerpt: "Both are common forms of magnesium, but they work very differently. Here's how to pick the right one for sleep, stress, or digestion.",
    description: "Compare magnesium glycinate and citrate. Learn which form is best for sleep, stress, anxiety, or constipation — and how to choose the right dose.",
    keywords: "magnesium glycinate vs citrate, magnesium for sleep, magnesium types, best magnesium supplement",
    author: "suppdoc Editorial", date: "2026-04-22", readTime: "5 min", category: "Guides",
    coverBg: "linear-gradient(135deg, #7a6d92 0%, #5b5184 100%)", coverGlyph: "Mg", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Most people don't realise there are more than ten forms of magnesium on the market — and they're not interchangeable. The two you'll see most often, ", Strong("magnesium glycinate"), " and ", Strong("magnesium citrate"), ", target very different needs."),
        H2("What is magnesium glycinate?"),
        P("Magnesium glycinate is magnesium bound to glycine, a calming amino acid. The glycine itself promotes calm and sleep onset, which is why glycinate is the preferred form for:"),
        UL("Better sleep and faster sleep onset", "Stress relief and anxiety reduction", "Muscle relaxation and recovery", "Long-term magnesium repletion without GI side effects"),
        P("It's gentle on the stomach and ideal for evening use."),
        H2("What is magnesium citrate?"),
        P("Magnesium citrate is magnesium bound to citric acid. It's well-absorbed but has a mild laxative effect, which makes it the form preferred for:"),
        UL("Occasional constipation or slow digestion", "Quick magnesium top-ups", "Pre-workout use for muscle function"),
        H2("Side-by-side comparison"),
        Table([
          ["Feature", "Glycinate", "Citrate"],
          ["Absorption", "High", "High"],
          ["Laxative effect", "None", "Mild–moderate"],
          ["Best for", "Sleep, stress, anxiety", "Constipation, performance"],
          ["Time of day", "Evening", "Anytime"],
          ["Typical dose", "300–400 mg", "200–400 mg"],
        ]),
        H2("How to know if you need magnesium"),
        P("Common signs of low magnesium include:"),
        UL("Trouble falling asleep", "Muscle cramps or eye twitches", "Chronic stress or anxiety", "Constipation", "Persistent fatigue"),
        P(Strong("More than half of adults"), " don't meet the magnesium RDA from food alone, making this one of the most common nutrient gaps to fix."),
        H2("Bottom line"),
        P("For sleep, stress, or general use: ", Strong("glycinate"), ". For occasional digestive support or pre-workout: ", Strong("citrate"), ". Many people take both — glycinate at night and citrate in the morning."),
        CTA()
      ),
  },

  {
    slug: "best-supplements-for-sleep",
    title: "The 5 Best Supplements for Better Sleep (Backed by Science)",
    excerpt: "Forget melatonin. These five evidence-led supplements address the actual root causes of poor sleep — stress, low magnesium, and circadian disruption.",
    description: "Evidence-based guide to the best supplements for sleep: magnesium glycinate, ashwagandha, glycine, L-theanine, and more. Doses and timing included.",
    keywords: "best supplements for sleep, natural sleep aids, magnesium glycinate sleep, ashwagandha sleep",
    author: "suppdoc Editorial", date: "2026-04-18", readTime: "6 min", category: "Sleep",
    coverBg: "linear-gradient(135deg, #324d36 0%, #1c2e1f 100%)", coverGlyph: "☾", coverInk: "#cfdcc8",
    content: () =>
      r(React.Fragment, null,
        P("If you've been reaching for melatonin to sleep, you're probably using it wrong. Melatonin is a signal molecule — useful for jet lag, not chronic insomnia. The real lever for better sleep is supporting the systems your body uses to wind down: cortisol, GABA, body temperature, and magnesium balance."),
        P("Here are the five supplements with the strongest evidence for sleep quality."),
        H2("1. Magnesium glycinate"),
        P(Strong("Dose:"), " 300–400 mg elemental, 30–60 minutes before bed."),
        P("Magnesium activates GABA receptors and helps muscles relax. Glycinate is the gentlest, most calming form. Most studies show meaningful improvements in sleep latency and quality within 2–4 weeks."),
        H2("2. Ashwagandha (KSM-66)"),
        P(Strong("Dose:"), " 300–600 mg standardised extract, evening."),
        P("An adaptogen that lowers cortisol — the stress hormone that keeps you wired at night. Clinical trials show measurable improvements in sleep onset and quality, especially in people with anxiety or stress-driven insomnia."),
        H2("3. Glycine"),
        P(Strong("Dose:"), " 3 g, 30–60 minutes before bed."),
        P("Glycine lowers core body temperature, which is a key trigger for falling asleep. Studies in Japan show improved sleep depth and morning alertness with consistent use."),
        H2("4. L-theanine"),
        P(Strong("Dose:"), " 200 mg in the evening."),
        P("Promotes alpha brain waves — the same waves that dominate during meditation. It quiets racing thoughts without sedation, which makes it a great pair with magnesium."),
        H2("5. Low-dose melatonin"),
        P(Strong("Dose:"), " 0.3–1 mg, 90 minutes before target bedtime."),
        P("Most melatonin gummies contain 5–10 mg — far too much. Lower doses (0.3 mg) are actually more effective as a phase shifter, especially for shift workers and travel."),
        H2("Lifestyle wins more than pills"),
        P("Before stacking supplements, get the basics right:"),
        UL("Same bedtime ±30 minutes", "No bright light 60 minutes before bed", "Cool room (16–19°C)", "No caffeine after 2pm"),
        P("Supplements are a multiplier on good habits — not a replacement."),
        CTA()
      ),
  },

  {
    slug: "vitamin-d-deficiency-signs",
    title: "Vitamin D Deficiency: 7 Hidden Signs You Might Have It",
    excerpt: "Vitamin D deficiency affects an estimated 1 billion people worldwide. The symptoms are subtle — until they're not.",
    description: "7 signs of vitamin D deficiency: fatigue, low mood, frequent illness, bone pain, hair loss. Learn how to test and the right D3 dose.",
    keywords: "vitamin d deficiency signs, vitamin d3 dose, low vitamin d symptoms, vitamin d3 k2",
    author: "suppdoc Editorial", date: "2026-04-12", readTime: "5 min", category: "Energy",
    coverBg: "linear-gradient(135deg, #c4944a 0%, #8b6730 100%)", coverGlyph: "☀", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Vitamin D isn't really a vitamin — it's a hormone your skin synthesises from sunlight. And in the modern world, where most of us spend the day indoors, deficiency is the rule rather than the exception. An estimated ", Strong("one billion people worldwide"), " have insufficient vitamin D levels."),
        H2("Why vitamin D matters"),
        P("It's involved in:"),
        UL("Calcium absorption and bone density", "Immune cell function", "Mood regulation (low levels are linked to depression)", "Insulin sensitivity", "Testosterone synthesis"),
        H2("7 signs you might be deficient"),
        H3("1. Persistent fatigue"),
        P("Even with enough sleep, you feel drained. Vitamin D plays a role in mitochondrial function — your cells' energy production."),
        H3("2. Low mood or seasonal blues"),
        P("Vitamin D regulates serotonin synthesis. Several meta-analyses link deficiency to depression risk."),
        H3("3. Getting sick frequently"),
        P("D regulates immune cell activity. Low levels are associated with more frequent respiratory infections."),
        H3("4. Bone or back pain"),
        P("Without enough D, your body can't absorb calcium properly. Chronic dull bone or low-back pain can be a sign."),
        H3("5. Hair thinning"),
        P("Vitamin D receptors are on hair follicles. Low D is linked to alopecia areata and general hair shedding."),
        H3("6. Slow wound healing"),
        P("Cuts taking weeks to heal? D plays a role in skin and tissue repair."),
        H3("7. Muscle weakness"),
        P("Especially in proximal muscles (thighs, shoulders). Low D affects muscle fibre function."),
        H2("How to test and supplement"),
        P("Get a 25-hydroxyvitamin D blood test. Optimal range is generally ", Strong("40–60 ng/mL"), " (100–150 nmol/L)."),
        P("If you're below 30 ng/mL, most clinicians recommend:"),
        UL("2,000–5,000 IU of D3 per day", "Take with a fatty meal (it's fat-soluble)", "Pair with K2 (MK-7) to direct calcium to bones, not arteries", "Recheck blood levels in 8–12 weeks"),
        BQ("Always test before mega-dosing. Vitamin D toxicity is rare but real — and individual response varies widely."),
        CTA()
      ),
  },

  {
    slug: "omega-3-fish-vs-algae",
    title: "Omega-3 Fish Oil vs. Algae: A Complete Comparison",
    excerpt: "Algae omega-3 isn't just for vegans anymore. Here's how plant-based omega-3 compares to fish oil on absorption, sustainability, and cost.",
    description: "Compare fish oil and algae omega-3. EPA/DHA content, absorption, environmental impact, and which is right for your needs.",
    keywords: "fish oil vs algae omega 3, vegan omega 3, best omega 3 supplement, algae oil DHA EPA",
    author: "suppdoc Editorial", date: "2026-04-05", readTime: "5 min", category: "Nutrition",
    coverBg: "linear-gradient(135deg, #688a6b 0%, #4a6a4e 100%)", coverGlyph: "ω", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Here's a fun fact: fish don't make omega-3. They get it from eating algae. Which means algae-based omega-3 is just skipping a step in the food chain. So is it as good as fish oil?"),
        P("The short answer: yes — and in some cases, better. Here's the full breakdown."),
        H2("What omega-3 actually does"),
        P("EPA and DHA — the two omega-3s that matter — support:"),
        UL("Cardiovascular health (triglyceride reduction)", "Brain function and mood", "Joint and skin inflammation balance", "Eye health and retinal function"),
        H2("Fish oil vs. algae: side-by-side"),
        Table([
          ["Factor", "Fish Oil", "Algae Oil"],
          ["EPA + DHA per softgel", "300–1000 mg", "200–500 mg"],
          ["Absorption", "Excellent (triglyceride form)", "Excellent (TG or phospholipid)"],
          ["Vegan / vegetarian", "No", "Yes"],
          ["Sustainability", "Variable", "Excellent"],
          ["Fishy aftertaste", "Sometimes", "Never"],
          ["Heavy metal risk", "Low (when tested)", "None"],
          ["Cost per gram EPA+DHA", "$0.15–0.30", "$0.50–1.00"],
        ]),
        H2("When to pick fish oil"),
        UL("You need high doses (2g+ EPA+DHA daily)", "Cost matters", "You're already eating fish and want a complementary source", "You want the highest dose per softgel"),
        H2("When to pick algae oil"),
        UL("Plant-based diet", "Fish allergy or strong fish-oil burps", "Sustainability is a priority", "Pregnancy (no heavy metal concern)", "You take a lower dose anyway (500mg)"),
        H2("How to evaluate any omega-3"),
        UL(
          r(React.Fragment, null, Strong("EPA + DHA content"), " — look at the back label, not just total fish oil."),
          r(React.Fragment, null, Strong("Triglyceride form (TG)"), " — better absorbed than ethyl ester (EE)."),
          r(React.Fragment, null, Strong("Third-party tested"), " — IFOS or USP certifications are gold standards."),
          r(React.Fragment, null, Strong("Freshness"), " — peroxide value matters. Cheap fish oil can be rancid."),
        ),
        P("Most adults benefit from ", Strong("500–1000 mg combined EPA+DHA daily"), ". More than that is a discussion with a clinician."),
        CTA()
      ),
  },

  {
    slug: "ashwagandha-cortisol-stress",
    title: "Ashwagandha: How This Adaptogen Lowers Cortisol",
    excerpt: "Ashwagandha is one of the most-studied herbal supplements on earth. Here's the science of how it calms cortisol — and when not to take it.",
    description: "How ashwagandha (KSM-66) lowers cortisol and reduces stress. Dose, timing, evidence, and who should avoid it.",
    keywords: "ashwagandha cortisol, ashwagandha for stress, KSM-66 dose, ashwagandha benefits",
    author: "suppdoc Editorial", date: "2026-03-28", readTime: "6 min", category: "Stress",
    coverBg: "linear-gradient(135deg, #a3604a 0%, #6e3d2c 100%)", coverGlyph: "♡", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Ashwagandha (Withania somnifera) is a root that's been used in Ayurvedic medicine for over 3,000 years. Modern research has caught up: it's now one of the most-studied adaptogens, with strong evidence for reducing stress, anxiety, and cortisol levels."),
        H2("What's an adaptogen?"),
        P("Adaptogens are plants that help your body resist physical, chemical, and biological stress. They don't sedate you — they help your nervous system adapt. Ashwagandha is one of the few adaptogens with rigorous clinical evidence behind it."),
        H2("How ashwagandha works"),
        P("It modulates the hypothalamic-pituitary-adrenal (HPA) axis — the system that controls your stress response. Specifically:"),
        UL("Lowers chronically elevated cortisol", "Reduces inflammatory markers", "Supports GABA receptor function (calming)", "Modulates serotonin signalling"),
        H2("The evidence"),
        P("Multiple double-blind RCTs show:"),
        UL("28% reduction in cortisol with 600 mg KSM-66 daily for 60 days", "Significant reductions in stress and anxiety scores (PSS, HAM-A)", "Improved sleep onset and quality", "Better DHEA-S levels (a youth hormone) in stressed adults"),
        H2("Dose and form"),
        P("Look for ", Strong("KSM-66"), " or ", Strong("Sensoril"), " — standardised root extracts with documented active compound levels (withanolides). Avoid generic 'ashwagandha root powder' which is much weaker."),
        P(Strong("Dose:"), " 300–600 mg KSM-66 once daily, ideally in the evening. Effects build over 4–8 weeks."),
        H2("Who should NOT take ashwagandha"),
        UL(
          r(React.Fragment, null, Strong("Pregnancy or nursing"), " — not enough safety data"),
          r(React.Fragment, null, Strong("Hyperthyroid"), " — may further elevate thyroid hormones"),
          r(React.Fragment, null, Strong("Autoimmune conditions"), " — can stimulate immune activity"),
          r(React.Fragment, null, Strong("On sedatives or thyroid meds"), " — talk to your prescriber first"),
        ),
        BQ("Adaptogens are powerful. Their gentleness is in how they work, not how strong they are."),
        CTA()
      ),
  },

  {
    slug: "creatine-for-women",
    title: "Creatine for Women: Why It's the Most Underrated Supplement",
    excerpt: "Creatine isn't just for bodybuilders. For women, it supports strength, cognition, recovery, and even bone density — at less than $0.50 per day.",
    description: "Creatine benefits for women: strength, cognition, mood, bone density. Dose, timing, and common myths debunked.",
    keywords: "creatine for women, creatine benefits, creatine monohydrate dose, creatine and cognition",
    author: "suppdoc Editorial", date: "2026-03-20", readTime: "5 min", category: "Recovery",
    coverBg: "linear-gradient(135deg, #4a6a4e 0%, #324d36 100%)", coverGlyph: "↺", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Creatine has the most evidence of any supplement on earth — over 1,000 published studies. Yet most women avoid it, thinking it's only for bodybuilders or that it'll cause bloating. Both are myths."),
        H2("What creatine actually does"),
        P("Your muscles and brain store small amounts of creatine, used as rapid energy for short, intense efforts. Supplementing increases those stores, which translates to:"),
        UL("More strength and power output (~5–15% improvement)", "Better recovery between sets and workouts", "Improved short-term memory and mental performance", "Increased lean tissue (without 'bulk')", "Better bone density over time", "Improved mood, especially under sleep deprivation"),
        H2("Why women in particular benefit"),
        P("Women typically have lower baseline creatine stores than men — about 70–80% of what men have. That means supplementation can provide a relatively larger benefit."),
        P("Additionally, creatine appears to:"),
        UL("Help maintain bone density during menopause", "Reduce mental fatigue during the menstrual cycle's luteal phase", "Support strength gains for resistance training"),
        H2("The bloat myth"),
        P("Some people experience mild intracellular water retention — water inside the muscle, which makes it look fuller. This is not bloating in the GI sense, and it's mostly only noticeable in the first 1–2 weeks."),
        P("To minimise it: take 3–5 g daily without a loading phase."),
        H2("Dose and form"),
        P(Strong("Form:"), " Plain creatine monohydrate. Don't pay extra for 'HCL' or 'micronised' variants — they're not better."),
        P(Strong("Dose:"), " 5 g per day. Time of day doesn't matter. Skip the loading phase."),
        P(Strong("Consistency:"), " Daily, including rest days. The benefit compounds over weeks."),
        H2("Common questions"),
        H3("Will it make me gain weight?"),
        P("You may gain 0.5–1 kg of intramuscular water in the first week. Long-term changes depend on your training and nutrition."),
        H3("Is it safe?"),
        P("Yes. Creatine is one of the most-studied supplements ever. No evidence of kidney or liver concerns in healthy adults at standard doses."),
        H3("Will it affect my hormones?"),
        P("No. Creatine doesn't act on hormones."),
        CTA()
      ),
  },

  {
    slug: "adaptogens-explained",
    title: "Adaptogens: What They Are, How They Work, Which to Pick",
    excerpt: "Ashwagandha, rhodiola, reishi, eleuthero — the adaptogen category is exploding. Here's how to make sense of it and pick what actually works for you.",
    description: "Complete guide to adaptogens: ashwagandha, rhodiola, reishi, eleuthero. How they work, evidence levels, and which to pick.",
    keywords: "adaptogens, rhodiola vs ashwagandha, what are adaptogens, best adaptogens for stress",
    author: "suppdoc Editorial", date: "2026-03-14", readTime: "7 min", category: "Stress",
    coverBg: "linear-gradient(135deg, #5b5184 0%, #3d3460 100%)", coverGlyph: "✿", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("The word 'adaptogen' gets thrown around a lot. Strictly speaking, it has a definition: a plant compound that helps the body resist physical, chemical, or biological stressors. Practically, it's become a category for any herb claiming to balance you."),
        P("Here are the four with the strongest evidence — and what they're actually best for."),
        H2("1. Ashwagandha (Withania somnifera)"),
        P(Strong("Best for:"), " chronic stress, sleep onset, anxiety, cortisol balance."),
        P(Strong("Evidence:"), " Strong. Multiple RCTs show measurable cortisol reduction and anxiety improvement."),
        P(Strong("Dose:"), " 300–600 mg standardised root extract (KSM-66 or Sensoril) in the evening."),
        H2("2. Rhodiola rosea"),
        P(Strong("Best for:"), " mental fatigue, low motivation, low energy under stress."),
        P(Strong("Evidence:"), " Moderate. Studies show improvements in mental performance under fatigue — especially in stressed students and shift workers."),
        P(Strong("Dose:"), " 300–500 mg standardised extract (3% rosavins) in the morning."),
        H2("3. Reishi mushroom (Ganoderma lucidum)"),
        P(Strong("Best for:"), " calm focus, immune modulation, sleep support."),
        P(Strong("Evidence:"), " Moderate. Long history of use; modern data is more limited."),
        P(Strong("Dose:"), " 1,000–2,000 mg extract daily."),
        H2("4. Eleuthero (Siberian ginseng)"),
        P(Strong("Best for:"), " endurance, recovery from physical stress."),
        P(Strong("Evidence:"), " Moderate. Some sports performance studies show improvement."),
        P(Strong("Dose:"), " 300–1,200 mg standardised extract daily."),
        H2("How to actually use them"),
        P("Three rules:"),
        UL(
          r(React.Fragment, null, Strong("Pick one or two — not all."), " Stacking 5 adaptogens dilutes the effect of each."),
          r(React.Fragment, null, Strong("Standardised extracts only."), " Generic powders vary wildly in active compound content."),
          r(React.Fragment, null, Strong("Give it 4–8 weeks."), " Adaptogens work slowly. Don't expect day-one results."),
        ),
        H2("Match an adaptogen to your symptom"),
        Table([
          ["Symptom", "Pick"],
          ["Wired but tired at night", "Ashwagandha"],
          ["Mental fog under deadline pressure", "Rhodiola"],
          ["Anxious during the day", "Ashwagandha + L-theanine"],
          ["Getting sick after stressful periods", "Reishi"],
          ["Slow recovery from training", "Eleuthero or Rhodiola"],
        ]),
        BQ("Adaptogens aren't sedatives. They help your nervous system adapt — they don't override it."),
        CTA()
      ),
  },

  {
    slug: "vegan-supplements-guide",
    title: "The Complete Guide to Vegan Supplementation",
    excerpt: "A plant-based diet is one of the healthiest ways to eat — but it leaves a few specific nutrient gaps. Here's exactly what to supplement.",
    description: "Essential supplements for vegans: B12, vitamin D3 (vegan), algae omega-3, iron, zinc, creatine. Doses and brands.",
    keywords: "vegan supplements, b12 for vegans, vegan omega 3, plant based supplements, vegan vitamin d3",
    author: "suppdoc Editorial", date: "2026-03-08", readTime: "7 min", category: "Nutrition",
    coverBg: "linear-gradient(135deg, #688a6b 0%, #4a6a4e 100%)", coverGlyph: "✦", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Plant-based diets are well-evidenced for cardiovascular and longevity outcomes. But certain nutrients are either absent or poorly absorbed from plant sources. If you're vegan or eating mostly plants, these are the gaps to fill."),
        H2("Non-negotiable: Vitamin B12"),
        P("B12 only occurs in animal products. Long-term deficiency causes irreversible nerve damage — this isn't optional."),
        P(Strong("Form:"), " Methylcobalamin or cyanocobalamin. Both work."),
        P(Strong("Dose:"), " 1,000 mcg daily, or 5,000 mcg weekly."),
        P(Strong("Check:"), " Get a B12 and methylmalonic acid (MMA) test every 1–2 years."),
        H2("Algae omega-3 (EPA/DHA)"),
        P("Plants contain ALA (a precursor to EPA/DHA), but conversion is poor — maybe 5–10%. Algae oil delivers EPA and DHA directly."),
        P(Strong("Dose:"), " 500–1,000 mg combined EPA+DHA daily."),
        P(Strong("Brand picks:"), " Ovega-3, Nordic Naturals Algae Omega, Sports Research Vegan Omega-3."),
        H2("Vegan vitamin D3"),
        P("Most D3 is from lanolin (sheep wool). Vegan D3 comes from lichen — same molecule, plant source."),
        P(Strong("Dose:"), " 2,000–5,000 IU daily. Pair with K2 (MK-7)."),
        H2("Iron — especially for women"),
        P("Plant iron (non-heme) is absorbed at about 1/3 the rate of heme iron from meat. Vegan women in particular need to monitor."),
        P(Strong("Tips:"), " Pair iron-rich plants (lentils, spinach, tofu) with vitamin C. Avoid coffee or tea within 1 hour of iron-rich meals."),
        P(Strong("Supplement:"), " If ferritin is low, 18–25 mg of iron bisglycinate (gentler than ferrous sulfate)."),
        H2("Zinc"),
        P("Phytates in grains and legumes reduce zinc absorption by 30–50%."),
        P(Strong("Dose:"), " 15 mg zinc picolinate or zinc citrate daily."),
        H2("Creatine"),
        P("Vegetarians have 20–30% lower muscle creatine stores than omnivores. Supplementing closes the gap — and the cognitive benefits are well-documented."),
        P(Strong("Dose:"), " 3–5 g creatine monohydrate daily (it's vegan)."),
        H2("Sometimes-needed: iodine, choline"),
        P(Strong("Iodine:"), " If you don't use iodised salt or eat seaweed regularly, consider 150 mcg/day."),
        P(Strong("Choline:"), " Mainly in eggs. If you don't supplement, eat tofu, broccoli, and soy. Or take 250–500 mg of CDP-choline or Alpha-GPC."),
        BQ("A well-planned plant-based diet supplemented with these is one of the healthiest ways to eat. An unplanned one isn't."),
        CTA()
      ),
  },

  {
    slug: "probiotics-101",
    title: "Probiotics 101: How to Pick One That Actually Works",
    excerpt: "The probiotic aisle is chaos. Strain numbers, CFU counts, prebiotics, postbiotics… here's a no-nonsense guide to picking the right one.",
    description: "How to choose a probiotic: CFU, strains, refrigeration, what to avoid. Best probiotics for gut, mood, immunity, and bloating.",
    keywords: "best probiotic, how to choose probiotic, probiotic for bloating, gut health supplements, probiotic strains",
    author: "suppdoc Editorial", date: "2026-02-28", readTime: "6 min", category: "Nutrition",
    coverBg: "linear-gradient(135deg, #688a6b 0%, #4a6a4e 100%)", coverGlyph: "◎", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Walk down the probiotic aisle and you'll see 50 billion CFU, 20 strains, refrigerated, shelf-stable, with prebiotics, with postbiotics. Most of it is noise. Here's what actually matters."),
        H2("What probiotics do (and don't do)"),
        P("Probiotics are live bacteria that, in adequate amounts, may confer a health benefit. Strong evidence supports their use for:"),
        UL("Antibiotic-associated diarrhea prevention", "IBS-D and IBS-C symptom management", "Some forms of eczema", "Possibly mood (via the gut-brain axis)", "Mild reductions in bloating"),
        P("Weaker evidence: weight loss, mood, allergies, general 'wellness'."),
        H2("CFU counts: more isn't always better"),
        P("CFU = colony-forming units. Most useful products contain 10–50 billion CFU per dose. Beyond that, more doesn't mean better — it can even cause side effects (gas, bloating) initially."),
        H2("The strains matter more than the count"),
        P("Specific strains have specific evidence. Look for:"),
        UL(
          r(React.Fragment, null, Strong("L. rhamnosus GG"), " — antibiotic-associated diarrhea"),
          r(React.Fragment, null, Strong("S. boulardii"), " — traveller's diarrhea, C. diff prevention"),
          r(React.Fragment, null, Strong("L. plantarum 299v"), " — IBS bloating"),
          r(React.Fragment, null, Strong("L. helveticus R0052 + B. longum R0175"), " — mood and stress"),
          r(React.Fragment, null, Strong("B. infantis 35624"), " — IBS"),
        ),
        H2("What to look for on the label"),
        UL(
          r(React.Fragment, null, Strong("Specific strain numbers"), " (e.g. L. rhamnosus GG, not just 'L. rhamnosus')"),
          r(React.Fragment, null, Strong("Guaranteed CFU at expiration"), ", not at manufacture"),
          r(React.Fragment, null, Strong("Refrigeration or shelf-stable testing"), " — both can work"),
          r(React.Fragment, null, Strong("Enteric coating or delayed release"), " (helps survive stomach acid)"),
        ),
        H2("When to take them"),
        P("Most are best taken with food, especially a meal with some fat. Once daily is enough for most people."),
        H2("Don't forget prebiotics"),
        P("Prebiotics are the fibre that feeds your existing gut bacteria. Often more impactful than probiotics alone. Sources:"),
        UL("Garlic, onions, leeks", "Asparagus", "Oats and bananas (slightly green)", "Legumes", "Inulin or PHGG supplements"),
        H2("Bottom line"),
        P("Pick a multi-strain product (10–50 billion CFU) with documented strain numbers, take it consistently for 4–8 weeks, and pay attention to how your body responds. If nothing changes, switch strains or try a prebiotic."),
        CTA()
      ),
  },

  {
    slug: "iron-for-women",
    title: "Iron for Women: When You Need It (And When You Don't)",
    excerpt: "Roughly 1 in 5 women of menstruating age has low iron — yet most don't know. Here's how to know, how to test, and how to fix it safely.",
    description: "Iron deficiency in women: signs, causes, blood tests. Best iron supplements for women (gentle forms, dose, timing).",
    keywords: "iron for women, iron deficiency anemia, gentle iron supplement, ferritin test, iron bisglycinate",
    author: "suppdoc Editorial", date: "2026-02-20", readTime: "5 min", category: "Women's Health",
    coverBg: "linear-gradient(135deg, #7d2e3a 0%, #5a1f2a 100%)", coverGlyph: "Fe", coverInk: "#fbf6ec",
    content: () =>
      r(React.Fragment, null,
        P("Iron is the most common nutrient deficiency in the world — and it disproportionately affects menstruating women, vegetarians, vegans, and endurance athletes."),
        P("If you're tired, pale, breathless on stairs, or have brittle nails, iron should be on your radar."),
        H2("The numbers"),
        UL(
          r(React.Fragment, null, "About ", Strong("20%"), " of women of reproductive age are iron-deficient"),
          r(React.Fragment, null, Strong("50%"), " of pregnant women globally are iron-deficient"),
          "Plant-based eaters absorb iron at about 1/3 the rate of meat eaters",
        ),
        H2("Signs of low iron"),
        UL("Persistent fatigue (not improved with sleep)", "Pale skin, especially inside lower eyelids", "Cold hands and feet", "Brittle, ridged, or spoon-shaped nails", "Hair shedding", "Restless legs at night", "Breathlessness or fast heartbeat on minor exertion", "Strange cravings (ice, dirt, paper) — pica"),
        H2("Test before you supplement"),
        P("Iron supplements taken unnecessarily can cause oxidative stress and digestive distress. Get a blood panel that includes:"),
        UL(
          r(React.Fragment, null, Strong("Ferritin"), " — stored iron (most useful single marker; aim for >50 ng/mL)"),
          r(React.Fragment, null, Strong("Hemoglobin / hematocrit"), " — current red blood cell capacity"),
          r(React.Fragment, null, Strong("Transferrin saturation"), " — how well iron is being shuttled"),
        ),
        H2("If you're low — how to supplement"),
        P("Standard iron supplements (ferrous sulfate) work but commonly cause nausea, constipation, and stomach upset. Better-tolerated forms:"),
        UL(
          r(React.Fragment, null, Strong("Iron bisglycinate"), " (gentle iron) — 25 mg daily"),
          r(React.Fragment, null, Strong("Heme iron polypeptide"), " — well-absorbed, animal-derived"),
          r(React.Fragment, null, Strong("Liquid iron from whole-food sources"), " — e.g. Floradix"),
        ),
        P(Strong("How to take it:")),
        UL(
          "On an empty stomach if tolerated (better absorbed)",
          "With 500 mg of vitamin C (boosts absorption ~3x)",
          "Avoid coffee, tea, calcium, and dairy within 1 hour",
          "Alternate days may be MORE effective than daily (recent research)",
        ),
        H2("Foods rich in iron"),
        UL("Red meat (especially organ meats)", "Shellfish", "Lentils, beans, tofu", "Dark leafy greens", "Pumpkin seeds", "Dark chocolate"),
        BQ("Don't supplement iron 'just in case' — too much is toxic. Test first."),
        CTA()
      ),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

export function getPostsByCategory(cat: string): BlogPost[] {
  return POSTS.filter(p => p.category === cat);
}
