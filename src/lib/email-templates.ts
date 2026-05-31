/**
 * Email drip templates for suppdoc.io.
 * Each template returns { subject, html, text } so the cron route can send via Resend.
 *
 * Designed for maximum email-client compatibility:
 *  - Inline styles only (no <style> blocks)
 *  - Tables for layout (not flex/grid)
 *  - Web-safe fonts with display fallback
 *  - 600px max-width
 */

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

const BASE = "https://www.suppdoc.io";

// Common building blocks ---------------------------------------------------
function wrap(body: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>suppdoc.io</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0a2540;">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f5f1;">
    <tr><td align="center" style="padding:24px 14px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(10,37,64,0.08);">
        <tr><td style="padding:36px 36px 0;">
          <a href="${BASE}" style="text-decoration:none;color:#0a2540;font-weight:700;font-size:18px;letter-spacing:-0.01em;">
            <span style="color:#5ba373;">●</span>&nbsp;suppdoc<span style="color:#5ba373;">.io</span>
          </a>
        </td></tr>
        ${body}
        <tr><td style="padding:24px 36px 32px;border-top:1px solid rgba(10,37,64,0.08);font-size:12px;line-height:1.5;color:#6b7280;">
          You&apos;re receiving this because you took the suppdoc.io quiz. We send at most 4 short emails total over the first two weeks, then we stop.
          <br><br>
          <a href="${BASE}/api/unsubscribe?e={{EMAIL_TOKEN}}" style="color:#3f7a52;text-decoration:underline;">Unsubscribe</a>
          &nbsp;·&nbsp;
          <a href="${BASE}/privacy" style="color:#3f7a52;text-decoration:underline;">Privacy</a>
          &nbsp;·&nbsp;
          suppdoc.io · Educational use only, not medical advice.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function button(label: string, href: string, color = "#0a2540"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${color}" style="border-radius:999px;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:999px;">${label} →</a>
  </td></tr></table>`;
}

function row(html: string, padding = "24px 36px"): string {
  return `<tr><td style="padding:${padding};">${html}</td></tr>`;
}

// ── WELCOME (sent within 24h of quiz completion) ─────────────────────────
export function welcomeEmail(firstName?: string): EmailPayload {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hey there,";
  const html = wrap(
    [
      row(`
        <h1 style="font-size:32px;line-height:1.1;letter-spacing:-0.02em;margin:0 0 18px;color:#0a2540;">
          Your stack is ready to live in.
        </h1>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 16px;">
          ${greeting}<br><br>
          Thanks for trusting us with your supplement plan. Your personalised stack is saved at <a href="${BASE}/results" style="color:#3f7a52;">suppdoc.io/results</a>, bookmark it and revisit any time.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 24px;">
          A few things to know before you start:
        </p>
        <ul style="font-size:15px;line-height:1.65;color:#3c4858;padding-left:20px;margin:0 0 28px;">
          <li><strong>Take it slow.</strong> Add one supplement at a time over 2-3 weeks so you can tell what&apos;s working.</li>
          <li><strong>Be consistent.</strong> Effects build over 4-8 weeks for most ingredients.</li>
          <li><strong>Talk to a clinician</strong> if you have any health conditions or take prescription meds. We&apos;re educational, not medical.</li>
        </ul>
        ${button("Open my stack", `${BASE}/results`)}
      `),
      row(`
        <div style="background:#f6f5f1;border-radius:12px;padding:20px;font-size:14px;line-height:1.6;color:#3c4858;">
          <strong style="color:#0a2540;">Quick win for day one:</strong> Take your vitamin D with a meal containing fat (eggs, avocado, olive oil). It&apos;s fat-soluble, without fat, absorption drops by half.
        </div>
      `),
    ].join(""),
    "Your personalised stack is saved. Here's how to get the most out of it.",
  );
  const text = `${greeting}

Your suppdoc.io stack is ready at ${BASE}/results, bookmark it.

A few things before you start:
• Take it slow, add one supplement at a time over 2-3 weeks
• Be consistent, effects build over 4-8 weeks
• Talk to a clinician if you have any conditions or take prescription meds

Quick win: Take vitamin D with a meal containing fat (eggs, avocado, olive oil). Without fat, absorption drops by half.

The suppdoc.io team
${BASE}`;
  return {
    subject: "Your suppdoc.io stack is saved, here's how to start",
    html,
    text,
  };
}

// ── DAY 3, Check-in ───────────────────────────────────────────────────────
export function day3Email(): EmailPayload {
  const html = wrap(
    [
      row(`
        <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.02em;margin:0 0 18px;color:#0a2540;">
          How is day 3 feeling?
        </h1>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 18px;">
          Some ingredients work fast (L-theanine, magnesium glycinate, GABA), you may already feel calmer evenings or better sleep onset.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 28px;">
          Others, like vitamin D, omega-3, and most adaptogens, take 4-8 weeks to fully show up in your blood markers and mood. Don&apos;t lose patience yet.
        </p>
        ${button("Re-open my stack", `${BASE}/results`)}
      `),
      row(`
        <h2 style="font-size:20px;line-height:1.25;margin:0 0 14px;color:#0a2540;">Two common questions on day 3:</h2>
        <p style="font-size:15px;line-height:1.6;color:#3c4858;margin:0 0 14px;">
          <strong>&ldquo;I feel nothing yet.&rdquo;</strong> Normal. Most foundational supplements (D3, omega-3, B-complex) build up over weeks. Sleep + stress supplements act faster.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#3c4858;margin:0 0 0;">
          <strong>&ldquo;Should I take everything at once?&rdquo;</strong> No. Start with 1-2, hold for a week, add the next. Easier to spot what helps and what doesn&apos;t agree with you.
        </p>
      `),
    ].join(""),
    "Quick check-in on day 3, what to expect, and what's normal.",
  );
  const text = `How is day 3 feeling?

Fast-acting: L-theanine, magnesium glycinate, GABA, you may already feel calmer evenings or better sleep onset.

Slow-acting: Vitamin D, omega-3, and most adaptogens, 4-8 weeks before you fully feel the difference.

Common questions:
• "I feel nothing yet." Normal. Most foundational supplements build up over weeks.
• "Should I take everything at once?" No, start with 1-2, hold a week, add the next.

Re-open your stack: ${BASE}/results

The suppdoc.io team`;
  return {
    subject: "Day 3 check-in: what to expect from your stack",
    html,
    text,
  };
}

// ── DAY 7, One week ────────────────────────────────────────────────────────
export function day7Email(): EmailPayload {
  const html = wrap(
    [
      row(`
        <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.02em;margin:0 0 18px;color:#0a2540;">
          You&apos;ve been on it a week. Here&apos;s what to track.
        </h1>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 24px;">
          One week in, the things to notice are subtle. They&apos;re usually not dramatic shifts, they&apos;re the absence of small daily frustrations.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:14px;color:#3c4858;margin:0 0 28px;">
          <tr><td style="padding:10px 14px;background:#f6f5f1;border-radius:10px 10px 0 0;border-bottom:1px solid rgba(10,37,64,0.08);">
            <strong style="color:#0a2540;">Sleep</strong>, How easily did you fall asleep most nights? Did you wake at 3am as often?
          </td></tr>
          <tr><td style="padding:10px 14px;background:#f6f5f1;border-bottom:1px solid rgba(10,37,64,0.08);">
            <strong style="color:#0a2540;">Afternoon energy</strong>, Did the 3pm crash come less hard?
          </td></tr>
          <tr><td style="padding:10px 14px;background:#f6f5f1;border-bottom:1px solid rgba(10,37,64,0.08);">
            <strong style="color:#0a2540;">Stress</strong>, Did small triggers feel a little less sharp?
          </td></tr>
          <tr><td style="padding:10px 14px;background:#f6f5f1;border-radius:0 0 10px 10px;">
            <strong style="color:#0a2540;">Digestion</strong>, Less bloating, more regular?
          </td></tr>
        </table>
        ${button("Take the quiz again to compare", `${BASE}/quiz`)}
      `),
      row(`
        <h2 style="font-size:20px;line-height:1.25;margin:0 0 14px;color:#0a2540;">Side effects?</h2>
        <p style="font-size:15px;line-height:1.6;color:#3c4858;margin:0;">
          Most supplements have a 1-2 week settling period. If something doesn&apos;t agree with you, vivid dreams (5-HTP), loose stools (high-dose magnesium), morning grogginess (melatonin), stop that ingredient first, observe for 3-4 days, then resume the others. There&apos;s nothing wrong with adjusting your stack.
        </p>
      `),
    ].join(""),
    "One week in, here's what to notice and how to think about side effects.",
  );
  const text = `You've been on it a week. Here's what to track.

One week in, look for subtle wins, not dramatic shifts:
• Sleep, falling asleep easier, fewer 3am wakings?
• Afternoon energy, softer 3pm crash?
• Stress, small triggers less sharp?
• Digestion, less bloating, more regular?

Side effects?
Most supplements have a 1-2 week settling period. If something doesn't agree with you (vivid dreams from 5-HTP, loose stools from too much magnesium, morning grogginess from melatonin), stop that one, observe 3-4 days, then resume the rest.

Re-take the quiz to compare: ${BASE}/quiz

The suppdoc.io team`;
  return {
    subject: "One week in, what to look for, and what's normal",
    html,
    text,
  };
}

// ── DAY 14, Two-week reflection ────────────────────────────────────────────
export function day14Email(): EmailPayload {
  const html = wrap(
    [
      row(`
        <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.02em;margin:0 0 18px;color:#0a2540;">
          Two weeks. Time for an honest review.
        </h1>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 22px;">
          You&apos;re at the point where some effects are real and some are still building. Now is the moment to keep what&apos;s working and prune what isn&apos;t.
        </p>
        <h2 style="font-size:18px;line-height:1.3;margin:0 0 10px;color:#0a2540;">A simple 3-question audit:</h2>
        <ol style="font-size:15px;line-height:1.7;color:#3c4858;padding-left:20px;margin:0 0 22px;">
          <li><strong>What clearly improved?</strong> Keep those ingredients on. Pat yourself on the back.</li>
          <li><strong>What feels unchanged?</strong> If it&apos;s a slow-acting one (D3, omega-3, adaptogens), give it 6-8 more weeks. If it&apos;s fast-acting (theanine, magnesium, GABA), it&apos;s probably not for you, drop it.</li>
          <li><strong>What feels worse?</strong> Stop, observe a week, and consider whether to swap a different form (e.g. magnesium glycinate for magnesium citrate).</li>
        </ol>
        ${button("Compare with a fresh quiz", `${BASE}/quiz`, "#5ba373")}
      `),
      row(`
        <h2 style="font-size:18px;line-height:1.3;margin:0 0 12px;color:#0a2540;">If you&apos;re ready to go deeper:</h2>
        <p style="font-size:15px;line-height:1.6;color:#3c4858;margin:0 0 14px;">
          Browse the <a href="${BASE}/stacks" style="color:#3f7a52;">15 pre-made stacks</a> to see if a goal-specific protocol fits better than your current mix. Or try the new <a href="${BASE}/build" style="color:#3f7a52;">custom builder</a> to design your stack from 150+ ingredients with live wellness preview.
        </p>
        <p style="font-size:14px;line-height:1.55;color:#6b7280;margin:0;">
          This is the last automated email we&apos;ll send you. After this, we only write when something is genuinely worth your attention.
        </p>
      `),
    ].join(""),
    "Two-week honest review, keep what's working, prune what isn't.",
  );
  const text = `Two weeks. Time for an honest review.

A simple 3-question audit:
1. What clearly improved? Keep those ingredients on.
2. What feels unchanged? If slow-acting (D3, omega-3, adaptogens), give it 6-8 more weeks. If fast-acting (theanine, magnesium, GABA) and you feel nothing, drop it.
3. What feels worse? Stop, observe a week, consider a different form.

If you're ready to go deeper:
• Browse the 15 pre-made stacks: ${BASE}/stacks
• Try the custom builder (150+ ingredients): ${BASE}/build
• Or re-take the quiz: ${BASE}/quiz

This is the last automated email we'll send. We only write again if it's genuinely worth your attention.

The suppdoc.io team`;
  return {
    subject: "Your 2-week review, keep what's working, prune what isn't",
    html,
    text,
  };
}

// ── WEEKLY TRACKER DIGEST ───────────────────────────────────────────────────
export interface WeeklyDigestData {
  firstName?: string;
  headline: string;
  insights: string[];
  suggestions: string[];
  streak: number;
  adherence: number;     // 0-100
  daysTracked: number;   // in the last 7
}

export function weeklyDigestEmail(d: WeeklyDigestData): EmailPayload {
  const greeting = d.firstName ? `Hi ${escapeHtml(d.firstName)},` : "Hey there,";
  const insightsHtml = d.insights.length
    ? `<ul style="font-size:15px;line-height:1.65;color:#3c4858;padding-left:20px;margin:0 0 22px;">
        ${d.insights.map(i => `<li style="margin-bottom:8px;">${escapeHtml(i)}</li>`).join("")}
       </ul>`
    : "";
  const suggestionsHtml = d.suggestions.length
    ? `<div style="background:#f6f5f1;border-radius:12px;padding:18px 20px;margin:0 0 8px;">
        <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#3f7a52;font-weight:700;margin-bottom:10px;">Try this week</div>
        ${d.suggestions.map(s => `<p style="font-size:14px;line-height:1.55;color:#3c4858;margin:0 0 8px;">→ ${escapeHtml(s)}</p>`).join("")}
       </div>`
    : "";

  const html = wrap(
    [
      row(`
        <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#5ba373;font-weight:700;margin-bottom:10px;">Your week in review</div>
        <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.02em;margin:0 0 18px;color:#0a2540;">
          ${escapeHtml(d.headline)}
        </h1>
        <p style="font-size:16px;line-height:1.6;color:#3c4858;margin:0 0 20px;">${greeting}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
          <tr>
            <td align="center" style="padding:14px;background:#fff7ed;border-radius:12px;width:33%;">
              <div style="font-size:30px;font-weight:700;color:#b5751e;line-height:1;">${d.streak}🔥</div>
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Day streak</div>
            </td>
            <td style="width:8px;"></td>
            <td align="center" style="padding:14px;background:#f0f9f3;border-radius:12px;width:33%;">
              <div style="font-size:30px;font-weight:700;color:#3f7a52;line-height:1;">${d.adherence}%</div>
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Adherence</div>
            </td>
            <td style="width:8px;"></td>
            <td align="center" style="padding:14px;background:#f6f5f1;border-radius:12px;width:33%;">
              <div style="font-size:30px;font-weight:700;color:#0a2540;line-height:1;">${d.daysTracked}</div>
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Days logged</div>
            </td>
          </tr>
        </table>
        ${insightsHtml}
        ${suggestionsHtml}
      `),
      row(`${button("Open my tracker", `${BASE}/track`, "#5ba373")}`),
    ].join(""),
    `${d.headline}, your weekly suppdoc.io tracker summary.`,
  );

  const text = `${greeting}

${d.headline}

This week: ${d.streak}-day streak · ${d.adherence}% adherence · ${d.daysTracked} days logged.

${d.insights.map(i => `• ${i}`).join("\n")}

${d.suggestions.length ? "Try this week:\n" + d.suggestions.map(s => `→ ${s}`).join("\n") + "\n\n" : ""}Open your tracker: ${BASE}/track

The suppdoc.io team`;

  return { subject: `Your week: ${d.streak}-day streak, ${d.adherence}% adherence`, html, text };
}

// ── Stage selector ────────────────────────────────────────────────────────
export type DripStage = "welcome" | "day3" | "day7" | "day14";

export function emailForStage(stage: DripStage, firstName?: string): EmailPayload {
  switch (stage) {
    case "welcome": return welcomeEmail(firstName);
    case "day3":    return day3Email();
    case "day7":    return day7Email();
    case "day14":   return day14Email();
  }
}
