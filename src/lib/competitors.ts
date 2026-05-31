/**
 * Competitor comparison data for /compare/[slug] SEO pages.
 *
 * Honest comparisons, we credit competitors where they're stronger and own
 * the areas where we differ. The point is to be the most truthful comparison
 * available, not to win on every row.
 */

export type ComparisonRow = {
  label: string;
  suppdoc: string;
  competitor: string;
  winner: "suppdoc" | "competitor" | "tie";
};

export interface Competitor {
  slug: string;                  // /compare/[slug]
  name: string;                  // "Persona Nutrition"
  tagline: string;               // one-line positioning
  url?: string;                  // for external link
  oneLineVerdict: string;
  bottomLine: string;            // 2-3 sentences, the honest summary
  rows: ComparisonRow[];
  pros: string[];                // their strengths
  cons: string[];                // their weaknesses
  bestFor: string;               // who they're really for
  switchToUs: string;            // when suppdoc is the better choice
  metaDescription: string;
  keywords: string;
}

export const COMPETITORS: Competitor[] = [
  {
    slug: "suppdoc-vs-my-stack-ai",
    name: "my-stack.ai",
    tagline: "AI-powered supplement matching",
    url: "https://my-stack.ai",
    oneLineVerdict: "Closest direct competitor, similar AI-quiz approach, suppdoc adds an audit tool and broader ingredient library.",
    bottomLine: "my-stack.ai pioneered the AI supplement quiz format and has a polished chat experience. suppdoc.io has a deeper ingredient library (151 vs ~100), adds the unique 'Audit My Stack' tool for people who already take supplements, and has more honest positioning, no fabricated stats, no fake testimonials, no claim that supplements replace lifestyle changes.",
    rows: [
      { label: "Personalised AI quiz", suppdoc: "Yes (Express + Complete)", competitor: "Yes", winner: "tie" },
      { label: "Audit existing stack", suppdoc: "Yes (free)", competitor: "Limited", winner: "suppdoc" },
      { label: "Ingredient library", suppdoc: "151 ingredients", competitor: "~100", winner: "suppdoc" },
      { label: "Pre-made stacks", suppdoc: "15", competitor: "10+", winner: "suppdoc" },
      { label: "AI chat assistant", suppdoc: "Coming soon", competitor: "Yes", winner: "competitor" },
      { label: "Plain-English stack builder", suppdoc: "Yes", competitor: "Yes", winner: "tie" },
      { label: "Sells own private label", suppdoc: "No (affiliate model)", competitor: "No", winner: "tie" },
      { label: "Pricing model", suppdoc: "Free", competitor: "Free", winner: "tie" },
      { label: "Bloodwork analysis", suppdoc: "Roadmap", competitor: "No", winner: "tie" },
      { label: "Mobile experience", suppdoc: "Responsive web", competitor: "Responsive web", winner: "tie" },
    ],
    pros: [
      "Polished AI chat interface",
      "Solid 100-ingredient curation",
      "Clean UX in the quiz flow",
    ],
    cons: [
      "Smaller ingredient library",
      "No dedicated audit-existing-stack tool",
      "Some marketing claims (study counts) lack public methodology",
    ],
    bestFor: "Users who want a conversational chat-style supplement discovery experience.",
    switchToUs: "If you already take supplements and want a free interaction/redundancy/gap audit, that's suppdoc's flagship differentiator. Also if you want a much larger ingredient library to build from.",
    metaDescription: "suppdoc.io vs my-stack.ai: honest comparison of the two leading AI supplement platforms. Ingredient library, features, pricing, and what each does best.",
    keywords: "suppdoc vs my-stack.ai, my-stack.ai alternative, AI supplement quiz comparison, my stack ai review",
  },

  {
    slug: "suppdoc-vs-persona",
    name: "Persona Nutrition",
    tagline: "Personalised vitamin packs delivered monthly",
    url: "https://personanutrition.com",
    oneLineVerdict: "Persona delivers convenient pre-packaged vitamins; suppdoc is free, broader, and lets you keep your retailer choice.",
    bottomLine: "Persona is a DTC subscription that ships personalised vitamin packs to your door, convenient but expensive ($1.50-$3/day, $45-$90/month). suppdoc is free, recommends specific brands you buy directly from iHerb or Amazon, and gives you the flexibility to swap and re-evaluate as your needs change. Persona is owned by Nestlé.",
    rows: [
      { label: "Cost", suppdoc: "Free", competitor: "$45-$90/month subscription", winner: "suppdoc" },
      { label: "Personalised plan", suppdoc: "Yes (free quiz)", competitor: "Yes (subscription locks)", winner: "suppdoc" },
      { label: "Choose your brands", suppdoc: "Yes, buy from iHerb/Amazon", competitor: "No, proprietary blends", winner: "suppdoc" },
      { label: "Convenience packaging", suppdoc: "No (you buy bottles)", competitor: "Yes (daily packs)", winner: "competitor" },
      { label: "Third-party tested", suppdoc: "We recommend tested brands", competitor: "Internal QC", winner: "tie" },
      { label: "Cancel anytime", suppdoc: "N/A (free)", competitor: "Subscription required", winner: "suppdoc" },
      { label: "Ingredient transparency", suppdoc: "Per-ingredient research links", competitor: "Per-pack list", winner: "suppdoc" },
      { label: "Lock-in", suppdoc: "None", competitor: "Subscription billing", winner: "suppdoc" },
    ],
    pros: [
      "Daily vitamin packs are highly convenient",
      "Nestlé-backed quality control",
      "Refills handled automatically",
    ],
    cons: [
      "Subscription cost adds up ($540-$1,080/year)",
      "Locked into proprietary product blends",
      "Hard to compare or swap individual ingredients",
      "No way to use it as an analyzer for what you already take",
    ],
    bestFor: "Adults who value daily convenience packs and don't mind subscription pricing.",
    switchToUs: "If you want to keep your retailer flexibility, save 60-80% on monthly cost, see the research behind each pick, or audit a stack you already take.",
    metaDescription: "suppdoc.io vs Persona Nutrition: free AI quiz vs $45/mo subscription. Compare costs, flexibility, ingredient transparency, and brand choice.",
    keywords: "Persona Nutrition alternative, Persona vs suppdoc, Persona Nutrition review, cheaper than Persona, free Persona alternative",
  },

  {
    slug: "suppdoc-vs-ritual",
    name: "Ritual",
    tagline: "Transparent multivitamins for adults",
    url: "https://ritual.com",
    oneLineVerdict: "Ritual sells beautifully-marketed multivitamins; suppdoc helps you decide whether you even need a multi and what else might matter.",
    bottomLine: "Ritual makes well-designed, transparent multivitamins for various life stages ($30-$40/month each). suppdoc.io is upstream, we help you figure out which supplements actually match your goals (which may or may not include a multi), then point you to options across brands and retailers. The two are complementary, not directly competitive.",
    rows: [
      { label: "Product type", suppdoc: "Recommendation engine", competitor: "Multivitamin brand", winner: "tie" },
      { label: "Cost", suppdoc: "Free", competitor: "$30-$40/month", winner: "suppdoc" },
      { label: "Personalisation", suppdoc: "Full quiz/audit", competitor: "Life stage (women's, men's, prenatal)", winner: "suppdoc" },
      { label: "Brand choice", suppdoc: "151 ingredients, multiple brands", competitor: "Ritual only", winner: "suppdoc" },
      { label: "Single multivitamin focus", suppdoc: "No, multi-product stacks", competitor: "Yes (one product)", winner: "competitor" },
      { label: "Direct delivery", suppdoc: "Via iHerb/Amazon", competitor: "Subscription DTC", winner: "tie" },
      { label: "Audit current stack", suppdoc: "Yes", competitor: "No", winner: "suppdoc" },
      { label: "Cost transparency", suppdoc: "Per-supplement", competitor: "Per-product", winner: "tie" },
    ],
    pros: [
      "Excellent ingredient quality and forms",
      "Transparent sourcing and testing",
      "Single-product convenience",
      "Strong branding and unboxing experience",
    ],
    cons: [
      "Limited to multivitamin SKUs, doesn't address sleep, recovery, focus etc.",
      "Subscription model with brand lock-in",
      "Can't tell you whether you need a multi in the first place",
    ],
    bestFor: "Adults who've already decided they want a high-quality multivitamin and value brand experience over flexibility.",
    switchToUs: "If you want a personalised stack of 4-7 supplements (sleep, energy, focus, etc.), not just a multi, or if you want to evaluate whether you need a multivitamin at all.",
    metaDescription: "suppdoc.io vs Ritual: free personalised quiz vs $30/mo multivitamin. When each makes sense and how they complement each other.",
    keywords: "Ritual vitamins alternative, Ritual vs suppdoc, Ritual multivitamin review, supplements beyond Ritual",
  },

  {
    slug: "suppdoc-vs-hum",
    name: "HUM Nutrition",
    tagline: "Symptom-quiz supplements for women",
    url: "https://humnutrition.com",
    oneLineVerdict: "HUM uses a symptom quiz to sell its own SKUs; suppdoc uses a deeper quiz to recommend the right brand for each supplement.",
    bottomLine: "HUM Nutrition built one of the first symptom-based supplement quizzes, it asks about your skin, mood, sleep, etc., then recommends HUM products. Conversion-optimised but limited to their own catalog. suppdoc.io expands on the same idea, broader quiz, broader catalog (151 ingredients), and we don't sell our own pills so the recommendation has no built-in bias.",
    rows: [
      { label: "Personalised quiz", suppdoc: "Yes (2 versions)", competitor: "Yes", winner: "tie" },
      { label: "Catalog scope", suppdoc: "151 ingredients, multiple brands", competitor: "HUM SKUs only", winner: "suppdoc" },
      { label: "Conflict of interest", suppdoc: "None, affiliate model", competitor: "Recommendations = HUM's own SKUs", winner: "suppdoc" },
      { label: "Cost", suppdoc: "Free", competitor: "$15-$25 per product/month", winner: "suppdoc" },
      { label: "Beauty focus", suppdoc: "1 of many goals", competitor: "Strong focus", winner: "competitor" },
      { label: "Audit existing stack", suppdoc: "Yes", competitor: "No", winner: "suppdoc" },
      { label: "Pre-made stacks", suppdoc: "15", competitor: "Limited bundles", winner: "suppdoc" },
    ],
    pros: [
      "Strong skin and beauty supplement lineup",
      "Reliable quality control",
      "Approachable for first-time supplement buyers",
      "Solid registered-dietitian content",
    ],
    cons: [
      "Quiz recommendations are inherently limited to HUM products",
      "No way to evaluate other brands or audit an existing stack",
      "Most stacks lock you into 3+ subscriptions",
    ],
    bestFor: "Beauty-focused first-time supplement users who want curated DTC convenience.",
    switchToUs: "If you want an unbiased recommendation (we recommend brands like Thorne, Sports Research, NOW Foods, not our own), or want to add supplements beyond HUM's beauty-heavy catalog.",
    metaDescription: "suppdoc.io vs HUM Nutrition: free unbiased quiz vs HUM's own SKU recommendations. Compare scope, conflict of interest, and cost.",
    keywords: "HUM Nutrition alternative, HUM vs suppdoc, HUM Nutrition review, unbiased supplement quiz",
  },

  {
    slug: "suppdoc-vs-thorne",
    name: "Thorne",
    tagline: "Practitioner-grade supplements",
    url: "https://thorne.com",
    oneLineVerdict: "Thorne is the gold-standard supplement brand we recommend often; suppdoc tells you which Thorne products (and other brands) you actually need.",
    bottomLine: "Thorne makes some of the highest-quality supplements in the world, we actively recommend their B-complex, magnesium glycinate, methylfolate, and many others throughout suppdoc.io. Thorne is a brand; suppdoc.io is a recommendation engine. The two work together, not in competition. (Bonus: Thorne has its own quiz, but it's heavily oriented toward their own catalog.)",
    rows: [
      { label: "Product type", suppdoc: "Engine + recommendations", competitor: "Manufacturer", winner: "tie" },
      { label: "Cost", suppdoc: "Free", competitor: "Per product", winner: "tie" },
      { label: "Quality of products", suppdoc: "We recommend Thorne often", competitor: "Industry-leading", winner: "competitor" },
      { label: "Catalog scope", suppdoc: "151 ingredients across brands", competitor: "Thorne SKUs only", winner: "suppdoc" },
      { label: "Quiz personalisation", suppdoc: "Deep (Express + Complete)", competitor: "Basic", winner: "suppdoc" },
      { label: "Practitioner-grade", suppdoc: "We rec these brands", competitor: "Yes (NSF, USP)", winner: "competitor" },
      { label: "Audit current stack", suppdoc: "Yes", competitor: "No", winner: "suppdoc" },
      { label: "Subscriptions", suppdoc: "N/A", competitor: "Optional", winner: "tie" },
    ],
    pros: [
      "Industry-leading quality and third-party testing (NSF, USP, Informed Sport)",
      "Practitioner-grade dosing and forms (e.g., methylated B-vitamins)",
      "Trusted by clinicians and athletes",
      "Comprehensive own-catalog including specialty items",
    ],
    cons: [
      "Premium pricing vs mass-market brands",
      "Their own quiz recommends only Thorne products",
      "Choosing from 100+ SKUs without guidance is overwhelming",
    ],
    bestFor: "Anyone willing to pay premium for the highest-quality forms and third-party testing.",
    switchToUs: "If you want help figuring out which Thorne products (and other brands like Sports Research, Doctor's Best) match your goals, we'll point you to specific Thorne products when they're the best option.",
    metaDescription: "suppdoc.io vs Thorne: when to use Thorne supplements and how suppdoc helps you pick the right ones for your goals.",
    keywords: "Thorne supplements review, Thorne vs suppdoc, which Thorne supplements, Thorne quiz alternative",
  },

  {
    slug: "suppdoc-vs-care-of",
    name: "Care/of",
    tagline: "Personalised vitamin subscription (defunct Dec 2024)",
    oneLineVerdict: "Care/of shut down in December 2024, suppdoc fills the gap with a free, more flexible model.",
    bottomLine: "Care/of was the original DTC personalised vitamin subscription, acquired by Bayer in 2020 and shut down in December 2024 after Bayer divested. Former Care/of customers looking for a similar quiz-driven recommendation experience can use suppdoc.io free, we cover the same personalization without the subscription lock-in or fulfillment dependency.",
    rows: [
      { label: "Operating status", suppdoc: "Active", competitor: "Shut down Dec 2024", winner: "suppdoc" },
      { label: "Cost", suppdoc: "Free", competitor: "-", winner: "suppdoc" },
      { label: "Personalised quiz", suppdoc: "Yes (2 versions)", competitor: "-", winner: "suppdoc" },
      { label: "Brand choice", suppdoc: "151 ingredients, multiple brands", competitor: "-", winner: "suppdoc" },
      { label: "Audit existing stack", suppdoc: "Yes", competitor: "-", winner: "suppdoc" },
    ],
    pros: [
      "Was a pioneer of the personalised-vitamin DTC model",
      "Beautiful packaging and branding",
    ],
    cons: [
      "Service was discontinued in December 2024 after Bayer divestiture",
      "Customers were left without continuity",
    ],
    bestFor: "Former Care/of customers looking for an alternative since the shutdown.",
    switchToUs: "Take the quiz, we'll match you to ingredients comparable to your old Care/of pack, with the freedom to buy from any trusted retailer.",
    metaDescription: "Care/of alternative: suppdoc.io fills the gap left by Care/of's December 2024 shutdown. Free personalised supplement quiz.",
    keywords: "Care of alternative, Care of shut down, replacement for Care of, Care of supplements gone",
  },

  {
    slug: "suppdoc-vs-examine",
    name: "Examine.com",
    tagline: "Independent supplement research database",
    url: "https://examine.com",
    oneLineVerdict: "Examine is the gold-standard research database; suppdoc turns that kind of evidence into a personalised daily routine.",
    bottomLine: "Examine.com is the most comprehensive independent supplement evidence database in the world, paid subscription ($30+/month for full access). It's reference material, not a personalised recommendation engine. suppdoc.io is downstream: we read the same kind of evidence Examine compiles and turn it into a 'take this, at this dose, at this time' answer for your specific goals, for free.",
    rows: [
      { label: "Type", suppdoc: "Personalised engine", competitor: "Research database", winner: "tie" },
      { label: "Cost", suppdoc: "Free", competitor: "$30+/month (full)", winner: "suppdoc" },
      { label: "Personalisation", suppdoc: "Quiz + audit", competitor: "None (reference)", winner: "suppdoc" },
      { label: "Depth of research per ingredient", suppdoc: "4-6 key studies + curated summary", competitor: "Hundreds of studies per ingredient", winner: "competitor" },
      { label: "Daily routine output", suppdoc: "Yes (with timing)", competitor: "No", winner: "suppdoc" },
      { label: "Audit existing stack", suppdoc: "Yes", competitor: "No", winner: "suppdoc" },
      { label: "Direct shopping", suppdoc: "Yes (iHerb/Amazon)", competitor: "No", winner: "suppdoc" },
    ],
    pros: [
      "Most rigorous independent supplement research database available",
      "Hundreds of studies summarized per ingredient",
      "No commercial conflicts of interest",
      "Excellent for researchers and clinicians",
    ],
    cons: [
      "Steep learning curve for laypeople",
      "Doesn't tell you what to take, just summarizes the evidence",
      "Paid subscription required for full access",
      "No personalisation, no routine, no shopping",
    ],
    bestFor: "Researchers, clinicians, biohackers who want to read the source-level evidence themselves.",
    switchToUs: "If you want practical 'do this' answers, not just the evidence. Or use both: we recommend reading Examine alongside suppdoc when you want a deeper dive on a specific ingredient.",
    metaDescription: "suppdoc.io vs Examine.com: how the leading supplement research database and the leading personalised quiz complement each other.",
    keywords: "Examine.com alternative, Examine vs suppdoc, Examine.com review, free Examine alternative",
  },

  {
    slug: "suppdoc-vs-hims",
    name: "Hims & Hers",
    tagline: "Telehealth + branded supplements & medications",
    url: "https://hims.com",
    oneLineVerdict: "Hims/Hers is telehealth-first with their own supplements and Rx; suppdoc is education-first with cross-brand recommendations.",
    bottomLine: "Hims & Hers is a publicly-traded telehealth company ($1B+ revenue). Their supplement and Rx product lines are bundled into telehealth subscriptions ($40-$200+/month depending on which conditions). suppdoc.io is education and recommendation only, we don't write prescriptions, but we don't lock you into a subscription either. If you have conditions requiring prescription medication, see a real clinician; for supplement guidance, use us.",
    rows: [
      { label: "Type", suppdoc: "Free recommendation engine", competitor: "Telehealth + DTC subscription", winner: "tie" },
      { label: "Cost", suppdoc: "Free", competitor: "$40-$200+/month", winner: "suppdoc" },
      { label: "Personalised supplements", suppdoc: "Yes (151 ingredients)", competitor: "Limited own catalog", winner: "suppdoc" },
      { label: "Prescription medication", suppdoc: "No (we point to clinicians)", competitor: "Yes (via telehealth)", winner: "competitor" },
      { label: "Brand neutrality", suppdoc: "Yes, affiliate model", competitor: "Their own brand", winner: "suppdoc" },
      { label: "Subscription lock-in", suppdoc: "None", competitor: "Yes", winner: "suppdoc" },
      { label: "Audit existing supplements", suppdoc: "Yes", competitor: "No", winner: "suppdoc" },
    ],
    pros: [
      "Real telehealth with licensed providers for prescription needs",
      "Convenient one-stop for ED, mental health, hair loss, skincare",
      "Subscription model includes shipping",
    ],
    cons: [
      "Supplement quality is acceptable but not best-in-class",
      "Monthly cost adds up quickly across categories",
      "Their recommendations focus on their own SKUs",
      "Not a true supplement personalisation engine, supplements are an add-on to the telehealth core",
    ],
    bestFor: "Adults seeking prescription medication or telehealth services who want convenience over depth.",
    switchToUs: "If your need is supplement guidance specifically, not a telehealth visit, you'll get broader options and pay nothing. For Rx needs, see a real clinician (we can complement, not replace).",
    metaDescription: "suppdoc.io vs Hims & Hers: free supplement recommendations vs telehealth subscription. When each makes sense.",
    keywords: "Hims alternative, Hers alternative, Hims supplements review, free Hims supplement alternative",
  },

  {
    slug: "suppdoc-vs-function-health",
    name: "Function Health",
    tagline: "Comprehensive lab-testing membership",
    url: "https://functionhealth.com",
    oneLineVerdict: "Function runs 100+ lab tests to show you what's happening inside; suppdoc is free and turns lab results (theirs or anyone's) into a supplement plan.",
    bottomLine: "Function Health is a lab-testing membership ($365/year for 100+ biomarkers at signup plus a 60+ marker mid-year retest, with clinician review). It tells you what your bloodwork shows. suppdoc.io is downstream and free: upload a lab report (from Function or any provider) to our bloodwork tool and we match flagged markers to evidence-based supplements, then point you to specific products. They're complementary, Function for testing, suppdoc for what to do about the results.",
    rows: [
      { label: "Type", suppdoc: "Free recommendation + bloodwork analysis", competitor: "Lab-testing membership", winner: "tie" },
      { label: "Cost", suppdoc: "Free", competitor: "$365/year", winner: "suppdoc" },
      { label: "Runs your blood tests", suppdoc: "No (you upload results)", competitor: "Yes (100+ biomarkers)", winner: "competitor" },
      { label: "Analyzes a lab report", suppdoc: "Yes (free upload)", competitor: "Yes (own panels)", winner: "tie" },
      { label: "Supplement recommendations", suppdoc: "Yes (151 ingredients, multiple brands)", competitor: "Included supplement list", winner: "suppdoc" },
      { label: "Personalised stack with timing", suppdoc: "Yes", competitor: "Limited", winner: "suppdoc" },
      { label: "Clinician review", suppdoc: "We point to clinicians", competitor: "Yes", winner: "competitor" },
      { label: "Brand neutrality", suppdoc: "Affiliate model, no own pills", competitor: "Independent", winner: "tie" },
    ],
    pros: [
      "Genuinely comprehensive lab panel (100+ biomarkers) twice a year",
      "Clinician review and a clear action plan",
      "Tracks change over time with a mid-year retest",
      "No doctor visit required to order testing",
    ],
    cons: [
      "Annual membership cost (testing infrastructure isn't free)",
      "It's testing-first, the supplement guidance is a lighter add-on",
      "US-focused lab network",
    ],
    bestFor: "People who want comprehensive lab testing and longitudinal biomarker tracking with clinician oversight.",
    switchToUs: "If you already have recent bloodwork (from Function or your own doctor) and want a free, deeper supplement plan from it, upload it to our bloodwork tool. Use both: test with Function, plan with suppdoc.",
    metaDescription: "suppdoc.io vs Function Health: free supplement plan + bloodwork analysis vs a $365/yr lab-testing membership. How they complement each other.",
    keywords: "Function Health alternative, Function Health vs suppdoc, Function Health review, what supplements after Function Health labs",
  },

  {
    slug: "suppdoc-vs-bioniq",
    name: "Bioniq",
    tagline: "Custom-blended granule supplements by subscription",
    url: "https://bioniq.com",
    oneLineVerdict: "Bioniq blends a single custom granule formula and ships it on subscription; suppdoc is free, recommends third-party-tested brands, and locks you into nothing.",
    bottomLine: "Bioniq makes personalised supplements as a single custom granule blend, Bioniq GO ($75/month, quiz-based, up to ~35 ingredients) and Bioniq PRO ($199/month, built from your blood test, up to ~120 ingredients), on a quarterly subscription with a 90-day minimum commitment. suppdoc.io is free and unbundled: we recommend specific, third-party-tested products you buy from iHerb or Amazon, so you keep brand choice, avoid the lock-in, and can audit or swap any item.",
    rows: [
      { label: "Cost", suppdoc: "Free", competitor: "$75-$199/month", winner: "suppdoc" },
      { label: "Personalisation", suppdoc: "Quiz + audit + bloodwork upload", competitor: "Quiz (GO) / blood test (PRO)", winner: "tie" },
      { label: "Format", suppdoc: "Standard bottles you choose", competitor: "Single custom granule blend", winner: "tie" },
      { label: "Brand choice", suppdoc: "151 ingredients, multiple brands", competitor: "Bioniq's own formula only", winner: "suppdoc" },
      { label: "Third-party tested products", suppdoc: "We recommend tested brands", competitor: "Proprietary blend", winner: "tie" },
      { label: "Lock-in", suppdoc: "None", competitor: "90-day minimum, quarterly auto-renew", winner: "suppdoc" },
      { label: "Audit an existing stack", suppdoc: "Yes (free)", competitor: "No", winner: "suppdoc" },
      { label: "All-in-one convenience", suppdoc: "No (separate bottles)", competitor: "Yes (one scoop)", winner: "competitor" },
    ],
    pros: [
      "Single custom granule blend is convenient, one scoop instead of many pills",
      "PRO tier formulates from real blood-test biomarkers",
      "Reformulates as your data changes",
      "Polished, premium experience",
    ],
    cons: [
      "Expensive vs buying the same ingredients individually ($900-$2,400/year)",
      "Locked into Bioniq's proprietary blend, can't swap individual ingredients",
      "90-day minimum commitment and quarterly billing",
      "No way to evaluate or audit supplements you already take",
    ],
    bestFor: "People who'll pay a premium for an all-in-one custom blend and don't want to manage multiple bottles.",
    switchToUs: "If you want the same personalisation without the markup or lock-in, keep your brand choice, see the research behind each pick, and audit what you already take, all free.",
    metaDescription: "suppdoc.io vs Bioniq: free brand-flexible supplement plan vs Bioniq's $75-$199/mo custom blend. Compare cost, lock-in, and personalisation.",
    keywords: "Bioniq alternative, Bioniq vs suppdoc, Bioniq review, cheaper than Bioniq, Bioniq PRO cost",
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find(c => c.slug === slug);
}
