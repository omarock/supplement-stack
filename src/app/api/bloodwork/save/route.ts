import { NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSessionUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST: save a parsed bloodwork report for the signed-in user.
// We store ONLY the structured results, never the original file.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  if (!Array.isArray(body.biomarkers) || typeof body.analysis !== "object") {
    return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const { error } = await admin.from("bloodwork_reports").insert({
    user_id: user.id,
    user_email: user.email,
    biomarkers: body.biomarkers,
    analysis: body.analysis,
    confidence: typeof body.confidence === "string" ? body.confidence : null,
    source_kind: typeof body.sourceKind === "string" ? body.sourceKind : null,
  });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
