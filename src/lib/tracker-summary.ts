/**
 * Weekly AI summary for the Stack Tracker.
 *
 * Shared by /api/track/summary (on-demand, shown in the dashboard) and the
 * weekly-digest cron (emailed). Uses Claude when available, with a deterministic
 * rules-based fallback so the feature always works.
 */
import { callClaude, anthropicEnabled, safeParseJson } from "@/lib/anthropic";
import {
  type Checkin,
  type TrackerEnrollment,
  computeStats,
  allTrends,
  METRIC_META,
  WELLNESS_METRICS,
} from "@/lib/tracker";

export interface TrackerSummary {
  headline: string;          // one warm, specific sentence
  insights: string[];        // 2-4 observations grounded in the data
  suggestions: string[];     // 1-3 gentle, actionable nudges
  poweredBy: "claude" | "rules";
}

// ─── Rules-based fallback ─────────────────────────────────────────────────────
export function rulesSummary(checkins: Checkin[], enrollment: TrackerEnrollment | null, today?: string): TrackerSummary {
  const stats = computeStats(checkins, enrollment, today);
  const trends = allTrends(checkins, 14, today);
  const insights: string[] = [];
  const suggestions: string[] = [];

  if (stats.currentStreak >= 2) {
    insights.push(`You're on a ${stats.currentStreak}-day check-in streak — consistency is the whole game.`);
  }
  if (stats.adherence >= 80) {
    insights.push(`You took your stack on ${stats.adherence}% of tracked days. That's the kind of consistency that lets effects actually build.`);
  } else if (stats.totalCheckins >= 3 && stats.adherence < 60) {
    suggestions.push(`Your adherence is ${stats.adherence}%. Try anchoring your stack to an existing habit — next to your toothbrush or coffee — to make it automatic.`);
  }

  const improving = trends
    .filter(t => t.deltaPct !== null && t.deltaPct >= 8 && t.samples >= 4)
    .sort((a, b) => (b.deltaPct ?? 0) - (a.deltaPct ?? 0));
  const declining = trends
    .filter(t => t.deltaPct !== null && t.deltaPct <= -8 && t.samples >= 4)
    .sort((a, b) => (a.deltaPct ?? 0) - (b.deltaPct ?? 0));

  for (const t of improving.slice(0, 2)) {
    insights.push(`${t.label} is trending up — about ${Math.abs(t.deltaPct!)}% better than the start of the window.`);
  }
  for (const t of declining.slice(0, 1)) {
    suggestions.push(`${t.label} has dipped recently. Worth noting what changed — sleep, stress, or a missed dose often shows up here first.`);
  }

  if (stats.totalCheckins < 5) {
    suggestions.push("Keep checking in daily — once you have a week of data, the trends get much more meaningful.");
  }
  if (insights.length === 0) {
    insights.push("You've started tracking — that's the hardest step. A clear picture takes about a week of daily check-ins.");
  }

  const headline = stats.currentStreak >= 3
    ? `${stats.currentStreak} days strong — here's your week.`
    : improving.length > 0
      ? `${improving[0].label} is moving in the right direction.`
      : "Your first week of tracking, summarized.";

  return { headline, insights: insights.slice(0, 4), suggestions: suggestions.slice(0, 3), poweredBy: "rules" };
}

// ─── Claude-powered summary ───────────────────────────────────────────────────
export async function generateSummary(checkins: Checkin[], enrollment: TrackerEnrollment | null, today?: string): Promise<TrackerSummary> {
  if (!anthropicEnabled() || checkins.length < 3) {
    return rulesSummary(checkins, enrollment, today);
  }

  const stats = computeStats(checkins, enrollment, today);
  const trends = allTrends(checkins, 14, today);

  const compact = {
    daysTracked: stats.totalCheckins,
    currentStreak: stats.currentStreak,
    adherencePct: stats.adherence,
    consistencyPct: stats.consistency,
    stack: enrollment?.stack_name ?? null,
    metrics: WELLNESS_METRICS.map(m => {
      const t = trends.find(x => x.metric === m)!;
      return {
        metric: m,
        higherIsBetter: METRIC_META[m].higherIsBetter,
        recentAvg: t.recentAvg,
        priorAvg: t.priorAvg,
        changePct: t.deltaPct, // already oriented so + = improvement
        samples: t.samples,
      };
    }),
    recentNotes: checkins.filter(c => c.note).slice(-5).map(c => ({ date: c.date, note: c.note })),
  };

  const system = `You are an encouraging, evidence-led wellness coach for suppdoc.io. You write a short weekly summary of a user's supplement-tracking data. You are supportive and specific, never clinical or alarmist. You are educational, not medical — never diagnose, never promise outcomes, and gently suggest a clinician for anything concerning.

Return VALID JSON ONLY (no markdown, no preamble):
{
  "headline": "<one warm, specific sentence, max ~12 words>",
  "insights": ["<2-4 observations grounded ONLY in the numbers provided>"],
  "suggestions": ["<1-3 gentle, actionable nudges>"]
}

Rules:
- Reference real numbers from the data (streak, adherence, % changes).
- 'stress' uses higherIsBetter=false, so a positive changePct already means stress IMPROVED (went down). Trust the sign.
- Never invent data. If samples are low, say the picture is still forming.
- Correlation is not causation — say "alongside" not "because of" when linking the stack to a change.
- Keep each string under ~22 words. Plain, warm English.`;

  const userPrompt = `Here is the user's tracking data for the last 14 days:\n${JSON.stringify(compact)}\n\nWrite the JSON summary now.`;

  const result = await callClaude({
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 700,
    expectJson: true,
  });

  if (!result.ok || !result.text) return rulesSummary(checkins, enrollment, today);

  const parsed = safeParseJson<{ headline?: string; insights?: string[]; suggestions?: string[] }>(result.text);
  if (!parsed || !parsed.headline) return rulesSummary(checkins, enrollment, today);

  return {
    headline: String(parsed.headline).slice(0, 140),
    insights: (parsed.insights ?? []).filter(s => typeof s === "string").slice(0, 4),
    suggestions: (parsed.suggestions ?? []).filter(s => typeof s === "string").slice(0, 3),
    poweredBy: "claude",
  };
}
