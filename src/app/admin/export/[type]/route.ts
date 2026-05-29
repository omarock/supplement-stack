import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase, isAdminEmail } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

/**
 * GET /admin/export/{quizzes|clicks|signups}
 * Streams a CSV of the requested table, admin-only.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  // ── Auth: must be admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new NextResponse("Auth not configured", { status: 500 });

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
  });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return new NextResponse("Not signed in", { status: 401 });
  if (!isAdminEmail(user.email)) return new NextResponse("Forbidden", { status: 403 });

  const admin = getAdminSupabase();
  if (!admin) return new NextResponse("Service role missing", { status: 500 });

  // ── Fetch + serialize
  let rows: Record<string, unknown>[] = [];
  let filename = "";
  if (type === "quizzes") {
    const { data } = await admin
      .from("quiz_submissions")
      .select("id,created_at,email,user_id,age,gender,goals,diet,budget,supplement_count,total_monthly_cost")
      .order("created_at", { ascending: false })
      .limit(10000);
    rows = data ?? [];
    filename = "quizzes.csv";
  } else if (type === "clicks") {
    const { data } = await admin
      .from("link_clicks")
      .select("id,created_at,email,user_id,supplement_id,supplement_name,product_brand,product_name,iherb_url,source_page")
      .order("created_at", { ascending: false })
      .limit(10000);
    rows = data ?? [];
    filename = "clicks.csv";
  } else if (type === "signups") {
    const { data } = await admin
      .from("email_signups")
      .select("id,created_at,email,source")
      .order("created_at", { ascending: false })
      .limit(10000);
    rows = data ?? [];
    filename = "email_signups.csv";
  } else {
    return new NextResponse("Unknown export type", { status: 400 });
  }

  // ── Serialize to CSV
  if (rows.length === 0) {
    return new NextResponse("no_data\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    // Quote + escape any cell containing comma, quote, or newline
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
