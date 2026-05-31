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
