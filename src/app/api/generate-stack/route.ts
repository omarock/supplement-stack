import { NextRequest } from "next/server";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { callClaude, anthropicEnabled, safeParseJson } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GenerateRequest {
  text: string;        // user's plain-English description
  veganOnly?: boolean;
  budget?: "low" | "medium" | "high"; // <40, <80, <150 USD/mo
}

export interface GenerateResponse {
  ok: boolean;
  goals: string[];        // extracted goals as short tags
  stack: { id: string; name: string; reason: string }[];
  monthlyCost: number;
  poweredBy: "claude" | "rules";
  notes?: string[];
  error?: string;
}

const GOAL_KEYWORDS: { goal: string; tags: string[]; keywords: string[] }[] = [
  { goal: "sleep", tags: ["sleep", "low-sleep", "sleep-onset", "wake-at-night"], keywords: ["sleep", "insomnia", "rest", "tired in the morning", "wake up at night"] },
  { goal: "energy", tags: ["energy", "low-energy", "afternoon-crash"], keywords: ["energy", "fatigue", "tired", "afternoon crash", "exhausted"] },
  { goal: "focus", tags: ["focus", "brain-fog", "poor-focus", "memory"], keywords: ["focus", "concentration", "brain fog", "clarity", "memory", "productivity"] },
  { goal: "stress", tags: ["stress", "anxiety", "high-stress"], keywords: ["stress", "anxiety", "anxious", "burnout", "overwhelmed", "calm"] },
  { goal: "recovery", tags: ["recovery", "active", "very-active"], keywords: ["recovery", "muscle", "gym", "training", "workout", "soreness", "strength"] },
  { goal: "immune", tags: ["immune", "frequent-illness"], keywords: ["immune", "immunity", "sick often", "colds", "flu"] },
  { goal: "longevity", tags: ["longevity", "anti-aging"], keywords: ["longevity", "anti-aging", "aging", "healthspan", "live longer", "NAD"] },
  { goal: "beauty", tags: ["beauty", "skin", "hair"], keywords: ["skin", "hair", "nails", "beauty", "glow", "elasticity"] },
  { goal: "gut", tags: ["gut", "digestive-issues", "bloating"], keywords: ["gut", "digestion", "bloating", "stomach", "IBS", "microbiome"] },
  { goal: "joint", tags: ["joint", "joint-pain", "inflammation"], keywords: ["joint", "knee", "back pain", "stiffness", "inflammation", "arthritis"] },
  { goal: "heart", tags: ["heart", "longevity"], keywords: ["heart", "cardiovascular", "cholesterol", "blood pressure", "cardio"] },
  { goal: "hormone-female", tags: ["female"], keywords: ["pms", "cycle", "menstrual", "menopause", "perimenopause"] },
  { goal: "hormone-male", tags: ["male"], keywords: ["testosterone", "libido", "men's health"] },
];

const BUDGET_CAP: Record<string, number> = { low: 40, medium: 80, high: 150 };

// ─── Rules-based fallback ─────────────────────────────────────────────────
function rulesBasedGenerate(req: GenerateRequest): GenerateResponse {
  const text = req.text.toLowerCase();
  const detectedGoals = new Set<string>();
  const tagSet = new Set<string>();

  for (const g of GOAL_KEYWORDS) {
    if (g.keywords.some(k => text.includes(k))) {
      detectedGoals.add(g.goal);
      g.tags.forEach(t => tagSet.add(t));
    }
  }
  // If nothing matched, fall to a general health stack
  if (tagSet.size === 0) {
    ["general", "longevity"].forEach(t => tagSet.add(t));
  }

  // Score every supplement by tag-match + evidence + priority
  const scored = SUPPLEMENT_DB.map(s => {
    const matches = s.tags.filter(t => tagSet.has(t)).length;
    const ev = s.evidence === "very strong" ? 1 : s.evidence === "strong" ? 0.5 : 0;
    const pr = (s.priority ?? 5) / 10;
    return { supp: s, score: matches * 2 + ev + pr };
  }).filter(({ supp }) => {
    if (req.veganOnly && !supp.vegan) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const cap = BUDGET_CAP[req.budget ?? "medium"];
  const maxCount = req.budget === "low" ? 4 : req.budget === "high" ? 9 : 6;
  const chosen: GenerateResponse["stack"] = [];
  let total = 0;
  for (const { supp, score } of scored) {
    if (chosen.length >= maxCount) break;
    if (score < 2) continue;
    if (total + supp.monthlyCost > cap) continue;
    chosen.push({ id: supp.id, name: supp.name, reason: supp.why });
    total += supp.monthlyCost;
  }
  if (chosen.length === 0) {
    const d3 = SUPPLEMENT_DB.find(s => s.id === "d3k2")!;
    chosen.push({ id: d3.id, name: d3.name, reason: d3.why });
    total += d3.monthlyCost;
  }

  return {
    ok: true,
    goals: Array.from(detectedGoals),
    stack: chosen,
    monthlyCost: total,
    poweredBy: "rules",
  };
}

// ─── Claude-powered generation ────────────────────────────────────────────
async function claudeGenerate(req: GenerateRequest): Promise<GenerateResponse> {
  const catalog = SUPPLEMENT_DB.map(s => ({
    id: s.id,
    name: s.name,
    purpose: s.purpose,
    evidence: s.evidence,
    monthlyCost: s.monthlyCost,
    vegan: s.vegan,
    tags: s.tags,
    warnings: s.warnings,
  }));
  const cap = BUDGET_CAP[req.budget ?? "medium"];

  const system = `You are an evidence-led supplement coach for suppdoc.io. The user describes what they want in plain English; you select 4-8 supplements from a fixed catalog that match their goals.

Rules:
1. ONLY use ids that appear in the provided catalog
2. Prioritize "very strong" and "strong" evidence over "moderate"
3. Stay within the budget cap${req.veganOnly ? "\n4. ONLY include vegan: true items" : ""}
5. Note any goals you couldn't address with confidence
6. Return ONLY valid JSON — no preamble, no markdown fences

JSON shape:
{
  "goals": ["<short tag>", "..."],
  "stack": [{"id": "<catalog id>", "name": "<exact name>", "reason": "<plain English 1 sentence why>"}],
  "notes": ["<optional caveat or recommendation>", "..."]
}`;

  const userPrompt = `User goal: "${req.text}"
Budget cap: $${cap}/month (${req.budget ?? "medium"})
Vegan only: ${req.veganOnly ? "yes" : "no"}

Catalog (use only these ids): ${JSON.stringify(catalog).slice(0, 14000)}

Return the JSON stack now.`;

  const result = await callClaude({
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 2000,
    expectJson: true,
  });

  if (!result.ok || !result.text) {
    return { ...rulesBasedGenerate(req), poweredBy: "rules", error: result.error };
  }

  const parsed = safeParseJson<{
    goals?: string[];
    stack?: { id: string; name: string; reason: string }[];
    notes?: string[];
  }>(result.text);

  if (!parsed || !Array.isArray(parsed.stack)) {
    return { ...rulesBasedGenerate(req), poweredBy: "rules", error: "Claude returned invalid shape" };
  }

  // Validate ids exist
  const validStack = parsed.stack.filter(item => SUPPLEMENT_DB.some(s => s.id === item.id));
  const total = validStack.reduce((sum, item) => {
    const s = SUPPLEMENT_DB.find(s => s.id === item.id);
    return sum + (s?.monthlyCost ?? 0);
  }, 0);

  return {
    ok: true,
    goals: parsed.goals ?? [],
    stack: validStack,
    monthlyCost: total,
    poweredBy: "claude",
    notes: parsed.notes,
  };
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json", goals: [], stack: [], monthlyCost: 0, poweredBy: "rules" } satisfies GenerateResponse, { status: 400 });
  }
  const text = (body?.text ?? "").trim();
  if (!text || text.length < 5) {
    return Response.json({ ok: false, error: "describe your goals (5+ chars)", goals: [], stack: [], monthlyCost: 0, poweredBy: "rules" } satisfies GenerateResponse, { status: 400 });
  }
  if (text.length > 2000) {
    return Response.json({ ok: false, error: "too long (max 2000 chars)", goals: [], stack: [], monthlyCost: 0, poweredBy: "rules" } satisfies GenerateResponse, { status: 400 });
  }

  const result = anthropicEnabled() ? await claudeGenerate(body) : rulesBasedGenerate(body);
  return Response.json(result);
}
