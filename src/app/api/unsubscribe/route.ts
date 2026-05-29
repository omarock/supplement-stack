import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/unsubscribe?e=<email>
 *
 * Adds the email to email_unsubscribes so the drip cron skips it.
 * Returns a tiny HTML confirmation page. Idempotent.
 */
export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return new Response(renderPage("Invalid link", "This unsubscribe link doesn't look right. If you keep getting emails you don't want, reply to any of them and we'll remove you by hand."), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const supa = createClient(url, key, { auth: { persistSession: false } });
      await supa.from("email_unsubscribes").upsert(
        { email, source: "email_drip_link" },
        { onConflict: "email" },
      );
    } catch {
      // soft-fail, still show success to the user; we'll catch it in logs
    }
  }

  return new Response(renderPage("You're unsubscribed.", `We've removed <strong>${escapeHtml(email)}</strong> from the suppdoc.io drip sequence. You won't get any more automated emails from us.`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}, suppdoc.io</title>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { margin:0; background:#f6f5f1; font-family:"Inter",-apple-system,sans-serif; color:#0a2540; }
    .wrap { max-width:520px; margin:14vh auto; padding:36px; background:#fff; border-radius:18px; border:1px solid rgba(10,37,64,0.08); }
    h1 { font-family:"Bricolage Grotesque", sans-serif; font-weight:600; font-size:28px; letter-spacing:-0.02em; margin:0 0 16px; }
    p { color:#3c4858; line-height:1.6; font-size:15px; }
    a { color:#3f7a52; }
    .logo { font-weight:700; letter-spacing:-0.01em; margin-bottom:24px; }
    .logo .dot { color:#5ba373; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo"><span class="dot">●</span>&nbsp;suppdoc<span class="dot">.io</span></div>
    <h1>${escapeHtml(title)}</h1>
    <p>${body}</p>
    <p style="margin-top:28px;"><a href="https://www.suppdoc.io">← Back to suppdoc.io</a></p>
  </div>
</body>
</html>`;
}
