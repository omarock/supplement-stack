import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase, isAdminEmail } from "@/lib/supabase-admin";
import { renderNewsletter } from "@/lib/newsletter";
import { sendViaResend } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_RECIPIENTS = 800; // safety cap for a single send (validation phase)

async function adminEmail(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } });
  const { data: { user } } = await supa.auth.getUser();
  return isAdminEmail(user?.email) ? (user!.email ?? null) : null;
}

/** Subscribers = email_signups minus email_unsubscribes. */
async function recipients(): Promise<string[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const [{ data: subs }, { data: unsubs }] = await Promise.all([
    admin.from("email_signups").select("email").limit(5000),
    admin.from("email_unsubscribes").select("email").limit(5000),
  ]);
  const blocked = new Set((unsubs ?? []).map(u => String(u.email).toLowerCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of subs ?? []) {
    const e = String(r.email ?? "").trim().toLowerCase();
    if (e && e.includes("@") && !blocked.has(e) && !seen.has(e)) { seen.add(e); out.push(e); }
  }
  return out;
}

export async function GET() {
  const admin = await adminEmail();
  if (!admin) return Response.json({ ok: false, error: "not authorized" }, { status: 403 });
  const list = await recipients();
  return Response.json({ ok: true, count: list.length, adminEmail: admin });
}

export async function POST(req: NextRequest) {
  const admin = await adminEmail();
  if (!admin) return Response.json({ ok: false, error: "not authorized" }, { status: 403 });

  let body: { subject?: string; body?: string; mode?: string; testEmail?: string };
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const subject = String(body.subject ?? "").trim();
  const content = String(body.body ?? "").trim();
  if (!subject || !content) return Response.json({ ok: false, error: "subject and body are required" }, { status: 400 });

  // Recipient set: test goes only to one address; "all" goes to the live list.
  let list: string[];
  if (body.mode === "all") {
    list = (await recipients()).slice(0, MAX_RECIPIENTS);
  } else {
    const t = String(body.testEmail ?? admin).trim().toLowerCase();
    list = t.includes("@") ? [t] : [admin];
  }
  if (list.length === 0) return Response.json({ ok: true, sent: 0, failed: 0, total: 0, note: "no recipients" });

  let sent = 0, failed = 0;
  const errors: string[] = [];
  for (const email of list) {
    const { html, text } = renderNewsletter(subject, content, encodeURIComponent(email));
    const res = await sendViaResend(email, subject, html, text);
    if (res.ok) sent++; else { failed++; if (errors.length < 5) errors.push(`${email}: ${res.error}`); }
  }

  return Response.json({ ok: true, mode: body.mode === "all" ? "all" : "test", total: list.length, sent, failed, errors });
}
