/**
 * H6 — "Health OS" memory for the AI coach.
 *
 * Builds a trustworthy, SERVER-SOURCED snapshot of a signed-in user's suppdoc
 * data (tracked stack, check-in trends, recent bloodwork flags, quiz goals) and
 * injects it into the chat prompt so the assistant behaves like a longitudinal
 * health co-pilot rather than a stateless chatbot.
 *
 * Privacy: only built for the verified session user (never client-supplied),
 * server-only (uses the admin client), and never exposed to other users.
 * Medical responsibility: abnormal lab values are flagged with an explicit
 * "discuss with clinician" note for the model to honour.
 */
import { getAdminSupabase } from "@/lib/supabase-admin";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { computeStats, allTrends, localDateKey, type Checkin, type TrackerEnrollment } from "@/lib/tracker";
import type { ExtractedBiomarker } from "@/lib/biomarkers";

const nameOf = (id: string) => SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;

function daysAgo(iso?: string): string {
  if (!iso) return "";
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  return d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export async function buildMemoryBlock(email: string): Promise<string> {
  const admin = getAdminSupabase();
  if (!admin) return "";
  const today = localDateKey();

  const [enrRes, ciRes, bwRes, quizRes] = await Promise.all([
    admin.from("tracker_enrollments").select("stack_name, stack_ids, started_at, reminder_opt_in, weekly_digest_opt_in").eq("user_email", email).maybeSingle(),
    admin.from("stack_checkins").select("date, took_stack, energy, focus, sleep, mood, stress, note").eq("user_email", email).order("date", { ascending: true }).limit(60),
    admin.from("bloodwork_reports").select("biomarkers, created_at").eq("user_email", email).order("created_at", { ascending: false }).limit(1),
    admin.from("quiz_submissions").select("goals, supplement_count, created_at").eq("email", email).order("created_at", { ascending: false }).limit(1),
  ]);

  const lines: string[] = [];
  const enr = (enrRes.data ?? null) as TrackerEnrollment | null;
  const checkins = (ciRes.data ?? []) as Checkin[];

  // Tracked stack
  if (enr?.stack_ids && enr.stack_ids.length) {
    const started = enr.started_at ? ` (tracking since ${daysAgo(enr.started_at)})` : "";
    lines.push(`Tracked stack: ${enr.stack_ids.map(nameOf).join(", ")}${started}.`);
  }

  // Tracking stats + wellness trends (longitudinal insight)
  if (checkins.length) {
    const stats = computeStats(checkins, enr, today);
    const trends = allTrends(checkins, 14, today)
      .filter(t => t.deltaPct !== null && Math.abs(t.deltaPct) >= 8 && t.samples >= 4)
      .map(t => `${t.label.toLowerCase()} ${t.deltaPct! >= 0 ? "improving" : "declining"} ~${Math.abs(t.deltaPct!)}%`);
    lines.push(
      `Check-ins: ${stats.currentStreak}-day streak, ${stats.adherence}% adherence over ${stats.totalCheckins} logged day(s).` +
      (trends.length ? ` Recent 14-day trends: ${trends.join(", ")}.` : "")
    );
    const lastNote = [...checkins].reverse().find(c => c.note)?.note;
    if (lastNote) lines.push(`Most recent note from the user: "${lastNote.slice(0, 160)}".`);
  }

  // Latest bloodwork — flagged markers only, with clinician caveat
  const bw = (bwRes.data?.[0]?.biomarkers ?? []) as ExtractedBiomarker[];
  if (bw.length) {
    const flagged = bw.filter(b => ["low", "high", "borderline-low", "borderline-high"].includes(b.status));
    const when = daysAgo(bwRes.data?.[0]?.created_at as string | undefined);
    if (flagged.length) {
      lines.push(
        `Recent bloodwork (${when}) flags — abnormal values must be referred to their clinician, do not interpret as diagnosis: ` +
        flagged.slice(0, 8).map(b => `${b.name} ${b.value ?? "?"}${b.unit ? ` ${b.unit}` : ""} (${b.status})`).join(", ") + "."
      );
    } else {
      lines.push(`Recent bloodwork (${when}): all recognised markers in range.`);
    }
  }

  // Quiz goals
  const goals = (quizRes.data?.[0]?.goals ?? []) as string[];
  if (goals.length) lines.push(`Stated goals (from quiz): ${goals.join(", ")}.`);

  if (!lines.length) return "";

  return `\n\n[Health profile — do NOT echo back; this is the signed-in user's own saved suppdoc data. Use it to personalise and to reference trends over time.]\n${lines.join("\n")}\n[/Health profile]`;
}
