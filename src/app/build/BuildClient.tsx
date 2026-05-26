"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import { PRODUCTS } from "@/lib/products";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { TH, FONTS } from "@/lib/theme";

// ─── Constants ─────────────────────────────────────────────────────────────
const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const MAX_SUPPS = 15;
const SOFT_CAP = 10;
const STORAGE_KEY = "suppdoc.customStack.v1";

type Timing = "morning" | "midday" | "pre-train" | "evening";
const TIMINGS: Timing[] = ["morning", "midday", "pre-train", "evening"];
const TIMING_META: Record<Timing, { label: string; icon: string; bg: string; ink: string }> = {
  morning:     { label: "Morning",   icon: "☀",  bg: "#fef3c7", ink: "#92400e" },
  midday:      { label: "Midday",    icon: "◐",  bg: "#dbeafe", ink: "#1e40af" },
  "pre-train": { label: "Pre-train", icon: "⚡", bg: "#dcfce7", ink: "#166534" },
  evening:     { label: "Evening",   icon: "☾",  bg: "#ede9fe", ink: "#5b21b6" },
};

const QUICK_GOALS = [
  { id: "all",       label: "Browse all",   tags: [] as string[] },
  { id: "sleep",     label: "Better sleep", tags: ["sleep", "low-sleep", "sleep-onset", "wake-at-night"] },
  { id: "energy",    label: "More energy",  tags: ["energy", "low-energy", "afternoon-crash"] },
  { id: "focus",     label: "Sharper focus", tags: ["focus", "brain-fog", "poor-focus", "memory"] },
  { id: "stress",    label: "Less stress",  tags: ["stress", "anxiety", "high-stress"] },
  { id: "recovery",  label: "Recovery",     tags: ["recovery", "active", "joint", "joint-pain"] },
  { id: "immune",    label: "Immunity",     tags: ["immune", "frequent-illness"] },
  { id: "longevity", label: "Longevity",    tags: ["longevity", "anti-aging"] },
  { id: "beauty",    label: "Skin · hair",  tags: ["beauty", "skin", "hair"] },
  { id: "gut",       label: "Gut health",   tags: ["gut", "digestive-issues", "bloating"] },
];

const QUICK_TEMPLATES: { name: string; description: string; ids: string[] }[] = [
  { name: "Foundation",  description: "The 3 supplements almost everyone benefits from.", ids: ["d3k2", "omega3", "mag-glycinate"] },
  { name: "Deep sleep",  description: "Calm the nervous system, deepen restorative sleep.", ids: ["mag-glycinate", "ashwagandha", "glycine", "l-theanine"] },
  { name: "Energy",      description: "Mitochondrial energy without caffeine.", ids: ["d3k2", "b-complex", "rhodiola", "coq10"] },
  { name: "Longevity",   description: "Cellular renewal frontier (NAD+ + senolytic).", ids: ["nmn", "urolithin-a", "fisetin", "tmg"] },
  { name: "Performance", description: "Train harder, recover faster.", ids: ["creatine", "beta-alanine", "hmb", "omega3", "tart-cherry"] },
  { name: "Gut reset",   description: "Repair the lining, rebalance the microbiome.", ids: ["zinc-carnosine", "s-boulardii", "tributyrin", "probiotic"] },
];

const CATEGORY_LABELS: Record<string, string> = {
  vitamins: "Vitamins", minerals: "Minerals", "amino-acids": "Amino Acids",
  "omega-fats": "Omega Fats", adaptogens: "Adaptogens", nootropics: "Nootropics",
  antioxidants: "Antioxidants", joint: "Joint", gut: "Gut", sleep: "Sleep",
  hormonal: "Hormonal", heart: "Heart", performance: "Performance", greens: "Greens",
  specialty: "Specialty",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function evidenceWeight(e: Supplement["evidence"]) {
  return e === "very strong" ? 3 : e === "strong" ? 2 : 1;
}

function encodeStack(ids: string[]): string {
  return ids.join(",");
}
function decodeStack(s: string | null): string[] {
  if (!s) return [];
  return s.split(",").map(x => x.trim()).filter(Boolean);
}

// Wellness impact estimator — sums tag contributions per supplement
function wellnessImpact(supps: Supplement[]) {
  const scores = { energy: 0, sleep: 0, recovery: 0, focus: 0, stress: 0, mood: 0 };
  const tagMap: Record<keyof typeof scores, string[]> = {
    energy: ["energy", "low-energy", "afternoon-crash"],
    sleep: ["sleep", "low-sleep", "sleep-onset", "wake-at-night"],
    recovery: ["recovery", "active", "very-active", "joint", "joint-pain"],
    focus: ["focus", "brain-fog", "poor-focus", "memory"],
    stress: ["stress", "high-stress", "anxiety"],
    mood: ["low-mood", "low-motivation"],
  };
  for (const s of supps) {
    const w = evidenceWeight(s.evidence);
    for (const k of Object.keys(scores) as (keyof typeof scores)[]) {
      const hits = s.tags.filter(t => tagMap[k].includes(t)).length;
      if (hits > 0) scores[k] += hits * w * 5;
    }
  }
  // Cap at 100
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, Math.min(100, Math.round(v))])
  ) as typeof scores;
}

// Detect duplicate-mechanism issues
function detectIssues(supps: Supplement[]) {
  const issues: { kind: "info" | "warn"; text: string }[] = [];
  const ids = new Set(supps.map(s => s.id));

  if (ids.has("omega3") && ids.has("omega3-algae")) {
    issues.push({ kind: "info", text: "You have both fish-oil and algae omega-3 — these overlap. Keep one." });
  }
  const magCount = supps.filter(s => s.id.startsWith("mag-")).length;
  if (magCount > 2) {
    issues.push({ kind: "info", text: `You have ${magCount} magnesium forms — most people only need one (glycinate for sleep, threonate for brain).` });
  }
  if (ids.has("5-htp") && ids.has("tryptophan")) {
    issues.push({ kind: "warn", text: "5-HTP and L-Tryptophan both raise serotonin — combining is rarely needed and can be excessive." });
  }
  if (ids.has("iron") && ids.has("calcium")) {
    issues.push({ kind: "info", text: "Take iron and calcium at least 2 hours apart — calcium blocks iron absorption." });
  }
  if (ids.has("coq10") && ids.has("ubiquinol")) {
    issues.push({ kind: "info", text: "CoQ10 and Ubiquinol are the same nutrient (oxidized vs reduced) — pick one." });
  }
  if (ids.has("ashwagandha") && ids.has("rhodiola") && ids.has("eleuthero") && ids.has("ginseng")) {
    issues.push({ kind: "info", text: "You're stacking 4+ adaptogens — usually 2 is enough. Consider trimming." });
  }
  if (ids.has("nmn") && !ids.has("tmg") && !ids.has("b-complex") && !ids.has("methylfolate")) {
    issues.push({ kind: "info", text: "NAD+ precursors (NMN/NR) consume methyl groups — consider adding TMG or B-complex." });
  }
  if (supps.length >= SOFT_CAP) {
    issues.push({ kind: "info", text: `Your stack has ${supps.length} supplements — most well-designed routines stay under 10. Consider focusing.` });
  }
  return issues;
}

// ─── BuildClient ──────────────────────────────────────────────────────────
export default function BuildClient() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeGoal, setActiveGoal] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<"all" | "very strong" | "strong">("all");
  const [veganOnly, setVeganOnly] = useState(false);
  const [budgetCap, setBudgetCap] = useState<number>(0); // 0 = no cap
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stackName, setStackName] = useState("My Custom Stack");
  const [stackDrawerOpen, setStackDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from URL hash or localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("s");
    if (fromUrl) {
      const ids = decodeStack(fromUrl).filter(id => SUPPLEMENT_DB.some(s => s.id === id));
      if (ids.length) {
        setSelectedIds(ids);
        return;
      }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ids: string[]; name?: string };
        if (Array.isArray(parsed.ids)) {
          setSelectedIds(parsed.ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id)));
          if (parsed.name) setStackName(parsed.name);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: selectedIds, name: stackName }));
    } catch { /* ignore */ }
  }, [selectedIds, stackName]);

  const selected = useMemo(
    () => selectedIds
      .map(id => SUPPLEMENT_DB.find(s => s.id === id))
      .filter((s): s is Supplement => Boolean(s)),
    [selectedIds]
  );

  const totalCost = selected.reduce((sum, s) => sum + s.monthlyCost, 0);
  const scores = useMemo(() => wellnessImpact(selected), [selected]);
  const issues = useMemo(() => detectIssues(selected), [selected]);

  // Filter library
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const goalTags = QUICK_GOALS.find(g => g.id === activeGoal)?.tags ?? [];
    return SUPPLEMENT_DB.filter(s => {
      if (q) {
        const hay = `${s.name} ${s.purpose} ${s.brand} ${s.tags.join(" ")} ${s.category ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (goalTags.length > 0) {
        if (!s.tags.some(t => goalTags.includes(t))) return false;
      }
      if (evidenceFilter !== "all" && s.evidence !== evidenceFilter && !(evidenceFilter === "strong" && s.evidence === "very strong")) {
        return false;
      }
      if (veganOnly && !s.vegan) return false;
      if (budgetCap > 0 && s.monthlyCost > budgetCap) return false;
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      return true;
    });
  }, [search, activeGoal, evidenceFilter, veganOnly, budgetCap, categoryFilter]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<string, Supplement[]>();
    for (const s of filtered) {
      const cat = s.category ?? "specialty";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  // Add / remove
  const flashAdded = useCallback((id: string) => {
    setJustAdded(id);
    if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
    justAddedTimer.current = setTimeout(() => setJustAdded(null), 900);
  }, []);
  const toast = useCallback((msg: string) => {
    setSavedToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSavedToast(null), 2400);
  }, []);
  const addSupp = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_SUPPS) {
        toast(`Stack is at the cap of ${MAX_SUPPS}. Remove one first.`);
        return prev;
      }
      flashAdded(id);
      return [...prev, id];
    });
  }, [flashAdded, toast]);
  const removeSupp = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  }, []);
  const toggleSupp = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length >= MAX_SUPPS ? (toast(`Stack is at the cap of ${MAX_SUPPS}.`), prev) : (flashAdded(id), [...prev, id])));
  }, [flashAdded, toast]);
  const clearAll = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (window.confirm("Clear your entire stack?")) setSelectedIds([]);
  }, [selectedIds.length]);
  const loadTemplate = useCallback((ids: string[]) => {
    const valid = ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id));
    setSelectedIds(valid);
    toast("Template loaded — tweak from here.");
  }, [toast]);

  // Share / copy URL
  const shareUrl = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("s", encodeStack(selectedIds));
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      toast("Share link copied to clipboard.");
    } catch {
      toast(`Copy this: ${link}`);
    }
  }, [selectedIds, toast]);

  // Buy all — open each iHerb link in a new tab (with affiliate code)
  const buyAll = useCallback(() => {
    for (const s of selected) {
      const p = PRODUCTS[s.id]?.[0];
      const href = p?.productPath ? iherbProductLink(p.productPath) : iherbLink(s.iherbSearch);
      if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
    }
  }, [selected]);

  // ── Layout ────────────────────────────────────────────────────────────
  return (
    <main style={{ padding: "32px var(--section-pad-x) 80px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Hero */}
      <header style={{ marginBottom: 28, animation: "sd-fade-in .5s ease-out" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ ...MM, fontSize: 11, letterSpacing: "0.12em", color: TH.sageDeep, textTransform: "uppercase" }}>NEW · Build mode</span>
          <span style={{ height: 1, flex: 1, background: TH.edge }} />
        </div>
        <h1 style={{
          ...D, fontSize: "clamp(38px, 6vw, 64px)", lineHeight: 1.02,
          letterSpacing: "-0.025em", margin: "0 0 14px",
        }}>
          Design <span style={SI}>your own</span> supplement stack.
        </h1>
        <p style={{
          fontSize: 18, color: TH.inkSoft, maxWidth: 620, lineHeight: 1.55, margin: 0,
        }}>
          Pick from {SUPPLEMENT_DB.length}{" "}evidence-led ingredients. We&apos;ll show you the daily ritual,
          flag interactions, and preview the wellness impact in real time.
        </p>
      </header>

      {/* AI mode — describe in plain English */}
      {selected.length === 0 && (
        <AIDescribeMode
          onApply={ids => {
            const valid = ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id));
            setSelectedIds(valid);
            toast(`${valid.length} supplements added from your description.`);
          }}
        />
      )}

      {/* Quick templates (only on empty stack) */}
      {selected.length === 0 && (
        <section style={{
          background: TH.surface, border: `1px solid ${TH.edge}`,
          borderRadius: 20, padding: "22px 24px", marginBottom: 22,
          animation: "sd-fade-in .5s ease-out",
        }}>
          <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", marginBottom: 12 }}>
            OR PICK A READY-MADE TEMPLATE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
            {QUICK_TEMPLATES.map(t => (
              <button key={t.name} onClick={() => loadTemplate(t.ids)}
                style={{
                  textAlign: "left", padding: "14px 16px",
                  background: TH.bg, border: `1px solid ${TH.edge}`,
                  borderRadius: 14, cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s, border-color .15s",
                  display: "flex", flexDirection: "column", gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(91,163,115,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ ...D, fontSize: 15, color: TH.ink }}>{t.name}</span>
                <span style={{ fontSize: 12, color: TH.muted, lineHeight: 1.4 }}>{t.description}</span>
                <span style={{ ...MM, fontSize: 10, color: TH.sageDeep, marginTop: 4 }}>{t.ids.length} ingredients →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main grid: library + stack panel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "var(--build-cols)",
        gap: 28,
        alignItems: "start",
      }}>
        {/* ─── Library column ─── */}
        <section>
          {/* Search + filters */}
          <div style={{
            position: "sticky", top: 76, zIndex: 5, background: TH.bg,
            paddingBottom: 14, marginBottom: 8,
          }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: TH.muted, pointerEvents: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${SUPPLEMENT_DB.length} ingredients — "magnesium", "sleep", "ashwagandha"…`}
                style={{
                  width: "100%", padding: "16px 18px 16px 48px",
                  fontSize: 15, fontFamily: FONTS.body, color: TH.ink,
                  background: TH.surface, border: `1.5px solid ${TH.edge}`,
                  borderRadius: 14, outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 4px ${TH.accentGlow}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear" style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: TH.muted, padding: 6, fontSize: 14,
                }}>✕</button>
              )}
            </div>

            {/* Goal chips */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {QUICK_GOALS.map(g => {
                const active = activeGoal === g.id;
                return (
                  <button key={g.id} onClick={() => setActiveGoal(g.id)}
                    style={{
                      flexShrink: 0, padding: "8px 14px", borderRadius: 999,
                      border: `1px solid ${active ? TH.ink : TH.edge}`,
                      background: active ? TH.ink : TH.surface,
                      color: active ? TH.surface : TH.inkSoft,
                      fontSize: 13, fontWeight: 500, cursor: "pointer",
                      whiteSpace: "nowrap", transition: "all .15s",
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>

            {/* Secondary filters */}
            <details style={{ marginTop: 10 }}>
              <summary style={{
                cursor: "pointer", fontSize: 12, color: TH.muted, ...MM,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "6px 0", userSelect: "none",
              }}>More filters {(evidenceFilter !== "all" || veganOnly || budgetCap > 0 || categoryFilter !== "all") && "·"}
              </summary>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10,
                padding: "14px 16px", background: TH.surface,
                border: `1px solid ${TH.edge}`, borderRadius: 12,
              }}>
                <FilterSelect label="Evidence" value={evidenceFilter} onChange={v => setEvidenceFilter(v as "all" | "very strong" | "strong")} options={[
                  { v: "all", label: "Any" },
                  { v: "very strong", label: "Very strong" },
                  { v: "strong", label: "Strong+" },
                ]} />
                <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={[
                  { v: "all", label: "All categories" },
                  ...Object.entries(CATEGORY_LABELS).map(([v, label]) => ({ v, label })),
                ]} />
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: TH.inkSoft, cursor: "pointer" }}>
                  <input type="checkbox" checked={veganOnly} onChange={e => setVeganOnly(e.target.checked)} style={{ accentColor: TH.sage }} />
                  Vegan only
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: TH.inkSoft }}>
                  Max $/mo:
                  <input type="number" min={0} max={100} value={budgetCap || ""} onChange={e => setBudgetCap(parseInt(e.target.value) || 0)}
                    placeholder="any"
                    style={{ width: 70, padding: "4px 8px", border: `1px solid ${TH.edge}`, borderRadius: 8, fontSize: 13 }} />
                </label>
                {(evidenceFilter !== "all" || veganOnly || budgetCap > 0 || categoryFilter !== "all") && (
                  <button onClick={() => { setEvidenceFilter("all"); setVeganOnly(false); setBudgetCap(0); setCategoryFilter("all"); }}
                    style={{ background: "transparent", border: "none", color: TH.sageDeep, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    Reset filters
                  </button>
                )}
              </div>
            </details>

            <div style={{ marginTop: 10, fontSize: 12, color: TH.muted, ...MM }}>
              {filtered.length} of {SUPPLEMENT_DB.length} ingredients
            </div>
          </div>

          {/* Grouped list */}
          {grouped.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: TH.muted, fontSize: 15 }}>
              No matches. Try a different search or clear filters.
            </div>
          ) : (
            grouped.map(([cat, supps]) => (
              <div key={cat} style={{ marginBottom: 22 }}>
                <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                  {CATEGORY_LABELS[cat] ?? cat} · {supps.length}
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                  gap: 12,
                }}>
                  {supps.map(s => (
                    <SuppCard key={s.id}
                      supp={s}
                      added={selectedIds.includes(s.id)}
                      flashed={justAdded === s.id}
                      onAdd={() => toggleSupp(s.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* ─── Stack panel ─── */}
        <aside style={{
          position: "sticky", top: 88,
          maxHeight: "calc(100vh - 104px)",
          display: "flex", flexDirection: "column",
          background: TH.surface, border: `1px solid ${TH.edge}`,
          borderRadius: 22, overflow: "hidden",
        }}>
          <StackHeader name={stackName} onName={setStackName} count={selected.length} total={totalCost} />

          <div style={{ overflowY: "auto", padding: "14px 18px", flex: 1 }}>
            {selected.length === 0 ? (
              <EmptyStack />
            ) : (
              <>
                {/* Daily ritual timeline */}
                <DailyTimeline supps={selected} onRemove={removeSupp} />

                {/* Wellness impact */}
                <div style={{ marginTop: 22 }}>
                  <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                    Wellness signal · live
                  </div>
                  <WellnessBars scores={scores} />
                </div>

                {/* Issues / suggestions */}
                {issues.length > 0 && (
                  <div style={{ marginTop: 22 }}>
                    <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                      Smart notes
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {issues.map((iss, i) => (
                        <li key={i} style={{
                          padding: "10px 12px",
                          background: iss.kind === "warn" ? "#fef3c7" : "#f3f4f6",
                          color: iss.kind === "warn" ? "#92400e" : TH.inkSoft,
                          borderRadius: 10, fontSize: 12.5, lineHeight: 1.45,
                          display: "flex", gap: 8,
                        }}>
                          <span aria-hidden style={{ fontSize: 13, flexShrink: 0 }}>{iss.kind === "warn" ? "⚠" : "ℹ"}</span>
                          <span>{iss.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action footer */}
          {selected.length > 0 && (
            <div style={{
              borderTop: `1px solid ${TH.edge}`, padding: "14px 18px",
              display: "flex", flexDirection: "column", gap: 8, background: TH.bg,
            }}>
              <button onClick={buyAll} style={{
                padding: "13px 16px", background: TH.ink, color: TH.surface,
                border: "none", borderRadius: 12, cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Buy all on iHerb
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={shareUrl} style={secondaryBtn()}>Share link</button>
                <button onClick={clearAll} style={secondaryBtn("#b91c1c")}>Clear stack</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile floating stack button */}
      {selected.length > 0 && (
        <button
          onClick={() => setStackDrawerOpen(true)}
          style={{
            display: "var(--build-mobile-cta)",
            position: "fixed", bottom: 22, left: 18, right: 18, zIndex: 80,
            padding: "16px 20px", borderRadius: 999,
            background: TH.ink, color: TH.surface, border: "none",
            fontWeight: 600, fontSize: 15, cursor: "pointer",
            boxShadow: "0 10px 30px rgba(10,37,64,0.35)",
            alignItems: "center", justifyContent: "space-between",
          }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: TH.sage, color: TH.ink, borderRadius: 999, padding: "2px 9px", fontSize: 12, ...MM }}>{selected.length}</span>
            View your stack
          </span>
          <span style={{ fontSize: 13, opacity: 0.85 }}>${totalCost}/mo</span>
        </button>
      )}

      {/* Mobile drawer */}
      {stackDrawerOpen && (
        <div onClick={() => setStackDrawerOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(10,37,64,0.4)", display: "flex", alignItems: "flex-end",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "100%", maxHeight: "90vh", background: TH.surface,
            borderTopLeftRadius: 22, borderTopRightRadius: 22,
            display: "flex", flexDirection: "column",
            animation: "sd-rise .25s ease-out",
          }}>
            <StackHeader name={stackName} onName={setStackName} count={selected.length} total={totalCost} onClose={() => setStackDrawerOpen(false)} />
            <div style={{ overflowY: "auto", padding: "14px 18px", flex: 1 }}>
              <DailyTimeline supps={selected} onRemove={removeSupp} />
              <div style={{ marginTop: 22 }}>
                <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>Wellness signal</div>
                <WellnessBars scores={scores} />
              </div>
              {issues.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {issues.map((iss, i) => (
                    <li key={i} style={{
                      padding: "10px 12px",
                      background: iss.kind === "warn" ? "#fef3c7" : "#f3f4f6",
                      color: iss.kind === "warn" ? "#92400e" : TH.inkSoft,
                      borderRadius: 10, fontSize: 12.5, lineHeight: 1.45,
                    }}>{iss.kind === "warn" ? "⚠ " : "ℹ "}{iss.text}</li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${TH.edge}`, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={buyAll} style={{
                padding: "14px 16px", background: TH.ink, color: TH.surface,
                border: "none", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 500,
              }}>Buy all on iHerb</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={shareUrl} style={secondaryBtn()}>Share</button>
                <button onClick={clearAll} style={secondaryBtn("#b91c1c")}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {savedToast && (
        <div role="status" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: TH.ink, color: TH.surface, padding: "12px 18px", borderRadius: 999,
          fontSize: 13.5, fontWeight: 500, zIndex: 120,
          boxShadow: "0 14px 38px rgba(10,37,64,0.32)",
          animation: "sd-rise .25s ease-out",
        }}>
          {savedToast}
        </div>
      )}

      {/* Responsive layout variables (scoped to /build only) */}
      <style>{`
        :root {
          --build-cols: 1fr 380px;
          --build-mobile-cta: none;
        }
        @media (max-width: 1100px) {
          :root {
            --build-cols: 1fr;
            --build-mobile-cta: flex;
          }
          aside[data-stack-panel] { display: none; }
        }
      `}</style>
    </main>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function secondaryBtn(color = TH.ink as string): React.CSSProperties {
  return {
    padding: "11px 14px", background: TH.surface, color,
    border: `1px solid ${TH.edge}`, borderRadius: 12,
    cursor: "pointer", fontSize: 13.5, fontWeight: 500,
  };
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; label: string }[];
}) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: TH.inkSoft }}>
      {label}:
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: "5px 10px", border: `1px solid ${TH.edge}`, borderRadius: 8,
        background: TH.surface, fontSize: 13, color: TH.ink, cursor: "pointer",
      }}>
        {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </label>
  );
}

function SuppCard({ supp, added, flashed, onAdd }: {
  supp: Supplement; added: boolean; flashed: boolean; onAdd: () => void;
}) {
  const t = TIMING_META[supp.timing];
  return (
    <button onClick={onAdd}
      aria-pressed={added}
      style={{
        position: "relative", textAlign: "left",
        padding: "14px 14px 12px", borderRadius: 14,
        background: added ? "#f0f9f3" : TH.surface,
        border: `1.5px solid ${added ? TH.sage : TH.edge}`,
        cursor: "pointer",
        transition: "transform .15s, box-shadow .15s, border-color .15s, background .2s",
        display: "flex", flexDirection: "column", gap: 6,
        minHeight: 132,
        animation: flashed ? "sd-pulse .6s ease-out" : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 22px rgba(10,37,64,0.08)"; if (!added) e.currentTarget.style.borderColor = TH.inkSoft; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; if (!added) e.currentTarget.style.borderColor = TH.edge; }}
    >
      {/* Top row: timing + price + checkmark */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          ...MM, fontSize: 10, padding: "3px 8px", borderRadius: 999,
          background: t.bg, color: t.ink, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <span aria-hidden>{t.icon}</span> {t.label}
        </span>
        <span style={{ ...MM, fontSize: 11, color: TH.muted }}>${supp.monthlyCost}/mo</span>
      </div>

      <div style={{ ...D, fontSize: 15, color: TH.ink, lineHeight: 1.25 }}>{supp.name}</div>
      <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.4, flex: 1 }}>{supp.purpose}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{
          fontSize: 10.5, ...MM, color: supp.evidence === "very strong" ? TH.sageDeep : supp.evidence === "strong" ? "#0a6a3e" : TH.muted,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {supp.evidence === "very strong" ? "★★★" : supp.evidence === "strong" ? "★★" : "★"} {supp.evidence}
        </span>
        <span aria-hidden style={{
          width: 24, height: 24, borderRadius: 999,
          background: added ? TH.sage : "transparent",
          border: added ? "none" : `1.5px solid ${TH.edge}`,
          color: added ? TH.surface : TH.muted,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, transition: "all .2s",
        }}>
          {added ? "✓" : "+"}
        </span>
      </div>
    </button>
  );
}

function StackHeader({ name, onName, count, total, onClose }: {
  name: string; onName: (n: string) => void; count: number; total: number;
  onClose?: () => void;
}) {
  return (
    <div style={{
      padding: "16px 18px", borderBottom: `1px solid ${TH.edge}`,
      background: `linear-gradient(180deg, ${TH.bg} 0%, ${TH.surface} 100%)`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", marginBottom: 4 }}>YOUR STACK</div>
          <input value={name} onChange={e => onName(e.target.value)}
            style={{
              ...D, fontSize: 19, color: TH.ink, width: "100%",
              border: "none", outline: "none", background: "transparent",
              padding: 0, margin: 0, letterSpacing: "-0.01em",
            }}
            aria-label="Stack name"
          />
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: TH.muted, padding: 4, fontSize: 18,
          }}>✕</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12.5, color: TH.inkSoft }}>
        <span><strong style={{ color: TH.ink }}>{count}</strong> {count === 1 ? "supplement" : "supplements"}</span>
        <span>·</span>
        <span><strong style={{ color: TH.ink }}>${total}</strong>/month</span>
      </div>
    </div>
  );
}

function EmptyStack() {
  return (
    <div style={{
      padding: "32px 14px", textAlign: "center", color: TH.muted,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 999, background: TH.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, color: TH.muted,
      }} aria-hidden>✦</div>
      <div style={{ ...D, fontSize: 16, color: TH.ink }}>Start adding ingredients</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 260 }}>
        Click any ingredient from the library, or load a quick-start template above.
      </div>
    </div>
  );
}

function DailyTimeline({ supps, onRemove }: { supps: Supplement[]; onRemove: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {TIMINGS.map(t => {
        const list = supps.filter(s => s.timing === t);
        const meta = TIMING_META[t];
        if (list.length === 0) return null;
        return (
          <div key={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                ...MM, fontSize: 10, padding: "3px 8px", borderRadius: 999,
                background: meta.bg, color: meta.ink, fontWeight: 600,
              }}>
                {meta.icon} {meta.label}
              </span>
              <span style={{ fontSize: 11, color: TH.muted, ...MM }}>{list.length}</span>
              <span style={{ flex: 1, height: 1, background: TH.edge }} />
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {list.map(s => (
                <li key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", background: TH.bg,
                  borderRadius: 10, fontSize: 13,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 999, background: s.hue, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: TH.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: TH.muted }}>{s.dose} · ${s.monthlyCost}/mo</div>
                  </div>
                  <button onClick={() => onRemove(s.id)} aria-label={`Remove ${s.name}`} style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: TH.muted, padding: 4, fontSize: 13,
                    transition: "color .15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#b91c1c"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = TH.muted; }}
                  >✕</button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function AIDescribeMode({ onApply }: { onApply: (ids: string[]) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const examples = [
    "I want more energy, better focus, and improved sleep.",
    "I'm vegan and want a foundational stack for longevity.",
    "Help me recover faster from training and reduce joint stiffness.",
    "I'm 45 and starting to feel burnt out — calmer baseline, deeper sleep.",
  ];

  const run = useCallback(async () => {
    const t = text.trim();
    if (t.length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-stack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, budget: "medium" }),
      });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error ?? "Couldn't generate a stack.");
      } else {
        onApply((body.stack as { id: string }[]).map(s => s.id));
        setText("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [text, onApply]);

  return (
    <section style={{
      background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
      border: `1px solid ${TH.edge}`,
      borderRadius: 20, padding: "22px 24px", marginBottom: 22,
      animation: "sd-fade-in .5s ease-out",
      boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 10px 28px rgba(10,37,64,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          ...MM, fontSize: 10, padding: "3px 8px", borderRadius: 999,
          background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
          color: TH.surface, fontWeight: 600, letterSpacing: "0.06em",
        }}>AI</span>
        <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: 0, letterSpacing: "-0.015em" }}>
          Describe your goals — we&apos;ll compose the stack
        </h2>
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder='e.g. "I want more energy, better focus, and improved sleep."'
          rows={expanded ? 3 : 2}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "14px 16px",
            border: `1.5px solid ${TH.edge}`, borderRadius: 14,
            fontSize: 15, lineHeight: 1.55,
            fontFamily: FONTS.body, color: TH.ink, background: TH.surface,
            outline: "none", resize: "vertical",
            transition: "border-color .2s, box-shadow .2s",
          }}
          onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {expanded && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {examples.map(ex => (
            <button key={ex} type="button" onClick={() => setText(ex)}
              style={{
                padding: "5px 10px", background: TH.surface,
                border: `1px solid ${TH.edge}`, borderRadius: 999,
                fontSize: 12, color: TH.inkSoft, cursor: "pointer",
              }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 12, display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: TH.muted }}>
          Plain English. We&apos;ll pick {`{4–8}`} ingredients within a medium budget.
        </span>
        <button onClick={run} disabled={loading || text.trim().length < 5}
          style={{
            padding: "10px 18px", borderRadius: 999, border: "none",
            background: loading ? TH.muted : TH.ink, color: TH.surface,
            fontFamily: FONTS.body, fontWeight: 500, fontSize: 13.5,
            cursor: loading || text.trim().length < 5 ? "not-allowed" : "pointer",
            opacity: text.trim().length < 5 ? 0.5 : 1,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
          {loading ? (
            <>
              <span style={{
                width: 12, height: 12, border: `2px solid ${TH.surface}`,
                borderTopColor: "transparent", borderRadius: 999,
                animation: "sd-spin 0.7s linear infinite",
              }} />
              Composing…
            </>
          ) : "Generate stack →"}
        </button>
      </div>
      {error && (
        <div role="alert" style={{
          marginTop: 10, padding: "8px 12px", background: "#fef2f2",
          borderRadius: 10, color: "#991b1b", fontSize: 12.5,
        }}>{error}</div>
      )}
    </section>
  );
}

function WellnessBars({ scores }: { scores: { energy: number; sleep: number; recovery: number; focus: number; stress: number; mood: number } }) {
  const dims: { key: keyof typeof scores; label: string; color: string }[] = [
    { key: "sleep", label: "Sleep", color: "#7a6d92" },
    { key: "energy", label: "Energy", color: "#c4944a" },
    { key: "focus", label: "Focus", color: "#5ba373" },
    { key: "stress", label: "Stress relief", color: "#a78bfa" },
    { key: "recovery", label: "Recovery", color: "#688a6b" },
    { key: "mood", label: "Mood", color: "#ff8b6b" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {dims.map(d => {
        const v = scores[d.key];
        return (
          <div key={d.key}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: TH.inkSoft, marginBottom: 4 }}>
              <span>{d.label}</span>
              <span style={{ ...MM, color: v >= 60 ? TH.sageDeep : v >= 30 ? TH.amberDeep : TH.muted }}>{v}</span>
            </div>
            <div style={{ height: 6, background: TH.bg, borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${Math.max(2, v)}%`, height: "100%",
                background: d.color, borderRadius: 999,
                transition: "width .4s cubic-bezier(.2,.7,.2,1)",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
