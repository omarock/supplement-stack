"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import {
  type Checkin,
  type TrackerEnrollment,
  type WellnessMetric,
  WELLNESS_METRICS,
  METRIC_META,
  localDateKey,
  computeStats,
  computeStreak,
  allTrends,
  metricSeries,
  lastNDateKeys,
  scoreTier,
} from "@/lib/tracker";
import { track } from "@/lib/analytics";

const MILESTONES = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

interface Summary { headline: string; insights: string[]; suggestions: string[]; poweredBy: "claude" | "rules"; }

interface Props {
  initialCheckins: Checkin[];
  initialEnrollment: TrackerEnrollment | null;
  email: string;
  isPremium?: boolean;
}

const SLIDER_HINT: Record<WellnessMetric, [string, string]> = {
  energy: ["Drained", "Energized"],
  focus:  ["Foggy", "Sharp"],
  sleep:  ["Restless", "Rested"],
  mood:   ["Low", "Great"],
  stress: ["Calm", "Stressed"],
};

export default function TrackerClient({ initialCheckins, initialEnrollment, email, isPremium = false }: Props) {
  const [checkins, setCheckins] = useState<Checkin[]>(initialCheckins);
  const [enrollment, setEnrollment] = useState<TrackerEnrollment | null>(initialEnrollment);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const today = useMemo(() => localDateKey(), []);

  const todayCheckin = checkins.find(c => c.date === today) ?? null;
  const stats = useMemo(() => computeStats(checkins, enrollment, today), [checkins, enrollment, today]);
  const trends = useMemo(() => allTrends(checkins, 14, today), [checkins, today]);

  const enrolled = enrollment !== null || checkins.length > 0;

  // Pick up a stack the user chose to track before signing in (set by TrackStackCTA).
  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem("pendingTrackStack"); } catch { return; }
    if (!raw) return;
    try { localStorage.removeItem("pendingTrackStack"); } catch {}
    let pending: { stackName?: string; stackIds?: string[] };
    try { pending = JSON.parse(raw); } catch { return; }
    fetch("/api/track/enroll", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(pending),
    }).then(r => r.ok ? r.json() : null).then(() => {
      setEnrollment(prev => prev ?? {
        stack_name: pending.stackName ?? null, stack_ids: pending.stackIds ?? null,
        reminder_opt_in: true, weekly_digest_opt_in: true, started_at: new Date().toISOString(),
      });
    }).catch(() => {});
  }, []);

  return (
    <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* Header */}
        <header style={{ marginBottom: 28, animation: "sd-fade-in .5s ease-out" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
            Daily Tracker
          </div>
          <h1 style={{ ...D, fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            How are you <span style={SI}>today</span>?
          </h1>
          <p style={{ fontSize: 17, color: TH.inkSoft, maxWidth: 560, margin: 0, lineHeight: 1.5 }}>
            {stats.checkedInToday
              ? "You've logged today. Here's how your stack is tracking."
              : "A 60-second check-in. Consistency is what turns supplements into real, measurable progress."}
          </p>
        </header>

        {!enrolled && !todayCheckin ? (
          <EnrollIntro onEnrolled={(e) => setEnrollment(e)} />
        ) : null}

        {/* Streak + stats row */}
        {(enrolled || todayCheckin) && (
          <StatsRow stats={stats} />
        )}

        {/* Today's check-in */}
        <CheckinCard
          today={today}
          existing={todayCheckin}
          onSaved={(c) => {
            const wasLoggedToday = checkins.some(p => p.date === c.date);
            const without = checkins.filter(p => p.date !== c.date);
            const next = [...without, c].sort((a, b) => a.date.localeCompare(b.date));
            setCheckins(next);
            if (!enrollment) setEnrollment({ stack_name: null, stack_ids: null, reminder_opt_in: true, weekly_digest_opt_in: true, started_at: new Date().toISOString() });
            // Celebrate the streak, only on a brand-new check-in for today, at a milestone.
            if (!wasLoggedToday) {
              const { current } = computeStreak(next, today);
              track("checkin_save", { streak: current, took: c.took_stack });
              if (MILESTONES.includes(current)) setCelebrate(current);
            }
          }}
        />

        {/* Wellness chart */}
        {checkins.length >= 1 && (
          <WellnessSection checkins={checkins} today={today} trends={trends} />
        )}

        {/* AI weekly summary */}
        {checkins.length >= 2 && (
          <SummaryCard checkinCount={checkins.length} />
        )}

        {/* Premium nudge, full history + trend analytics */}
        {!isPremium && checkins.length >= 5 && (
          <Link href="/pricing" style={{
            display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit",
            background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
            border: `1px solid ${TH.sage}33`, borderRadius: 16, padding: "16px 20px", marginBottom: 22,
          }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: TH.accentGlow, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TH.sageDeep} strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", ...D, fontSize: 15, color: TH.ink }}>See your full history & trends</span>
              <span style={{ display: "block", fontSize: 12.5, color: TH.muted, marginTop: 1 }}>Premium unlocks long-term analytics, coach memory & reminders, $9/mo.</span>
            </span>
            <span style={{ color: TH.sageDeep, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>Upgrade →</span>
          </Link>
        )}

        {/* Settings / footnote */}
        <DigestSettings enrollment={enrollment} email={email} onChange={setEnrollment} />

        <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, marginTop: 26, textAlign: "center" }}>
          Educational use only, not medical advice. Wellness check-ins are subjective and reflect how you feel, not a diagnosis.
        </p>
      </div>

      {celebrate !== null && <Celebration streak={celebrate} onClose={() => setCelebrate(null)} />}
    </main>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────────────────
function Celebration({ streak, onClose }: { streak: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3400);
    return () => clearTimeout(t);
  }, [onClose]);

  const msg = streak === 1
    ? "Streak started, see you tomorrow."
    : streak >= 30 ? "Incredible consistency."
    : streak >= 7 ? "A full week. This is how change sticks."
    : "Keep it going.";

  const confetti = Array.from({ length: 18 });
  const hues = [TH.sage, TH.amber, TH.coral, TH.lavender, TH.sageDeep];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(10,37,64,0.28)", backdropFilter: "blur(3px)", animation: "sd-fade-in .25s ease-out", padding: 24,
      }}
    >
      {/* confetti */}
      {confetti.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 6) * 0.12;
        const dur = 1.6 + (i % 5) * 0.25;
        return (
          <span key={i} style={{
            position: "fixed", top: -16, left: `${left}%`, width: 8, height: 8, borderRadius: i % 2 ? 999 : 2,
            background: hues[i % hues.length],
            animation: `sd-confetti ${dur}s cubic-bezier(.2,.6,.4,1) ${delay}s forwards`,
          }} />
        );
      })}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", background: TH.surface, borderRadius: 24, padding: "32px 36px", textAlign: "center",
          boxShadow: "0 30px 80px rgba(10,37,64,0.3)", maxWidth: 320, animation: "sd-pop .4s cubic-bezier(.2,.9,.3,1.2)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 4 }} aria-hidden>🔥</div>
        <div style={{ ...D, fontSize: 52, color: TH.amberDeep, lineHeight: 1, letterSpacing: "-0.03em" }}>
          <CountUp value={streak} duration={700} />
        </div>
        <div style={{ ...D, fontSize: 20, color: TH.ink, marginTop: 6 }}>
          {streak === 1 ? "Day one" : `${streak}-day streak`}
        </div>
        <p style={{ fontSize: 14, color: TH.inkSoft, margin: "8px 0 0", lineHeight: 1.45 }}>{msg}</p>
      </div>
      <style>{`
        @keyframes sd-pop { from { opacity: 0; transform: scale(.8) translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes sd-confetti { to { transform: translateY(104vh) rotate(540deg); opacity: 0; } }
      `}</style>
    </div>
  );
}

// Animated number count-up. Re-animates whenever `value` changes.
function CountUp({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── Enroll intro (first run) ─────────────────────────────────────────────────
function EnrollIntro({ onEnrolled }: { onEnrolled: (e: TrackerEnrollment) => void }) {
  const [busy, setBusy] = useState(false);
  const start = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/track/enroll", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reminderOptIn: true, weeklyDigestOptIn: true }),
      });
      track("track_enroll", { source: "intro" });
      onEnrolled({ stack_name: null, stack_ids: null, reminder_opt_in: true, weekly_digest_opt_in: true, started_at: new Date().toISOString() });
    } finally { setBusy(false); }
  }, [onEnrolled]);

  return (
    <section style={{
      background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
      border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "26px 26px",
      marginBottom: 22, animation: "sd-fade-in .5s ease-out",
    }}>
      <h2 style={{ ...D, fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Start your streak today.</h2>
      <p style={{ fontSize: 15, color: TH.inkSoft, margin: "0 0 18px", lineHeight: 1.55, maxWidth: 560 }}>
        Each day, log whether you took your stack and rate how you feel. In a week you&apos;ll see clear trends, and a streak worth protecting.
      </p>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        {[
          ["①", "Check in", "60 seconds a day"],
          ["②", "See trends", "14-day wellness graph"],
          ["③", "Get insights", "Weekly summary"],
        ].map(([n, t, d]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...D, fontSize: 18, color: TH.sage }}>{n}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TH.ink }}>{t}</div>
              <div style={{ fontSize: 12.5, color: TH.muted }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={start} disabled={busy} style={{
        marginTop: 20, padding: "12px 22px", borderRadius: 999, border: "none",
        background: TH.sage, color: "#fff", ...D, fontWeight: 600, fontSize: 14.5,
        cursor: busy ? "wait" : "pointer", boxShadow: `0 8px 22px ${TH.sage}44`,
      }}>
        {busy ? "Starting…" : "Start tracking →"}
      </button>
    </section>
  );
}

// ─── Stats row (streak + adherence + consistency rings) ───────────────────────
function StatsRow({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <section style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 14, marginBottom: 22, animation: "sd-fade-in .5s ease-out",
    }}>
      <StreakTile streak={stats.currentStreak} longest={stats.longestStreak} />
      <RingTile label="Adherence" value={stats.adherence} sub={`${stats.totalCheckins} day${stats.totalCheckins === 1 ? "" : "s"} logged`} />
      <RingTile label="Consistency" value={stats.consistency} sub="last 14 days" />
    </section>
  );
}

function StreakTile({ streak, longest }: { streak: number; longest: number }) {
  const hot = streak >= 3;
  return (
    <div style={{
      background: hot ? `linear-gradient(135deg, #fff7ed 0%, ${TH.surface} 100%)` : TH.surface,
      border: `1px solid ${hot ? "#f5d3a8" : TH.edge}`, borderRadius: 18, padding: "18px 20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        Current streak
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ ...D, fontSize: 44, lineHeight: 1, color: hot ? TH.amberDeep : TH.ink, letterSpacing: "-0.02em" }}><CountUp value={streak} /></span>
        <span style={{ fontSize: 22 }} aria-hidden>{hot ? "🔥" : "🌱"}</span>
      </div>
      <div style={{ fontSize: 12, color: TH.muted, marginTop: 6 }}>
        {streak === 0 ? "Check in to start" : `day${streak === 1 ? "" : "s"} in a row · best ${longest}`}
      </div>
    </div>
  );
}

function RingTile({ label, value, sub }: { label: string; value: number; sub: string }) {
  const tier = scoreTier(value);
  return (
    <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <Ring value={value} color={tier.hue} size={62} stroke={6} label={`${value}%`} />
      <div>
        <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ ...D, fontSize: 15, color: TH.ink }}>{tier.label}</div>
        <div style={{ fontSize: 12, color: TH.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Ring({ value, color, size = 96, stroke = 6, label }: { value: number; color: string; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2 - 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  const c = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} stroke={TH.edge} strokeWidth={stroke} fill="none" />
        <circle cx={c} cy={c} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      {label && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: size * 0.23, color: TH.ink }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Check-in card ────────────────────────────────────────────────────────────
function CheckinCard({ today, existing, onSaved }: { today: string; existing: Checkin | null; onSaved: (c: Checkin) => void }) {
  const [editing, setEditing] = useState(existing === null);
  const [took, setTook] = useState(existing?.took_stack ?? true);
  const [scores, setScores] = useState<Record<WellnessMetric, number>>(() => {
    const init = {} as Record<WellnessMetric, number>;
    for (const m of WELLNESS_METRICS) init[m] = typeof existing?.[m] === "number" ? (existing![m] as number) : 5;
    return init;
  });
  const [note, setNote] = useState(existing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/track/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date: today, took_stack: took, ...scores, note: note.trim() || null }),
      });
      const body = await res.json();
      if (body.ok) {
        onSaved({ date: today, took_stack: took, energy: scores.energy, focus: scores.focus, sleep: scores.sleep, mood: scores.mood, stress: scores.stress, note: note.trim() || null });
        setEditing(false);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2600);
      }
    } finally { setSaving(false); }
  }, [today, took, scores, note, onSaved]);

  // Completed (read-only) state
  if (!editing && existing) {
    return (
      <section style={{
        background: justSaved ? "#f0f9f3" : TH.surface, border: `1px solid ${justSaved ? TH.sage + "55" : TH.edge}`,
        borderRadius: 22, padding: "22px 24px", marginBottom: 22,
        boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.06)",
        transition: "background .4s, border-color .4s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 999, background: TH.sage, color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }} aria-hidden>✓</span>
            <div>
              <div style={{ ...D, fontSize: 18, color: TH.ink }}>{justSaved ? "Logged! Nice work." : "Today's check-in is in."}</div>
              <div style={{ fontSize: 13, color: TH.muted }}>
                {existing.took_stack ? "Took your stack" : "Skipped today"} · tap to adjust
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(true)} style={{
            padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
            background: TH.bg, border: `1px solid ${TH.edge}`, color: TH.ink, cursor: "pointer",
          }}>Edit</button>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
          {WELLNESS_METRICS.map(m => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: METRIC_META[m].hue }} />
              <span style={{ fontSize: 12.5, color: TH.muted }}>{METRIC_META[m].label}</span>
              <span style={{ ...D, fontSize: 14, color: TH.ink }}>{existing[m] ?? "-"}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Editing state
  return (
    <section style={{
      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "24px 26px", marginBottom: 22,
      boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.08)", animation: "sd-fade-in .4s ease-out",
    }}>
      {/* Took stack toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div style={{ ...D, fontSize: 17, color: TH.ink }}>Did you take your stack today?</div>
          <div style={{ fontSize: 13, color: TH.muted, marginTop: 2 }}>Honesty beats a perfect streak.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ToggleBtn active={took} onClick={() => setTook(true)} label="Yes" hue={TH.sage} />
          <ToggleBtn active={!took} onClick={() => setTook(false)} label="Not today" hue={TH.muted} />
        </div>
      </div>

      <div style={{ height: 1, background: TH.edge, margin: "0 0 20px" }} />

      <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
        How do you feel? (0-10)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {WELLNESS_METRICS.map(m => (
          <SliderRow key={m} metric={m} value={scores[m]} onChange={v => setScores(s => ({ ...s, [m]: v }))} />
        ))}
      </div>

      {/* Note */}
      <div style={{ marginTop: 20 }}>
        <label style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          Note / symptoms <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="e.g. slept great, slight headache in the afternoon…"
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1.5px solid ${TH.edge}`,
            borderRadius: 12, fontSize: 14.5, lineHeight: 1.5, fontFamily: FONTS.body, color: TH.ink,
            background: TH.bg, outline: "none", resize: "vertical",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 4px ${TH.accentGlow}`; }}
          onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {existing && (
          <button onClick={() => setEditing(false)} style={{
            padding: "13px 20px", borderRadius: 999, fontSize: 14, fontWeight: 500,
            background: "transparent", border: `1px solid ${TH.edge}`, color: TH.inkSoft, cursor: "pointer",
          }}>Cancel</button>
        )}
        <button onClick={save} disabled={saving} style={{
          padding: "13px 26px", borderRadius: 999, border: "none",
          background: saving ? TH.muted : TH.ink, color: "#fff", ...D, fontWeight: 600, fontSize: 14.5,
          cursor: saving ? "wait" : "pointer", boxShadow: saving ? "none" : `0 8px 22px ${TH.ink}22`,
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          {saving ? "Saving…" : existing ? "Update check-in" : "Log today →"}
        </button>
      </div>
    </section>
  );
}

function ToggleBtn({ active, onClick, label, hue }: { active: boolean; onClick: () => void; label: string; hue: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
      border: `1.5px solid ${active ? hue : TH.edge}`,
      background: active ? hue : TH.surface, color: active ? "#fff" : TH.inkSoft,
      cursor: "pointer", transition: "all .18s",
    }}>{label}</button>
  );
}

function SliderRow({ metric, value, onChange }: { metric: WellnessMetric; value: number; onChange: (v: number) => void }) {
  const meta = METRIC_META[metric];
  const [lo, hi] = SLIDER_HINT[metric];
  const pct = (value / 10) * 100;
  const rangeStyle: React.CSSProperties & Record<string, string | number> = {
    width: "100%", height: 28, appearance: "none", WebkitAppearance: "none",
    background: "transparent", cursor: "pointer", margin: 0,
  };
  rangeStyle["--fill"] = `${pct}%`;
  rangeStyle["--hue"] = meta.hue;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: TH.ink }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: meta.hue }} />
          {meta.label}
        </span>
        <span style={{ ...D, fontSize: 20, color: meta.hue, minWidth: 28, textAlign: "right" }}>{value}</span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={meta.label}
        style={rangeStyle}
        className="sd-range"
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: TH.mutedDim, marginTop: 2 }}>
        <span>{lo}</span><span>{hi}</span>
      </div>
      <style>{`
        .sd-range { -webkit-appearance: none; }
        .sd-range::-webkit-slider-runnable-track {
          height: 7px; border-radius: 999px;
          background: linear-gradient(to right, var(--hue) var(--fill), ${TH.edge} var(--fill));
        }
        .sd-range::-moz-range-track { height: 7px; border-radius: 999px; background: ${TH.edge}; }
        .sd-range::-moz-range-progress { height: 7px; border-radius: 999px; background: var(--hue); }
        .sd-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; margin-top: -7px;
          width: 22px; height: 22px; border-radius: 999px; background: #fff;
          border: 3px solid var(--hue); box-shadow: 0 2px 6px rgba(10,37,64,0.2); cursor: pointer;
          transition: transform .12s;
        }
        .sd-range::-webkit-slider-thumb:active { transform: scale(1.18); }
        .sd-range::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 999px; background: #fff;
          border: 3px solid var(--hue); box-shadow: 0 2px 6px rgba(10,37,64,0.2); cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ─── Wellness chart section ───────────────────────────────────────────────────
function WellnessSection({ checkins, today, trends }: { checkins: Checkin[]; today: string; trends: ReturnType<typeof allTrends> }) {
  const [active, setActive] = useState<Set<WellnessMetric>>(new Set(["energy", "sleep", "mood"]));
  const toggle = (m: WellnessMetric) => setActive(prev => {
    const next = new Set(prev);
    if (next.has(m)) next.delete(m); else next.add(m);
    return next;
  });

  return (
    <section style={{
      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "24px 26px", marginBottom: 22,
      animation: "sd-fade-in .5s ease-out",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>Your last 14 days</h2>
        <span style={{ ...MM, fontSize: 11, color: TH.muted }}>{checkins.length} check-in{checkins.length === 1 ? "" : "s"}</span>
      </div>

      {/* Legend toggles */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 18px" }}>
        {WELLNESS_METRICS.map(m => {
          const on = active.has(m);
          return (
            <button key={m} onClick={() => toggle(m)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999,
              border: `1px solid ${on ? METRIC_META[m].hue : TH.edge}`, background: on ? METRIC_META[m].hue + "14" : TH.bg,
              color: on ? TH.ink : TH.muted, fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all .15s",
            }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: on ? METRIC_META[m].hue : TH.mutedDim }} />
              {METRIC_META[m].label}
            </button>
          );
        })}
      </div>

      <LineChart checkins={checkins} today={today} active={active} />

      {/* Trend chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 18 }}>
        {trends.map(t => (
          <div key={t.metric} style={{ background: TH.bg, borderRadius: 12, padding: "10px 12px", border: `1px solid ${TH.edge}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TH.muted, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: t.hue }} />{t.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ ...D, fontSize: 18, color: TH.ink }}>{t.recentAvg ?? "-"}</span>
              {t.deltaPct !== null && t.samples >= 4 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: t.deltaPct >= 0 ? TH.sageDeep : "#b91c1c" }}>
                  {t.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(t.deltaPct)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LineChart({ checkins, today, active }: { checkins: Checkin[]; today: string; active: Set<WellnessMetric> }) {
  const W = 680, H = 220, padL = 28, padR = 12, padT = 14, padB = 26;
  const days = lastNDateKeys(14, today);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i: number) => padL + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / 10) * innerH;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="14-day wellness trend chart">
        {/* gridlines */}
        {[0, 2.5, 5, 7.5, 10].map(g => (
          <g key={g}>
            <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={TH.edge} strokeWidth={1} />
            <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize={9} fill={TH.mutedDim} fontFamily={FONTS.mono}>{g}</text>
          </g>
        ))}
        {/* lines per active metric */}
        {[...active].map(m => {
          const series = metricSeries(checkins, m, 14, today);
          // Build path segments, breaking on nulls
          const segs: string[] = [];
          let cur = "";
          series.forEach((p, i) => {
            if (p.value === null) { if (cur) { segs.push(cur); cur = ""; } return; }
            cur += `${cur ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)} `;
          });
          if (cur) segs.push(cur);
          const hue = METRIC_META[m].hue;
          return (
            <g key={m}>
              {segs.map((d, si) => <path key={si} d={d} fill="none" stroke={hue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />)}
              {series.map((p, i) => p.value !== null
                ? <circle key={i} cx={x(i)} cy={y(p.value)} r={2.8} fill={hue} />
                : null)}
            </g>
          );
        })}
        {/* x labels: first, mid, last */}
        {[0, Math.floor(days.length / 2), days.length - 1].map(i => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={TH.mutedDim} fontFamily={FONTS.mono}>
            {days[i].slice(5)}
          </text>
        ))}
      </svg>
      {active.size === 0 && (
        <div style={{ textAlign: "center", fontSize: 13, color: TH.muted, marginTop: -120, marginBottom: 100 }}>
          Select a metric above to plot it.
        </div>
      )}
    </div>
  );
}

// ─── AI weekly summary ────────────────────────────────────────────────────────
function SummaryCard({ checkinCount }: { checkinCount: number }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/track/summary", { method: "POST" });
      const body = await res.json();
      if (body.ok) setSummary(body.summary);
      else setError("Couldn't generate a summary right now.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, []);

  // Auto-generate once on mount when there's enough data.
  useEffect(() => { if (checkinCount >= 3) run(); }, [checkinCount, run]);

  return (
    <section style={{
      background: `linear-gradient(135deg, ${TH.ink} 0%, #0d2f4f 100%)`, color: "#fff",
      borderRadius: 22, padding: "26px 28px", marginBottom: 22, animation: "sd-fade-in .5s ease-out",
    }}>
      <div style={{ ...MM, fontSize: 11, color: TH.sage, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span>✦ Weekly Summary</span>
      </div>

      {loading && (
        <div style={{ fontSize: 16, opacity: 0.85 }}>
          <span className="sd-shimmer">Reading your check-ins, finding the trends…</span>
          <style>{`.sd-shimmer{background:linear-gradient(90deg,#ffffff66,#ffffff,#ffffff66);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sd-sh 1.6s linear infinite}@keyframes sd-sh{to{background-position:-200% 0}}`}</style>
        </div>
      )}

      {error && !loading && (
        <div>
          <p style={{ fontSize: 15, opacity: 0.85, margin: "0 0 12px" }}>{error}</p>
          <button onClick={run} style={retryBtn}>Try again</button>
        </div>
      )}

      {summary && !loading && (
        <div style={{ animation: "sd-fade-in .4s ease-out" }}>
          <h2 style={{ ...D, fontSize: 24, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{summary.headline}</h2>
          {summary.insights.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {summary.insights.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5, opacity: 0.95 }}>
                  <span style={{ color: TH.sage, flexShrink: 0 }}>›</span>{s}
                </li>
              ))}
            </ul>
          )}
          {summary.suggestions.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 14 }}>
              <div style={{ ...MM, fontSize: 10.5, color: TH.amber, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Try this</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {summary.suggestions.map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>
                    <span style={{ color: TH.amber, flexShrink: 0 }}>→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ ...MM, fontSize: 10, opacity: 0.5, marginTop: 16 }}>
            {summary.poweredBy === "claude" ? "Generated by Claude · educational, not medical advice" : "Rule-based summary · educational, not medical advice"}
          </div>
        </div>
      )}
    </section>
  );
}

const retryBtn: React.CSSProperties = {
  padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", cursor: "pointer",
};

// ─── Digest settings ──────────────────────────────────────────────────────────
function DigestSettings({ enrollment, email, onChange }: { enrollment: TrackerEnrollment | null; email: string; onChange: (e: TrackerEnrollment) => void }) {
  const [optIn, setOptIn] = useState(enrollment?.weekly_digest_opt_in ?? true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setOptIn(enrollment?.weekly_digest_opt_in ?? true); }, [enrollment]);

  if (!enrollment) return null;

  const toggle = async () => {
    const next = !optIn;
    setOptIn(next); setSaving(true);
    try {
      await fetch("/api/track/enroll", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ weeklyDigestOptIn: next }),
      });
      onChange({ ...enrollment, weekly_digest_opt_in: next });
    } finally { setSaving(false); }
  };

  return (
    <section style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: TH.ink }}>Weekly email summary</div>
        <div style={{ fontSize: 12.5, color: TH.muted, marginTop: 2 }}>A short recap of your week, sent to {email}.</div>
      </div>
      <button onClick={toggle} disabled={saving} role="switch" aria-checked={optIn} style={{
        width: 50, height: 28, borderRadius: 999, border: "none", cursor: saving ? "wait" : "pointer",
        background: optIn ? TH.sage : TH.edgeStrong, position: "relative", transition: "background .2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 3, left: optIn ? 25 : 3, width: 22, height: 22, borderRadius: 999,
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .2s",
        }} />
      </button>
    </section>
  );
}
