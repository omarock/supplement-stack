/**
 * Newsletter renderer. The admin writes plain text (paragraphs separated by a
 * blank line, bare URLs auto-linked); this wraps it in the branded suppdoc shell
 * with an unsubscribe footer. {{EMAIL_TOKEN}} is replaced per-recipient by the
 * send route so each unsubscribe link is unique.
 */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Plain text -> safe HTML: escape, auto-link URLs, paragraphs + line breaks. */
function textToHtml(body: string): string {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  const linkify = (line: string) =>
    escapeHtml(line).replace(/(https?:\/\/[^\s<]+)/g, url =>
      `<a href="${url}" style="color:#3f7a52;text-decoration:underline;">${url}</a>`);
  return blocks
    .map(block => {
      const inner = block.split("\n").map(linkify).join("<br>");
      return `<p style="margin:0 0 16px;color:#3c4858;font-size:15px;line-height:1.65;">${inner}</p>`;
    })
    .join("\n");
}

export interface NewsletterParts { subject: string; html: string; text: string }

/**
 * Render the full email. `emailToken` is the URL-encoded recipient email used in
 * the unsubscribe link.
 */
export function renderNewsletter(subject: string, body: string, emailToken: string): NewsletterParts {
  const bodyHtml = textToHtml(body);
  const unsub = `https://www.suppdoc.io/api/unsubscribe?e=${emailToken}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f6f5f1;font-family:Inter,-apple-system,Segoe UI,sans-serif;color:#0a2540;">
  <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
    <div style="font-weight:700;font-size:18px;letter-spacing:-0.01em;margin-bottom:22px;color:#0a2540;">
      <span style="color:#5ba373;">&#9679;</span>&nbsp;suppdoc<span style="color:#5ba373;">.io</span>
    </div>
    <div style="background:#ffffff;border:1px solid rgba(10,37,64,0.08);border-radius:18px;padding:28px 26px;">
      <h1 style="font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:600;font-size:24px;letter-spacing:-0.02em;line-height:1.2;margin:0 0 18px;color:#0a2540;">${escapeHtml(subject)}</h1>
      ${bodyHtml}
    </div>
    <div style="text-align:center;margin-top:22px;font-size:12px;color:#6b7280;line-height:1.6;">
      <p style="margin:0 0 6px;">suppdoc.io, evidence-graded supplement guidance. We don't sell supplements.</p>
      <p style="margin:0;">You're getting this because you used suppdoc.io. <a href="${unsub}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>.</p>
    </div>
  </div>
</body></html>`;

  const text = `${subject}\n\n${body.trim()}\n\n--\nsuppdoc.io, evidence-graded supplement guidance.\nUnsubscribe: ${unsub}`;
  return { subject, html, text };
}
