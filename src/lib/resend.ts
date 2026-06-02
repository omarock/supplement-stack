/**
 * Shared Resend sender. One implementation used by the drip cron, the tracker
 * digest, and the newsletter broadcast. Sends from hello@suppdoc.io.
 */
export async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "suppdoc.io <hello@suppdoc.io>",
        to: [to],
        subject,
        html,
        text,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `${res.status} ${body?.message ?? "unknown"}` };
    return { ok: true, id: body?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
