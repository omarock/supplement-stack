import { NextRequest } from "next/server";
import { getAdminSupabase, adminEmails } from "@/lib/supabase-admin";
import { sendViaResend } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escHtml = (s: string) => s.replace(/[&<>"']/g, c => ESC[c]);

/**
 * Reliable lead capture. Replaces the old client-side insert that silently lost
 * leads. Stores via the SERVICE-ROLE client (bypasses RLS) AND emails the founder
 * as a backstop, so a lead is captured even if one of the two fails.
 *
 * Body: { email: string, source?: string, note?: string }
 * Returns: { ok: boolean, stored: boolean, notified: boolean }
 */
export async function POST(req: NextRequest) {
  // Public + unauthenticated, and each call writes to the DB and emails the
  // founder. Rate-limit per IP so it can't be flooded into spam / Resend cost.
  const rl = await checkRateLimit(`lead:${getClientIp(req)}`, 8);
  if (!rl.ok) {
    return Response.json({ ok: false, error: "rate_limited" }, {
      status: 429,
      headers: rl.retryAfterSec ? { "Retry-After": String(rl.retryAfterSec) } : undefined,
    });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body handled below */ }

  const email = String(body.email ?? "").trim().toLowerCase();
  const source = (typeof body.source === "string" ? body.source : "unknown").slice(0, 40);
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : null;

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // 1) Store (service role → bypasses RLS; the old client insert was blocked here).
  let stored = false;
  let storeError: string | null = null;
  const admin = getAdminSupabase();
  if (admin) {
    const { error } = await admin
      .from("email_signups")
      .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });
    if (error) storeError = error.message;
    else stored = true;
  } else {
    storeError = "db_unavailable";
  }

  // 2) Notify the founder — the backstop that guarantees the lead is never lost,
  //    even if the DB write failed. Sent to every ADMIN_EMAILS address.
  let notified = false;
  const recipients = adminEmails();
  const isFounding = source === "founding-member";
  if (recipients.length > 0) {
    const subject = isFounding
      ? `🎉 Founding-member lead: ${email}`
      : `New ${source} signup: ${email}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2 style="margin:0 0 12px">${isFounding ? "New founding-member lead" : "New signup"}</h2>
        <table style="font-size:15px;line-height:1.7">
          <tr><td style="color:#667;padding-right:12px">Email</td><td><strong>${escHtml(email)}</strong></td></tr>
          <tr><td style="color:#667;padding-right:12px">Source</td><td>${escHtml(source)}</td></tr>
          ${note ? `<tr><td style="color:#667;padding-right:12px">Note</td><td>${escHtml(note)}</td></tr>` : ""}
          <tr><td style="color:#667;padding-right:12px">Stored in DB</td><td>${stored ? "yes ✅" : `NO ⚠️ (${storeError ?? "unknown"})`}</td></tr>
        </table>
        ${isFounding ? `<p style="margin-top:16px;padding:12px 14px;background:#f0f9f3;border-radius:10px">Next: email the $79 lifetime payment link, then grant Premium in <a href="https://www.suppdoc.io/admin">/admin</a>.</p>` : ""}
        <p style="color:#999;font-size:12px;margin-top:18px">suppdoc.io lead capture</p>
      </div>`;
    const text = `${isFounding ? "New founding-member lead" : "New signup"}
Email: ${email}
Source: ${source}${note ? `\nNote: ${note}` : ""}
Stored in DB: ${stored ? "yes" : `NO (${storeError ?? "unknown"})`}`;

    const results = await Promise.all(
      recipients.map(to => sendViaResend(to, subject, html, text)),
    );
    notified = results.some(r => r.ok);
  }

  // Captured if we stored it OR emailed it to you. Only a true failure returns !ok.
  if (stored || notified) {
    return Response.json({ ok: true, stored, notified });
  }
  return Response.json(
    { ok: false, error: storeError ?? "capture_failed", stored, notified },
    { status: 500 },
  );
}
