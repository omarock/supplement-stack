/**
 * Stack Tracker — shared types + analytics.
 *
 * Pure functions only (no React, no Supabase) so they can run identically in
 * the browser, in API routes, and in the weekly-digest cron.
 *
 * Date convention: every check-in is keyed by a calendar date string "YYYY-MM-DD"
 * in the *user's local day*. The client computes "today" locally and sends it,
 * so a check-in at 11pm in Casablanca lands on the right day regardless of UTC.
 */

export const WELLNESS_METRICS = ["energy", "focus", "sleep", "mood", "stress"] as const;
export type WellnessMetric = (typeof WELLNESS_METRICS)[number];

export interface Checkin {
  date: string; // YYYY-MM-DD
  took_stack: boolean;
  energy: number | null;
  focus: number | null;
  sleep: number | null;
  mood: number | null;
  stress: number | null;
  note: string | null;
}

export interface TrackerEnrollment {
  stack_name: string | null;
  stack_ids: string[] | null;
  reminder_opt_in: boolean;
  weekly_digest_opt_in: boolean;
  started_at: string;
}

// Display metadata for each metric (label, hue, and whether higher = better).
// Stress is inverted: a *lower* stress score is the good direction.
export const METRIC_META: Record<WellnessMetric, { label: string; hue: string; higherIsBetter: boolean }> = {
  energy: { label: "Energy", hue: "#e8a04a", higherIsBetter: true },
  focus:  { label: "Focus",  hue: "#5ba373", higherIsBetter: true },
  sleep:  { label: "Sleep",  hue: "#a78bfa", higherIsBetter: true },
  mood:   { label: "Mood",   hue: "#ff8b6b", higherIsBetter: true },
  stress: { label: "Stress", hue: "#6b7280", higherIsBetter: false },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Local calendar date as YYYY-MM-DD (NOT UTC — uses the runtime's local day). */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key into a Date at local midnight. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole calendar days between two date keys (b - a). */
export function daysBetweenKeys(a: string, b: string): number {
  const da = parseDateKey(a).getTime();
  const db = parseDateKey(b).getTime();
  return Math.round((db - da) / 86_400_000);
}

/** Returns the last `n` date keys ending today (oldest first). */
export function lastNDateKeys(n: number, today: string = localDateKey()): string[] {
  const base = parseDateKey(today);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(localDateKey(d));
  }
  return out;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TrackerStats {
  currentStreak: number;    // consecutive days with a check-in, ending today/yesterday
  longestStreak: number;
  totalCheckins: number;
  adherence: number;        // % of check-ins where took_stack = true (0-100)
  consistency: number;      // % of days tracked in the active window (0-100)
  daysSinceStart: number;
  checkedInToday: boolean;
}

/**
 * Current streak = consecutive days with a check-in ending today.
 * Grace rule: if there's no check-in today *yet* but there was one yesterday,
 * the streak is still "alive" (counts from yesterday) so the user isn't
 * punished for opening the app in the morning before checking in.
 */
export function computeStreak(checkins: Checkin[], today: string = localDateKey()): { current: number; longest: number } {
  if (checkins.length === 0) return { current: 0, longest: 0 };
  const dates = new Set(checkins.map(c => c.date));
  const sorted = [...dates].sort();

  // Longest run of consecutive days anywhere in the history
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetweenKeys(sorted[i - 1], sorted[i]) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak: walk backwards from today (or yesterday if today is empty)
  let current = 0;
  let cursor = today;
  if (!dates.has(today)) {
    const yest = lastNDateKeys(2, today)[0];
    if (dates.has(yest)) cursor = yest;
    else return { current: 0, longest };
  }
  while (dates.has(cursor)) {
    current++;
    cursor = lastNDateKeys(2, cursor)[0]; // previous day
  }
  return { current, longest };
}

export function computeStats(checkins: Checkin[], enrollment: TrackerEnrollment | null, today: string = localDateKey()): TrackerStats {
  const { current, longest } = computeStreak(checkins, today);
  const total = checkins.length;
  const tookCount = checkins.filter(c => c.took_stack).length;
  const adherence = total > 0 ? Math.round((tookCount / total) * 100) : 0;

  const startKey = enrollment?.started_at ? localDateKey(new Date(enrollment.started_at)) : (checkins[0]?.date ?? today);
  const daysSinceStart = Math.max(1, daysBetweenKeys(startKey, today) + 1);
  const windowDays = Math.min(daysSinceStart, 14);
  const recentKeys = new Set(lastNDateKeys(windowDays, today));
  const trackedInWindow = checkins.filter(c => recentKeys.has(c.date)).length;
  const consistency = Math.round((trackedInWindow / windowDays) * 100);

  return {
    currentStreak: current,
    longestStreak: longest,
    totalCheckins: total,
    adherence,
    consistency: Math.min(100, consistency),
    daysSinceStart,
    checkedInToday: checkins.some(c => c.date === today),
  };
}

export interface MetricSeriesPoint {
  date: string;
  value: number | null;
}

/** Build a dense N-day series for one metric, with nulls on untracked days. */
export function metricSeries(checkins: Checkin[], metric: WellnessMetric, n = 14, today: string = localDateKey()): MetricSeriesPoint[] {
  const byDate = new Map(checkins.map(c => [c.date, c]));
  return lastNDateKeys(n, today).map(date => {
    const c = byDate.get(date);
    const value = c ? c[metric] : null;
    return { date, value: typeof value === "number" ? value : null };
  });
}

export interface MetricTrend {
  metric: WellnessMetric;
  label: string;
  hue: string;
  recentAvg: number | null;   // avg over the most recent half of the window
  priorAvg: number | null;    // avg over the earlier half
  deltaPct: number | null;    // signed % change, oriented so + always = improvement
  latest: number | null;
  samples: number;
}

/** Compare the recent half of the window to the earlier half for one metric. */
export function metricTrend(checkins: Checkin[], metric: WellnessMetric, n = 14, today: string = localDateKey()): MetricTrend {
  const series = metricSeries(checkins, metric, n, today);
  const values = series.filter(p => p.value !== null) as { date: string; value: number }[];
  const half = Math.floor(n / 2);
  const prior = series.slice(0, half).filter(p => p.value !== null).map(p => p.value as number);
  const recent = series.slice(half).filter(p => p.value !== null).map(p => p.value as number);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const priorAvg = avg(prior);
  const recentAvg = avg(recent);
  const meta = METRIC_META[metric];

  let deltaPct: number | null = null;
  if (priorAvg !== null && recentAvg !== null && priorAvg > 0) {
    const raw = ((recentAvg - priorAvg) / priorAvg) * 100;
    deltaPct = Math.round((meta.higherIsBetter ? raw : -raw) * 10) / 10;
  }

  return {
    metric,
    label: meta.label,
    hue: meta.hue,
    recentAvg: recentAvg !== null ? Math.round(recentAvg * 10) / 10 : null,
    priorAvg: priorAvg !== null ? Math.round(priorAvg * 10) / 10 : null,
    deltaPct,
    latest: values.length ? values[values.length - 1].value : null,
    samples: values.length,
  };
}

export function allTrends(checkins: Checkin[], n = 14, today: string = localDateKey()): MetricTrend[] {
  return WELLNESS_METRICS.map(m => metricTrend(checkins, m, n, today));
}

/** Tier label + hue for a 0-100 score ring (matches the audit page palette). */
export function scoreTier(score: number): { label: string; hue: string } {
  if (score >= 80) return { label: "Excellent", hue: "#3f7a52" };
  if (score >= 60) return { label: "Good", hue: "#5ba373" };
  if (score >= 40) return { label: "Building", hue: "#b5751e" };
  return { label: "Getting started", hue: "#6b7280" };
}
