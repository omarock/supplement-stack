import { NextRequest } from "next/server";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import { callClaude, anthropicEnabled, safeParseJson } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AuditRequest {
  // Free-form text the user pasted (e.g. "Magnesium glycinate 400mg, vit D 5000, omega 3 1g, ashwagandha 600mg")
  text: string;
  // Optional pasted lab/bloodwork values (e.g. "Vitamin D 22 ng/mL, Ferritin 180, B12 350"),
  // cross-referenced against the stack for a deeper audit.
  bloodwork?: string;
}

export interface AuditFinding {
  kind: "warning" | "redundant" | "missing" | "timing" | "cost" | "info";
  title: string;
  detail: string;
  affects?: string[]; // supplement IDs or names
}

export interface AuditResponse {
  ok: boolean;
  score: number; // 0-100 optimization score
  detected: { id?: string; name: string; matched?: boolean }[];
  findings: AuditFinding[];
  monthlyCostEstimate?: number;
  suggestedStack?: { id: string; name: string; reason: string }[];
  poweredBy: "claude" | "rules";
  error?: string;
}

// ─── Detect supplements in free-form text ──────────────────────────────────
function detect(text: string): { id?: string; name: string; matched?: boolean }[] {
  const lower = text.toLowerCase();
  const found: { id?: string; name: string; matched?: boolean }[] = [];
  const seen = new Set<string>();

  for (const s of SUPPLEMENT_DB) {
    // Match by id, by canonical name, or by main ingredient keyword
    const candidates: string[] = [s.id, s.name.split(" (")[0]];
    // Also match common short names (split on "/" and ",")
    const shortName = s.name.split(/[(,/]/)[0].trim();
    if (!candidates.includes(shortName)) candidates.push(shortName);

    for (const c of candidates) {
      const needle = c.toLowerCase();
      if (needle.length < 3) continue;
      if (lower.includes(needle) && !seen.has(s.id)) {
        found.push({ id: s.id, name: s.name, matched: true });
        seen.add(s.id);
        break;
      }
    }
  }

  // Capture unmatched mentions, words that look like supplement names but aren't in our DB
  const tokens = text.split(/[,\n;]+/).map(t => t.trim()).filter(Boolean);
  for (const t of tokens) {
    const looksLikeSupplement = /\b(mg|mcg|iu|g)\b|\bvitamin|mineral|extract|oil|capsule|tablet/i.test(t);
    if (looksLikeSupplement) {
      // Strip dosing to get just the name
      const cleaned = t.replace(/\d+(?:\.\d+)?\s*(mg|mcg|iu|g)\b/gi, "").replace(/[(),.]/g, " ").trim();
      if (cleaned.length > 2) {
        const lowerName = cleaned.toLowerCase();
        const alreadyMatched = found.some(f => lowerName.includes(f.name.toLowerCase().slice(0, 6)));
        if (!alreadyMatched && !seen.has("unmatched:" + lowerName)) {
          found.push({ name: cleaned, matched: false });
          seen.add("unmatched:" + lowerName);
        }
      }
    }
  }

  return found;
}

// ─── Rules-based audit (used when ANTHROPIC_API_KEY is missing) ──────────
function rulesBasedAudit(text: string): AuditResponse {
  const detected = detect(text);
  const matched = detected.filter(d => d.matched && d.id);
  const ids = new Set(matched.map(d => d.id!));
  const supps = matched.map(d => SUPPLEMENT_DB.find(s => s.id === d.id)!).filter(Boolean);
  const findings: AuditFinding[] = [];

  //, Interactions / overlaps
  if (ids.has("omega3") && ids.has("omega3-algae")) {
    findings.push({
      kind: "redundant",
      title: "Two omega-3 sources",
      detail: "You're taking both fish-oil and algae omega-3, they overlap. Pick one (fish for cost, algae if vegan/fish-allergic).",
      affects: ["omega3", "omega3-algae"],
    });
  }
  if (ids.has("coq10") && ids.has("ubiquinol")) {
    findings.push({
      kind: "redundant",
      title: "CoQ10 + Ubiquinol",
      detail: "CoQ10 and Ubiquinol are the same nutrient (oxidized vs reduced). Pick one, ubiquinol for adults 40+, regular CoQ10 if younger.",
      affects: ["coq10", "ubiquinol"],
    });
  }
  const magCount = supps.filter(s => s.id.startsWith("mag-")).length;
  if (magCount >= 3) {
    findings.push({
      kind: "redundant",
      title: `${magCount} magnesium forms`,
      detail: "Most people only need one form: glycinate for sleep/stress, threonate for cognition, citrate for digestion. Three is overkill.",
    });
  }
  if (ids.has("5-htp") && ids.has("tryptophan")) {
    findings.push({
      kind: "warning",
      title: "5-HTP + L-Tryptophan",
      detail: "Both raise serotonin via different points in the pathway. Combining is rarely needed and can be excessive, drop one.",
      affects: ["5-htp", "tryptophan"],
    });
  }
  if (ids.has("ashwagandha") && ids.has("rhodiola") && ids.has("panax-ginseng")) {
    findings.push({
      kind: "redundant",
      title: "Multiple stimulating adaptogens",
      detail: "Rhodiola and Panax ginseng are both energising; stacking 3+ adaptogens dilutes the effect of each. Pick 2.",
    });
  }
  if (ids.has("iron") && ids.has("calcium")) {
    findings.push({
      kind: "timing",
      title: "Iron + calcium timing",
      detail: "Calcium blocks iron absorption by ~50%. Take them at least 2 hours apart, iron on empty stomach (with vitamin C), calcium with dinner.",
      affects: ["iron", "calcium"],
    });
  }
  if ((ids.has("nmn") || ids.has("nr")) && !ids.has("tmg") && !ids.has("b-complex") && !ids.has("methylfolate")) {
    findings.push({
      kind: "missing",
      title: "NAD+ precursor without a methyl donor",
      detail: "NMN/NR consume methyl groups during NAD+ synthesis. Pair with TMG (1 g) or B-complex to prevent depletion.",
    });
  }
  if (ids.has("d3k2") || ids.has("vit-d") || /vitamin d/i.test(text)) {
    if (!ids.has("vit-k2") && !ids.has("d3k2")) {
      findings.push({
        kind: "warning",
        title: "Vitamin D without K2",
        detail: "Supplemental D3 raises calcium absorption. Without K2, calcium can deposit in arteries instead of bones. Add 90-180 mcg K2 MK-7 daily.",
      });
    }
  }
  //, Missing foundational
  const hasOmega = ids.has("omega3") || ids.has("omega3-algae") || ids.has("dha-prenatal");
  const hasD3 = ids.has("d3k2") || /vitamin d/i.test(text);
  const hasMag = supps.some(s => s.id.startsWith("mag-"));
  if (!hasOmega && supps.length > 2) {
    findings.push({
      kind: "missing",
      title: "No omega-3",
      detail: "Omega-3 (EPA/DHA) is the single best-evidenced cardiovascular and anti-inflammatory supplement. Consider 1-2 g/day.",
    });
  }
  if (!hasD3 && supps.length > 2) {
    findings.push({
      kind: "missing",
      title: "No vitamin D",
      detail: "Roughly 40% of adults are deficient. Test once, then 2000-5000 IU/day depending on baseline.",
    });
  }
  if (!hasMag && supps.length > 3) {
    findings.push({
      kind: "missing",
      title: "No magnesium",
      detail: "50%+ of adults don't meet the RDA. Glycinate (300 mg) at night is the gentlest, sleep-supporting option.",
    });
  }
  //, Stack sprawl
  if (supps.length > 10) {
    findings.push({
      kind: "info",
      title: `${supps.length} supplements is a lot`,
      detail: "Well-designed stacks usually stay under 10. Each addition raises interaction risk and adherence cost. Consider trimming.",
    });
  }
  //, Cost analysis
  const monthlyCost = supps.reduce((sum, s) => sum + s.monthlyCost, 0);
  if (monthlyCost > 200) {
    findings.push({
      kind: "cost",
      title: `Stack costs ~$${monthlyCost}/mo`,
      detail: "That's an expensive stack. The 80/20 rule applies: D3+omega-3+magnesium+creatine deliver most of the benefit for under $40/mo.",
    });
  }

  //, Score
  let score = 100;
  for (const f of findings) {
    if (f.kind === "warning") score -= 15;
    else if (f.kind === "redundant") score -= 10;
    else if (f.kind === "missing") score -= 8;
    else if (f.kind === "timing") score -= 5;
    else if (f.kind === "cost") score -= 5;
  }
  score = Math.max(35, score);

  //, Suggested foundational stack
  const suggestedIds = ["d3k2", "omega3", "mag-glycinate", "creatine"].filter(id => !ids.has(id));
  const suggestedStack = suggestedIds
    .map(id => SUPPLEMENT_DB.find(s => s.id === id))
    .filter((s): s is Supplement => Boolean(s))
    .map(s => ({ id: s.id, name: s.name, reason: s.why }));

  return {
    ok: true,
    score,
    detected,
    findings,
    monthlyCostEstimate: monthlyCost > 0 ? monthlyCost : undefined,
    suggestedStack: suggestedStack.length > 0 ? suggestedStack : undefined,
    poweredBy: "rules",
  };
}

// ─── Claude-powered audit (preferred when API key is set) ────────────────
async function claudeAudit(text: string, bloodwork?: string): Promise<AuditResponse> {
  const detected = detect(text);
  const knownIds = detected.filter(d => d.matched).map(d => d.id);

  // Give Claude the library catalog (id + name + tags) to ground its analysis
  const catalog = SUPPLEMENT_DB.map(s => ({
    id: s.id,
    name: s.name,
    purpose: s.purpose,
    warnings: s.warnings,
    tags: s.tags,
  }));

  const system = `You are an evidence-led supplement coach for suppdoc.io. You analyze a user's current supplement stack and return a structured JSON audit. You are educational, not medical. Always note when a clinician should be involved (pregnancy, blood thinners, autoimmune, thyroid meds).

You MUST return valid JSON only, no preamble, no markdown fences. The JSON shape is:
{
  "score": <number 0-100>,
  "findings": [
    {"kind": "warning"|"redundant"|"missing"|"timing"|"cost"|"info", "title": "<short>", "detail": "<plain English 1-2 sentences>", "affects": ["<supp id or name>"]}
  ],
  "suggestedStack": [{"id": "<id from catalog>", "name": "<name>", "reason": "<why add>"}]
}

Score rubric:
- 100 = optimal, no issues
- 85-95 = minor improvements possible (timing, missing one foundational)
- 65-84 = several real issues (redundancies, missing key foundationals)
- 35-64 = significant issues (drug interactions, dangerous combinations)
- Below 35 = stop and see a clinician

If the user also pastes recent lab/bloodwork results, CROSS-REFERENCE them with the stack:
- Flag (kind "warning") any supplement that conflicts with a lab value, e.g. iron when ferritin is already high, vitamin A or D when levels are high, potassium with high serum potassium.
- Add (kind "missing") clear deficiencies the labs reveal that the stack doesn't address, e.g. low vitamin D, low B12, low ferritin, low magnesium.
- Always name the specific marker and value in the finding detail. Labs are context, not a diagnosis, recommend confirming with a clinician.

Be honest. Don't pad with fake positives. If the user has a great stack, say so.`;

  const userPrompt = `My current stack:
${text}
${bloodwork ? `\nMy recent lab/bloodwork results:\n${bloodwork}\n(Cross-reference these against my stack.)\n` : ""}
Detected supplements (matched to your catalog): ${JSON.stringify(knownIds)}

Catalog of known supplements (use these ids in suggestedStack): ${JSON.stringify(catalog).slice(0, 12000)}

Return the JSON audit now.`;

  const result = await callClaude({
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 2000,
    expectJson: true,
  });

  if (!result.ok || !result.text) {
    return { ...rulesBasedAudit(text), poweredBy: "rules", error: result.error };
  }

  const parsed = safeParseJson<{
    score: number;
    findings: AuditFinding[];
    suggestedStack?: { id: string; name: string; reason: string }[];
  }>(result.text);

  if (!parsed) {
    return { ...rulesBasedAudit(text), poweredBy: "rules", error: "Claude returned unparseable JSON" };
  }

  const matched = detected.filter(d => d.matched && d.id);
  const supps = matched.map(d => SUPPLEMENT_DB.find(s => s.id === d.id)!).filter(Boolean);
  const monthlyCost = supps.reduce((sum, s) => sum + s.monthlyCost, 0);

  return {
    ok: true,
    score: clamp(0, 100, parsed.score ?? 75),
    detected,
    findings: parsed.findings ?? [],
    monthlyCostEstimate: monthlyCost > 0 ? monthlyCost : undefined,
    suggestedStack: parsed.suggestedStack,
    poweredBy: "claude",
  };
}

function clamp(min: number, max: number, n: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: NextRequest) {
  let body: AuditRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, score: 0, detected: [], findings: [], poweredBy: "rules", error: "invalid json" } satisfies AuditResponse, { status: 400 });
  }
  const text = (body?.text ?? "").trim();
  if (!text) {
    return Response.json({ ok: false, score: 0, detected: [], findings: [], poweredBy: "rules", error: "no stack provided" } satisfies AuditResponse, { status: 400 });
  }
  if (text.length > 4000) {
    return Response.json({ ok: false, score: 0, detected: [], findings: [], poweredBy: "rules", error: "stack too long (max 4000 chars)" } satisfies AuditResponse, { status: 400 });
  }
  const bloodwork = (body?.bloodwork ?? "").trim().slice(0, 2000);

  const result = anthropicEnabled() ? await claudeAudit(text, bloodwork || undefined) : rulesBasedAudit(text);
  return Response.json(result);
}
