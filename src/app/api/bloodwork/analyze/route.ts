import { NextRequest } from "next/server";
import { callClaude, anthropicEnabled, safeParseJson, type ContentBlock } from "@/lib/anthropic";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import {
  BIOMARKERS,
  findBiomarker,
  classify,
  biomarkerCatalogForPrompt,
  type BloodworkAnalysis,
  type ExtractedBiomarker,
} from "@/lib/biomarkers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Stay under Vercel's ~4.5MB request body limit (base64 inflates ~33%).
const MAX_BYTES = 3.5 * 1024 * 1024;
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface AnalyzeBody {
  mediaType?: string;     // e.g. application/pdf, image/jpeg
  dataBase64?: string;    // base64 (no data: prefix)
  text?: string;          // OR pasted lab values
  sex?: "male" | "female" | "unspecified";
}

const DISCLAIMER_FINDING = {
  title: "This is not a diagnosis",
  detail: "This analysis is educational and based only on the values you provided. Lab ranges vary by lab, age, sex, and medications. Always review results with a qualified clinician before changing anything.",
  severity: "info" as const,
};

function validSupplementId(id?: string): string | undefined {
  if (!id) return undefined;
  return SUPPLEMENT_DB.some(s => s.id === id) ? id : undefined;
}

function supplementName(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name ?? id;
}

// ─── Rules-based fallback (pasted text only) ─────────────────────────────────
function rulesAnalyze(text: string): BloodworkAnalysis {
  const lines = text.split(/[\n;]+/).map(l => l.trim()).filter(Boolean);
  const biomarkers: ExtractedBiomarker[] = [];
  const recMap = new Map<string, { name: string; reason: string; biomarker: string }>();

  for (const line of lines) {
    const def = findBiomarker(line);
    if (!def) continue;
    // Strip the marker name first so digits inside it (e.g. "B12", "B6", "HbA1c")
    // aren't mistaken for the value.
    let cleaned = line.toLowerCase();
    for (const a of def.aliases) cleaned = cleaned.split(a).join(" ");
    const numMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (!numMatch) continue;
    const value = Number(numMatch[1]);
    const status = classify(def, value);
    biomarkers.push({ key: def.key, name: def.label, value, unit: def.unit, status, category: def.category, note: def.blurb });

    const lowSide = status === "low" || status === "borderline-low";
    const highSide = status === "high" || status === "borderline-high";
    const ids = lowSide ? def.supplementsForLow : highSide ? def.supplementsForHigh : undefined;
    for (const id of ids ?? []) {
      if (!validSupplementId(id)) continue;
      if (!recMap.has(id)) recMap.set(id, { name: supplementName(id), reason: `Supports ${def.label.toLowerCase()} (${status.replace("-", " ")}).`, biomarker: def.label });
    }
  }

  const flagged = biomarkers.filter(b => ["low", "high"].includes(b.status));
  return {
    ok: true,
    biomarkers,
    summary: biomarkers.length
      ? `Recognized ${biomarkers.length} marker${biomarkers.length === 1 ? "" : "s"}${flagged.length ? `, ${flagged.length} outside the typical range` : ""}. This is a basic rule-based reading — connect an AI key for full report parsing.`
      : "We couldn't recognize specific biomarkers in the text. Try pasting lines like 'Vitamin D 22 ng/mL'.",
    findings: [DISCLAIMER_FINDING],
    recommendations: [...recMap.values()].map(r => ({ supplementId: SUPPLEMENT_DB.find(s => s.name === r.name)?.id, ...r })),
    lifestyle: [],
    seeClinicianFor: flagged.length ? flagged.map(b => `${b.name} reading of ${b.value} ${b.unit ?? ""}`.trim()) : [],
    confidence: "low",
    poweredBy: "rules",
  };
}

// ─── Claude-powered analysis ─────────────────────────────────────────────────
const SYSTEM = `You are a careful, evidence-led lab-report reader for suppdoc.io. You extract biomarkers from a blood-test report (PDF, photo, or pasted text) and produce a structured, SAFE, educational analysis. You are NOT a doctor and you NEVER diagnose.

Hard rules:
- Extract ONLY values you can actually see. Never invent or estimate a value. If a value is unreadable, omit it.
- Prefer the lab's OWN printed reference range when present; classify relative to that.
- Use calm, plain English. No alarmism. Explain what each marker means in one short sentence.
- For anything outside range, frame it as "worth discussing with your clinician," never as a diagnosis.
- Only recommend supplements from the provided catalog ids. A supplement is a nudge, not a treatment.
- ALWAYS include items in seeClinicianFor for any markedly abnormal value (e.g. glucose in diabetic range, very low ferritin, abnormal thyroid).
- If the document does not look like a blood test, set ok=false and explain.

Return VALID JSON ONLY (no markdown fences, no preamble) in EXACTLY this shape:
{
  "ok": true,
  "confidence": "high"|"medium"|"low",
  "summary": "<2-3 plain sentences>",
  "biomarkers": [
    {"key": "<catalog key or omit>", "name": "<as printed>", "value": <number or null>, "unit": "<unit or null>", "refRange": "<lab's range or null>", "status": "low"|"borderline-low"|"optimal"|"normal"|"borderline-high"|"high"|"unknown", "category": "<one of the catalog categories or omit>", "note": "<one short plain sentence>"}
  ],
  "findings": [
    {"title": "<short>", "detail": "<1-2 plain sentences>", "severity": "info"|"watch"|"flag", "biomarkers": ["<name>"]}
  ],
  "recommendations": [
    {"supplementId": "<id from catalog>", "name": "<name>", "reason": "<why, tied to a marker>", "biomarker": "<marker name>"}
  ],
  "lifestyle": ["<1-4 simple diet/sleep/exercise nudges tied to the findings>"],
  "seeClinicianFor": ["<explicit prompts to discuss with a doctor>"]
}`;

async function claudeAnalyze(body: AnalyzeBody): Promise<BloodworkAnalysis> {
  const catalogIds = BIOMARKERS.flatMap(b => [...(b.supplementsForLow ?? []), ...(b.supplementsForHigh ?? [])]);
  const uniqueIds = [...new Set(catalogIds)];
  const suppList = uniqueIds.map(id => `${id}: ${supplementName(id)}`).join("\n");

  const promptText = `Analyze this blood test.${body.sex && body.sex !== "unspecified" ? ` Patient sex: ${body.sex}.` : ""}

Known biomarker catalog (key, label, unit, and which supplement ids help when low/high):
${biomarkerCatalogForPrompt()}

Supplement ids you may recommend (use ONLY these ids):
${suppList}

Return the JSON analysis now.`;

  const content: ContentBlock[] = [];
  if (body.dataBase64 && body.mediaType) {
    if (body.mediaType === "application/pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: body.dataBase64 } });
    } else {
      content.push({ type: "image", source: { type: "base64", media_type: body.mediaType, data: body.dataBase64 } });
    }
  } else if (body.text) {
    content.push({ type: "text", text: `Pasted lab values:\n${body.text.slice(0, 8000)}` });
  }
  content.push({ type: "text", text: promptText });

  const result = await callClaude({
    system: SYSTEM,
    messages: [{ role: "user", content }],
    maxTokens: 3500,
    expectJson: true,
  });

  if (!result.ok || !result.text) {
    if (body.text) return rulesAnalyze(body.text);
    return { ok: false, biomarkers: [], summary: "", findings: [], recommendations: [], lifestyle: [], seeClinicianFor: [], confidence: "low", poweredBy: "rules", error: result.error ?? "analysis failed" };
  }

  const parsed = safeParseJson<Partial<BloodworkAnalysis>>(result.text);
  if (!parsed) {
    if (body.text) return rulesAnalyze(body.text);
    return { ok: false, biomarkers: [], summary: "", findings: [], recommendations: [], lifestyle: [], seeClinicianFor: [], confidence: "low", poweredBy: "claude", error: "Couldn't parse the analysis. Try a clearer photo or paste the values as text." };
  }

  if (parsed.ok === false) {
    return { ok: false, biomarkers: [], summary: parsed.summary ?? "That doesn't look like a blood test report.", findings: parsed.findings ?? [], recommendations: [], lifestyle: [], seeClinicianFor: [], confidence: "low", poweredBy: "claude", error: parsed.summary ?? "not a blood test" };
  }

  // Sanitize recommendations to real catalog ids
  const recommendations = (parsed.recommendations ?? [])
    .map(r => ({ ...r, supplementId: validSupplementId(r.supplementId) }))
    .filter(r => r.name || r.supplementId)
    .map(r => ({ ...r, name: r.supplementId ? supplementName(r.supplementId) : r.name }));

  const findings = parsed.findings ?? [];
  // Always append the not-a-diagnosis note (de-duped)
  if (!findings.some(f => /not.*diagnos/i.test(f.title))) findings.push(DISCLAIMER_FINDING);

  return {
    ok: true,
    biomarkers: parsed.biomarkers ?? [],
    summary: parsed.summary ?? "",
    findings,
    recommendations,
    lifestyle: parsed.lifestyle ?? [],
    seeClinicianFor: parsed.seeClinicianFor ?? [],
    confidence: parsed.confidence ?? "medium",
    poweredBy: "claude",
  };
}

export async function POST(req: NextRequest) {
  let body: AnalyzeBody;
  try { body = await req.json(); } catch {
    return Response.json({ ok: false, error: "invalid_json" } satisfies Partial<BloodworkAnalysis>, { status: 400 });
  }

  const hasFile = Boolean(body.dataBase64 && body.mediaType);
  const hasText = Boolean(body.text && body.text.trim().length > 3);
  if (!hasFile && !hasText) {
    return Response.json({ ok: false, error: "Upload a lab report or paste your values." }, { status: 400 });
  }

  if (hasFile) {
    const mt = body.mediaType!;
    if (mt !== "application/pdf" && !ALLOWED_IMAGE.includes(mt)) {
      return Response.json({ ok: false, error: "Unsupported file type. Upload a PDF or a photo (JPG/PNG)." }, { status: 400 });
    }
    // Approximate decoded byte size from base64 length
    const approxBytes = Math.floor((body.dataBase64!.length * 3) / 4);
    if (approxBytes > MAX_BYTES) {
      return Response.json({ ok: false, error: "File is too large (max ~3.5 MB). Try a photo of just the results page, or paste the values as text." }, { status: 413 });
    }
  }

  if (!anthropicEnabled()) {
    if (hasText) return Response.json(rulesAnalyze(body.text!));
    return Response.json({ ok: false, error: "AI analysis isn't available right now. You can paste your values as text instead." }, { status: 503 });
  }

  const analysis = await claudeAnalyze(body);
  return Response.json(analysis);
}
