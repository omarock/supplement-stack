/**
 * Biomarker reference library for the Bloodwork analyzer.
 *
 * Purpose:
 *  1. Ground Claude's extraction (a known catalog of markers + canonical units).
 *  2. Map an out-of-range marker to supplement ids that exist in our 151-item
 *     catalog, so recommendations always link to a real /ingredients page.
 *  3. Power a deterministic fallback classification if needed.
 *
 * IMPORTANT (medical safety): these ranges are common adult reference intervals
 * for orientation only. Real lab reports include their own reference ranges and
 * those always take precedence. Nothing here is a diagnosis.
 */

export type BiomarkerStatus = "low" | "borderline-low" | "optimal" | "normal" | "borderline-high" | "high" | "unknown";

export interface BiomarkerDef {
  key: string;
  label: string;
  aliases: string[];     // lowercased substrings used to match free-text lab names
  unit: string;          // canonical conventional (US) unit
  category: "vitamins" | "minerals" | "metabolic" | "lipids" | "thyroid" | "inflammation" | "hormones" | "blood";
  // Threshold bands in the canonical unit. Any may be omitted.
  low?: number;          // below = "low"
  borderlineLow?: number;// below = "borderline-low"
  optimalMin?: number;
  optimalMax?: number;
  borderlineHigh?: number; // above = "borderline-high"
  high?: number;           // above = "high"
  // "lowerIsBetter" markers (LDL, triglycerides, glucose, CRP) only flag on the high side.
  lowerIsBetter?: boolean;
  // Supplement ids (from SUPPLEMENT_DB) that address a deficiency / abnormal value.
  supplementsForLow?: string[];
  supplementsForHigh?: string[];
  blurb: string;         // one-line plain-English description
}

export const BIOMARKERS: BiomarkerDef[] = [
  {
    key: "vitamin_d", label: "Vitamin D (25-OH)", aliases: ["25-oh", "25 oh", "vitamin d", "25-hydroxy", "calcidiol"],
    unit: "ng/mL", category: "vitamins",
    low: 20, borderlineLow: 30, optimalMin: 40, optimalMax: 80, high: 100,
    supplementsForLow: ["d3k2"],
    blurb: "Drives immune function, mood, bone health, and calcium handling.",
  },
  {
    key: "ferritin", label: "Ferritin", aliases: ["ferritin"],
    unit: "ng/mL", category: "blood",
    low: 30, borderlineLow: 50, optimalMin: 50, optimalMax: 150, borderlineHigh: 300, high: 400,
    supplementsForLow: ["iron", "vit-c"],
    blurb: "Iron storage. Low ferritin is a leading cause of fatigue, especially in menstruating women.",
  },
  {
    key: "iron", label: "Serum Iron", aliases: ["serum iron", "iron,"],
    unit: "µg/dL", category: "blood",
    low: 60, optimalMin: 70, optimalMax: 170, high: 190,
    supplementsForLow: ["iron", "vit-c"],
    blurb: "Circulating iron available for red blood cell production.",
  },
  {
    key: "b12", label: "Vitamin B12", aliases: ["b12", "cobalamin", "b-12"],
    unit: "pg/mL", category: "vitamins",
    low: 300, borderlineLow: 400, optimalMin: 500, optimalMax: 900, high: 1100,
    supplementsForLow: ["b12", "b-complex"],
    blurb: "Essential for nerve function, energy, and red blood cells. Common deficiency in vegans/vegetarians.",
  },
  {
    key: "folate", label: "Folate", aliases: ["folate", "folic"],
    unit: "ng/mL", category: "vitamins",
    low: 4, optimalMin: 7, optimalMax: 20,
    supplementsForLow: ["methylfolate", "b-complex"],
    blurb: "B-vitamin needed for DNA synthesis and methylation.",
  },
  {
    key: "magnesium", label: "Magnesium (serum)", aliases: ["magnesium", "mg "],
    unit: "mg/dL", category: "minerals",
    low: 1.8, optimalMin: 2.0, optimalMax: 2.4, high: 2.6,
    supplementsForLow: ["mag-glycinate"],
    blurb: "Cofactor in 300+ reactions. Serum captures only ~1% of body stores, so 'normal' can still mask a shortfall.",
  },
  {
    key: "zinc", label: "Zinc", aliases: ["zinc"],
    unit: "µg/dL", category: "minerals",
    low: 70, optimalMin: 80, optimalMax: 120, high: 150,
    supplementsForLow: ["zinc"],
    blurb: "Immune function, testosterone, wound healing, taste/smell.",
  },
  {
    key: "selenium", label: "Selenium", aliases: ["selenium"],
    unit: "µg/dL", category: "minerals",
    low: 70, optimalMin: 90, optimalMax: 150,
    supplementsForLow: ["selenium"],
    blurb: "Antioxidant cofactor and key to thyroid hormone conversion.",
  },
  {
    key: "tsh", label: "TSH", aliases: ["tsh", "thyroid stimulating"],
    unit: "mIU/L", category: "thyroid",
    low: 0.4, optimalMin: 1.0, optimalMax: 2.5, borderlineHigh: 4.0, high: 4.5,
    supplementsForHigh: ["selenium", "iodine"],
    blurb: "High TSH suggests an underactive thyroid; low suggests overactive. Conversion needs selenium + iodine.",
  },
  {
    key: "free_t4", label: "Free T4", aliases: ["free t4", "ft4", "free thyroxine"],
    unit: "ng/dL", category: "thyroid",
    low: 0.8, optimalMin: 1.0, optimalMax: 1.6, high: 1.8,
    blurb: "Circulating thyroid hormone.",
  },
  {
    key: "glucose_fasting", label: "Fasting Glucose", aliases: ["fasting glucose", "glucose, fasting", "glucose serum", "glucose,"],
    unit: "mg/dL", category: "metabolic", lowerIsBetter: true,
    optimalMin: 70, optimalMax: 90, borderlineHigh: 100, high: 126,
    supplementsForHigh: ["berberine", "chromium", "ala"],
    blurb: "Blood sugar after fasting. 100-125 = prediabetic range; 126+ on two tests = diabetic range.",
  },
  {
    key: "hba1c", label: "HbA1c", aliases: ["hba1c", "a1c", "hemoglobin a1c", "glycated"],
    unit: "%", category: "metabolic", lowerIsBetter: true,
    optimalMin: 4.0, optimalMax: 5.4, borderlineHigh: 5.7, high: 6.5,
    supplementsForHigh: ["berberine", "chromium", "ala"],
    blurb: "Average blood sugar over ~3 months. 5.7-6.4% = prediabetic; 6.5%+ = diabetic range.",
  },
  {
    key: "total_cholesterol", label: "Total Cholesterol", aliases: ["total cholesterol", "cholesterol, total", "cholesterol total"],
    unit: "mg/dL", category: "lipids", lowerIsBetter: true,
    optimalMax: 200, borderlineHigh: 200, high: 240,
    supplementsForHigh: ["omega3", "bergamot", "aged-garlic"],
    blurb: "Overall cholesterol. Context (LDL particle size, HDL, triglycerides) matters more than the single number.",
  },
  {
    key: "ldl", label: "LDL Cholesterol", aliases: ["ldl"],
    unit: "mg/dL", category: "lipids", lowerIsBetter: true,
    optimalMax: 100, borderlineHigh: 130, high: 160,
    supplementsForHigh: ["omega3", "bergamot", "red-yeast-rice", "aged-garlic"],
    blurb: "The 'bad' cholesterol carrier most associated with cardiovascular risk.",
  },
  {
    key: "hdl", label: "HDL Cholesterol", aliases: ["hdl"],
    unit: "mg/dL", category: "lipids",
    low: 40, borderlineLow: 50, optimalMin: 60, optimalMax: 100,
    supplementsForLow: ["omega3", "vit-b3"],
    blurb: "The 'good' cholesterol. Higher is generally protective.",
  },
  {
    key: "triglycerides", label: "Triglycerides", aliases: ["triglyceride"],
    unit: "mg/dL", category: "lipids", lowerIsBetter: true,
    optimalMax: 90, borderlineHigh: 150, high: 200,
    supplementsForHigh: ["omega3", "berberine"],
    blurb: "Blood fats. Strongly responsive to diet (sugar/alcohol) and omega-3s.",
  },
  {
    key: "hs_crp", label: "hs-CRP", aliases: ["crp", "c-reactive", "c reactive"],
    unit: "mg/L", category: "inflammation", lowerIsBetter: true,
    optimalMax: 1.0, borderlineHigh: 1.0, high: 3.0,
    supplementsForHigh: ["omega3", "curcumin"],
    blurb: "Sensitive marker of systemic inflammation and cardiovascular risk.",
  },
  {
    key: "homocysteine", label: "Homocysteine", aliases: ["homocysteine"],
    unit: "µmol/L", category: "inflammation", lowerIsBetter: true,
    optimalMax: 7.0, borderlineHigh: 10.0, high: 15.0,
    supplementsForHigh: ["b-complex", "methylfolate", "b12", "vit-b6", "tmg"],
    blurb: "Elevated levels signal a methylation/B-vitamin shortfall and raise cardiovascular risk.",
  },
  {
    key: "testosterone_total", label: "Total Testosterone", aliases: ["total testosterone", "testosterone, total", "testosterone total"],
    unit: "ng/dL", category: "hormones",
    low: 300, borderlineLow: 400, optimalMin: 500, optimalMax: 900,
    supplementsForLow: ["zinc", "d3k2", "boron", "tongkat-ali", "ashwagandha"],
    blurb: "Primary male androgen (also important in women at lower levels). Supports muscle, libido, mood, energy.",
  },
  {
    key: "vitamin_b6", label: "Vitamin B6", aliases: ["b6", "pyridoxine"],
    unit: "µg/L", category: "vitamins",
    low: 5, optimalMin: 10, optimalMax: 50,
    supplementsForLow: ["vit-b6", "b-complex"],
    blurb: "Cofactor for neurotransmitter synthesis and homocysteine clearance.",
  },
];

/**
 * Curated per-marker depth for the public /biomarkers/[marker] pages.
 * Established clinical orientation only (no fabricated study citations); every
 * page still defers to the user's own lab range and clinician. Rendered
 * conditionally, so a marker without an entry simply shows less.
 */
export interface BiomarkerDetail {
  causes: string[];        // common drivers of an out-of-range result
  symptoms: string[];      // how an out-of-range result can present
  whoShouldTest: string;   // who/when it is worth testing
  mechanism: string;       // how the linked supplements act on THIS marker
}

export const BIOMARKER_DETAIL: Record<string, BiomarkerDetail> = {
  vitamin_d: {
    causes: ["Limited sun exposure, especially in winter or at northern latitudes", "Darker skin, which needs more sun to make vitamin D", "Older age and less efficient skin synthesis", "Higher body fat, which sequesters vitamin D", "Malabsorption (celiac, Crohn's, gastric surgery)"],
    symptoms: ["Fatigue and low mood", "Frequent infections", "Bone aches or muscle weakness", "Hair thinning"],
    whoShouldTest: "Worth testing if you get little sun, have darker skin, feel persistently run down, or have a bone-health concern. Many clinicians retest 8 to 12 weeks after starting a supplement.",
    mechanism: "Vitamin D3 raises blood 25-OH-D more reliably than D2, and pairing it with vitamin K2 helps direct the resulting calcium into bone rather than soft tissue.",
  },
  ferritin: {
    causes: ["Heavy menstrual periods", "Low dietary iron or a mostly plant-based diet", "Pregnancy", "Blood loss from the gut", "Poor absorption from low stomach acid or celiac disease"],
    symptoms: ["Fatigue and low stamina", "Hair shedding", "Pale skin", "Cold hands and feet", "Restless legs at night", "Breathlessness on exertion"],
    whoShouldTest: "Especially useful for menstruating women, vegetarians, endurance athletes, and anyone with unexplained fatigue or hair loss. A high ferritin should be reviewed with a doctor, as it can reflect inflammation or iron overload.",
    mechanism: "Iron bisglycinate is a gentle, well-absorbed form; taking it with vitamin C improves uptake, while coffee, tea, and calcium reduce it, so spacing matters.",
  },
  iron: {
    causes: ["Low dietary intake or blood loss when low", "Iron supplements or overload conditions such as hemochromatosis when high", "Inflammation, which can distort the reading"],
    symptoms: ["Fatigue, weakness, and poor exercise tolerance when low", "Often silent when mildly high"],
    whoShouldTest: "Serum iron is best read alongside ferritin and transferrin saturation rather than on its own. Discuss persistent abnormalities with your clinician.",
    mechanism: "Vitamin C taken with an iron source increases absorption of the iron available for red-blood-cell production.",
  },
  b12: {
    causes: ["A plant-based diet, since B12 is found mainly in animal foods", "Older age and reduced stomach acid", "Long-term metformin or acid-reducing medication", "Pernicious anemia or gut malabsorption"],
    symptoms: ["Fatigue and brain fog", "Tingling or numbness in the hands and feet", "Low mood", "A sore, smooth tongue"],
    whoShouldTest: "Important for vegans and vegetarians, adults over 50, and anyone on metformin or long-term antacids. Nerve symptoms warrant prompt medical review.",
    mechanism: "Methylcobalamin, often within a B-complex, restores B12 and the B-vitamins it works with; sublingual or higher oral doses bypass weak stomach-acid absorption.",
  },
  folate: {
    causes: ["Low intake of leafy greens and legumes", "Regular alcohol use", "Pregnancy, which raises demand", "MTHFR variants that slow activation of folic acid"],
    symptoms: ["Fatigue", "Mouth sores", "Low mood", "In pregnancy, a higher neural-tube-defect risk"],
    whoShouldTest: "Relevant before and during pregnancy, with heavy alcohol use, or alongside an elevated homocysteine.",
    mechanism: "Methylfolate is the active form the body uses directly, useful for those with MTHFR variants who convert folic acid poorly.",
  },
  magnesium: {
    causes: ["Low intake of greens, nuts, and whole grains", "High alcohol intake", "Diuretics or proton-pump inhibitors", "High stress and heavy sweating"],
    symptoms: ["Muscle cramps or twitches", "Poor sleep", "Anxiety or irritability", "Palpitations", "Constipation"],
    whoShouldTest: "Because serum holds only about 1% of body magnesium, a normal result can still hide a shortfall, so symptoms and intake matter as much as the number.",
    mechanism: "Magnesium glycinate is well-absorbed and gentle on the gut, supporting the many reactions magnesium drives, including sleep and muscle relaxation.",
  },
  zinc: {
    causes: ["A plant-based diet, where phytates reduce absorption", "Gut malabsorption", "High alcohol intake", "Heavy sweating or recurrent illness"],
    symptoms: ["Frequent colds or slow wound healing", "Reduced taste or smell", "Hair loss", "Breakouts"],
    whoShouldTest: "Useful for vegetarians, frequent illness, or low libido. Long-term high-dose zinc can deplete copper, so balance matters.",
    mechanism: "Supplemental zinc restores levels that support immune cells, testosterone, and wound repair; take it away from high-dose iron or calcium.",
  },
  selenium: {
    causes: ["Low-selenium soils and diet", "Malabsorption", "A diet lacking Brazil nuts, seafood, or organ meats"],
    symptoms: ["Often silent; a marked shortfall can affect thyroid and immune function"],
    whoShouldTest: "Relevant with thyroid concerns or a restricted diet. Selenium has a fairly narrow safe range, so avoid stacking several high-dose sources.",
    mechanism: "Selenium is a cofactor for the enzymes that convert thyroid T4 into active T3 and that recycle antioxidants; a modest dose restores this without tipping into excess.",
  },
  tsh: {
    causes: ["An underactive thyroid or Hashimoto's raises TSH", "An iodine or selenium shortfall", "An overactive thyroid or over-replacement lowers TSH"],
    symptoms: ["High TSH: fatigue, weight gain, cold intolerance, dry skin, low mood", "Low TSH: palpitations, anxiety, heat intolerance, weight loss"],
    whoShouldTest: "Worth checking with unexplained fatigue, weight change, or cold intolerance. An abnormal TSH should be confirmed and managed with a clinician, usually with free T4 and antibodies.",
    mechanism: "Selenium and adequate iodine support thyroid hormone production and conversion, but they complement, not replace, medical thyroid care.",
  },
  free_t4: {
    causes: ["A low free T4 points to an underactive thyroid", "A high free T4 points to an overactive thyroid or over-replacement"],
    symptoms: ["Low T4 tends toward sluggishness, weight gain, and cold intolerance", "High T4 tends toward agitation, palpitations, and heat intolerance"],
    whoShouldTest: "Usually interpreted together with TSH. Any abnormality belongs in a clinician's hands.",
    mechanism: "Free T4 reflects circulating thyroid hormone; supplements play only a supporting role and the dosing of thyroid hormone is a medical decision.",
  },
  glucose_fasting: {
    causes: ["Insulin resistance, often with excess fat around the middle", "Low activity and a refined-carb-heavy diet", "Poor sleep and chronic stress", "Family history"],
    symptoms: ["Often none early on", "Later: increased thirst, frequent urination, and fatigue"],
    whoShouldTest: "Recommended with a family history, excess weight, or signs of metabolic syndrome. A fasting glucose of 100 to 125 mg/dL is the prediabetic range.",
    mechanism: "Berberine, chromium, and alpha-lipoic acid support insulin sensitivity and glucose uptake, alongside the larger levers of diet, movement, and weight.",
  },
  hba1c: {
    causes: ["Sustained high blood sugar over the prior 3 months", "Insulin resistance, low activity, and a refined-carb-heavy diet"],
    symptoms: ["Usually silent in the prediabetic range"],
    whoShouldTest: "A useful 3-month average; 5.7 to 6.4% is prediabetic. Give lifestyle or supplement changes about 3 months before retesting.",
    mechanism: "Because HbA1c reflects average glucose, the same insulin-sensitizing supports (berberine, chromium, alpha-lipoic acid) plus diet and exercise are what shift it.",
  },
  total_cholesterol: {
    causes: ["Genetic, familial patterns", "A diet heavy in saturated and trans fats", "An underactive thyroid", "Low activity"],
    symptoms: ["No symptoms; found only by testing"],
    whoShouldTest: "Part of routine cardiovascular screening. The fuller picture (LDL, HDL, triglycerides, and particle size) matters more than the single total.",
    mechanism: "Omega-3s, bergamot, and aged garlic can nudge the lipid panel, but they sit alongside diet, weight, and any prescribed therapy.",
  },
  ldl: {
    causes: ["Genetics, including familial hypercholesterolemia", "A diet high in saturated and trans fats", "An underactive thyroid", "Excess weight and low activity"],
    symptoms: ["Silent; a key driver of long-term cardiovascular risk"],
    whoShouldTest: "Central to heart-risk assessment. Persistently high LDL, or a family history of early heart disease, should be reviewed with a clinician.",
    mechanism: "Omega-3s, bergamot, red yeast rice, and aged garlic have evidence for modestly lowering LDL; red yeast rice in particular is best used under medical guidance.",
  },
  hdl: {
    causes: ["Low activity and excess weight", "Smoking", "A high refined-carb intake", "Genetics"],
    symptoms: ["No direct symptoms"],
    whoShouldTest: "Low HDL is part of metabolic-syndrome risk. Exercise and omega-3s are the most reliable levers.",
    mechanism: "Omega-3s and niacin (vitamin B3) can raise HDL, though regular aerobic exercise is the strongest non-drug lever.",
  },
  triglycerides: {
    causes: ["High sugar, refined carbs, and alcohol intake", "Excess weight and insulin resistance", "An underactive thyroid"],
    symptoms: ["Usually none; very high levels raise pancreatitis risk"],
    whoShouldTest: "Responds quickly to diet, so it is worth rechecking after cutting sugar and alcohol. Best measured fasting.",
    mechanism: "Omega-3s (EPA and DHA) are among the most effective nutrients for lowering triglycerides; berberine helps via improved insulin sensitivity.",
  },
  hs_crp: {
    causes: ["A recent infection or injury, which can transiently spike it", "Excess body fat", "Smoking", "Chronic low-grade or autoimmune inflammation"],
    symptoms: ["No direct symptoms; it is a risk marker rather than a sensation"],
    whoShouldTest: "A cardiovascular and general-inflammation marker. Recheck when you are well, since a recent cold or injury can elevate it temporarily.",
    mechanism: "Omega-3s and curcumin have anti-inflammatory evidence that can help lower hs-CRP, alongside weight, sleep, and not smoking.",
  },
  homocysteine: {
    causes: ["A shortfall of folate, B12, or B6", "MTHFR genetic variants", "An underactive thyroid", "Reduced kidney function"],
    symptoms: ["No direct symptoms; elevated levels raise cardiovascular and cognitive risk"],
    whoShouldTest: "Useful with cardiovascular or cognitive concerns, or a known MTHFR variant.",
    mechanism: "B6, B12, folate (as methylfolate), and TMG supply the methyl groups that clear homocysteine into harmless compounds, often lowering it within weeks.",
  },
  testosterone_total: {
    causes: ["Aging", "Excess body fat and insulin resistance", "Poor sleep and chronic stress", "Low zinc or vitamin D", "Certain medications"],
    symptoms: ["Low libido", "Fatigue and low motivation", "Loss of muscle and strength", "Low mood"],
    whoShouldTest: "Best measured in the morning when levels peak, and confirmed on a repeat test. Symptoms plus a low number, reviewed with a clinician, matter more than a single reading.",
    mechanism: "Zinc, vitamin D, boron, tongkat ali, and ashwagandha have evidence for supporting testosterone where it is low, working best alongside sleep, training, and fat loss.",
  },
  vitamin_b6: {
    causes: ["Low intake", "Regular alcohol use", "Certain medications", "Malabsorption"],
    symptoms: ["Low mood or irritability", "Tingling in the hands or feet", "Cracked lips or a sore tongue"],
    whoShouldTest: "Relevant alongside an elevated homocysteine or neurological symptoms. Note that very high, long-term B6 can itself cause nerve symptoms, so dosing matters.",
    mechanism: "B6 (as P5P, often in a B-complex) is a cofactor for neurotransmitter production and, with folate and B12, for clearing homocysteine.",
  },
};

export interface ExtractedBiomarker {
  key?: string;          // matched catalog key, if recognized
  name: string;          // as printed on the report
  value: number | null;
  unit: string | null;
  refRange?: string | null; // the lab's own printed range
  status: BiomarkerStatus;
  category?: BiomarkerDef["category"];
  note?: string;
}

export interface BloodworkAnalysis {
  ok: boolean;
  biomarkers: ExtractedBiomarker[];
  summary: string;            // 2-3 sentence plain-English overview
  findings: {                 // grouped, human-readable findings
    title: string;
    detail: string;
    severity: "info" | "watch" | "flag";
    biomarkers?: string[];
  }[];
  recommendations: {
    supplementId?: string;
    name: string;
    reason: string;
    biomarker?: string;
  }[];
  lifestyle: string[];
  seeClinicianFor: string[];  // explicit "talk to a doctor about X" prompts
  confidence: "high" | "medium" | "low";
  poweredBy: "claude" | "rules";
  error?: string;
}

export function findBiomarker(name: string): BiomarkerDef | undefined {
  const n = name.toLowerCase();
  return BIOMARKERS.find(b => b.aliases.some(a => n.includes(a)) || n.includes(b.key.replace(/_/g, " ")));
}

/** Deterministic classification from value + catalog thresholds. */
export function classify(def: BiomarkerDef, value: number): BiomarkerStatus {
  if (def.high !== undefined && value >= def.high) return "high";
  if (def.borderlineHigh !== undefined && value >= def.borderlineHigh) return "borderline-high";
  if (!def.lowerIsBetter) {
    if (def.low !== undefined && value < def.low) return "low";
    if (def.borderlineLow !== undefined && value < def.borderlineLow) return "borderline-low";
  }
  if (def.optimalMin !== undefined && def.optimalMax !== undefined && value >= def.optimalMin && value <= def.optimalMax) return "optimal";
  return "normal";
}

export const STATUS_META: Record<BiomarkerStatus, { label: string; hue: string; bg: string }> = {
  "low":             { label: "Low", hue: "#b91c1c", bg: "#fef2f2" },
  "borderline-low":  { label: "Borderline low", hue: "#b5751e", bg: "#fffbeb" },
  "optimal":         { label: "Optimal", hue: "#3f7a52", bg: "#f0f9f3" },
  "normal":          { label: "In range", hue: "#5ba373", bg: "#f0f9f3" },
  "borderline-high": { label: "Borderline high", hue: "#b5751e", bg: "#fffbeb" },
  "high":            { label: "High", hue: "#b91c1c", bg: "#fef2f2" },
  "unknown":         { label: "Noted", hue: "#6b7280", bg: "#f6f5f1" },
};

export interface RangeBarZone { from: number; to: number; color: string }
export interface RangeBarModel { markerPct: number; zones: RangeBarZone[]; domainMin: number; domainMax: number }

const ZONE_RED = "#fca5a5";
const ZONE_AMBER = "#fcd34d";
const ZONE_GREEN = "#86c79a";

/**
 * Build a visual healthy-range bar for a biomarker value (Function-Health style).
 * Returns null when the marker isn't in our catalog or lacks enough thresholds.
 * markerPct + each zone's from/to are percentages (0-100) along the bar.
 */
export function rangeBarModel(key: string | undefined, value: number | null): RangeBarModel | null {
  if (!key || value === null || Number.isNaN(value)) return null;
  const def = BIOMARKERS.find(b => b.key === key);
  if (!def) return null;

  const edges = [def.low, def.borderlineLow, def.optimalMin, def.optimalMax, def.borderlineHigh, def.high]
    .filter((n): n is number => typeof n === "number");
  if (edges.length < 2) return null;

  const lo = Math.min(...edges);
  const hi = Math.max(...edges);
  const span = hi - lo || 1;
  const domainMin = Math.max(0, lo - span * 0.35);
  const domainMax = hi + span * 0.35;
  const P = (v: number) => Math.max(0, Math.min(100, ((v - domainMin) / (domainMax - domainMin)) * 100));

  const zones: RangeBarZone[] = [];
  if (def.lowerIsBetter) {
    const okMax = def.optimalMax ?? def.borderlineHigh ?? hi;
    const bh = def.borderlineHigh ?? okMax;
    const h = def.high ?? hi;
    zones.push({ from: 0, to: P(bh), color: ZONE_GREEN });
    zones.push({ from: P(bh), to: P(h), color: ZONE_AMBER });
    zones.push({ from: P(h), to: 100, color: ZONE_RED });
  } else {
    const lowT = def.low ?? lo;
    const omin = def.optimalMin ?? def.borderlineLow ?? lowT;
    const omax = def.optimalMax ?? hi;
    const h = def.high ?? def.borderlineHigh ?? hi;
    zones.push({ from: 0, to: P(lowT), color: ZONE_RED });
    zones.push({ from: P(lowT), to: P(omin), color: ZONE_AMBER });
    zones.push({ from: P(omin), to: P(omax), color: ZONE_GREEN });
    if (def.borderlineHigh !== undefined || def.high !== undefined) {
      zones.push({ from: P(omax), to: P(h), color: ZONE_AMBER });
      zones.push({ from: P(h), to: 100, color: ZONE_RED });
    }
  }

  return { markerPct: P(value), zones: zones.filter(z => z.to > z.from), domainMin, domainMax };
}

/** Compact catalog string injected into Claude's system prompt for grounding. */
export function biomarkerCatalogForPrompt(): string {
  return BIOMARKERS.map(b => {
    const supLow = b.supplementsForLow?.length ? ` low→[${b.supplementsForLow.join(",")}]` : "";
    const supHigh = b.supplementsForHigh?.length ? ` high→[${b.supplementsForHigh.join(",")}]` : "";
    return `${b.key} (${b.label}, ${b.unit}):${supLow}${supHigh}`;
  }).join("\n");
}
