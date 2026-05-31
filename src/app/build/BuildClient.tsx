"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import { getPrimaryProduct, productImage, type ProductOption } from "@/lib/products";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import { TH, FONTS } from "@/lib/theme";
import ThinkingMessages, { PHRASES } from "@/components/ThinkingMessages";
import EvidenceBadge from "@/components/EvidenceBadge";
import { track } from "@/lib/analytics";
import { encodeShareToken } from "@/lib/share";
import type { GenerateResponse } from "@/app/api/generate-stack/route";

// Narrative metadata that turns a list of ids into a "complete stack"
type GeneratedMeta = {
  stackName: string;
  summary: string;
  synergy?: string;
  goals: string[];
  notes?: string[];
  reasons: Record<string, string>; // supplement id -> one-line reason
  poweredBy: "claude" | "rules" | "template";
};

// Resolve the best iHerb + Amazon links for a supplement's primary product
function buyLinks(supp: Supplement): { product: ProductOption | null; iherb: string; amazon: string; image?: string } {
  const p = getPrimaryProduct(supp.id);
  const iherb = p?.productPath
    ? iherbProductLink(p.productPath)
    : iherbLink(p?.searchQuery ?? supp.iherbSearch);
  const amazon = p?.amazonAsin
    ? amazonProductLink(p.amazonAsin)
    : amazonLink(p ? `${p.brand} ${p.productName}` : supp.name);
  return { product: p, iherb, amazon, image: p ? productImage(p) : undefined };
}

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

// Wellness impact estimator, sums tag contributions per supplement
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
    issues.push({ kind: "info", text: "You have both fish-oil and algae omega-3, these overlap. Keep one." });
  }
  const magCount = supps.filter(s => s.id.startsWith("mag-")).length;
  if (magCount > 2) {
    issues.push({ kind: "info", text: `You have ${magCount} magnesium forms, most people only need one (glycinate for sleep, threonate for brain).` });
  }
  if (ids.has("5-htp") && ids.has("tryptophan")) {
    issues.push({ kind: "warn", text: "5-HTP and L-Tryptophan both raise serotonin, combining is rarely needed and can be excessive." });
  }
  if (ids.has("iron") && ids.has("calcium")) {
    issues.push({ kind: "info", text: "Take iron and calcium at least 2 hours apart, calcium blocks iron absorption." });
  }
  if (ids.has("coq10") && ids.has("ubiquinol")) {
    issues.push({ kind: "info", text: "CoQ10 and Ubiquinol are the same nutrient (oxidized vs reduced), pick one." });
  }
  if (ids.has("ashwagandha") && ids.has("rhodiola") && ids.has("eleuthero") && ids.has("ginseng")) {
    issues.push({ kind: "info", text: "You're stacking 4+ adaptogens, usually 2 is enough. Consider trimming." });
  }
  if (ids.has("nmn") && !ids.has("tmg") && !ids.has("b-complex") && !ids.has("methylfolate")) {
    issues.push({ kind: "info", text: "NAD+ precursors (NMN/NR) consume methyl groups, consider adding TMG or B-complex." });
  }
  if (supps.length >= SOFT_CAP) {
    issues.push({ kind: "info", text: `Your stack has ${supps.length} supplements, most well-designed routines stay under 10. Consider focusing.` });
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
  const [generated, setGenerated] = useState<GeneratedMeta | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoRef = useRef<{ ids: string[]; name: string; gen: GeneratedMeta | null } | null>(null);

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
        const parsed = JSON.parse(raw) as { ids: string[]; name?: string; gen?: GeneratedMeta };
        if (Array.isArray(parsed.ids)) {
          setSelectedIds(parsed.ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id)));
          if (parsed.name) setStackName(parsed.name);
          if (parsed.gen) setGenerated(parsed.gen);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: selectedIds, name: stackName, gen: generated }));
    } catch { /* ignore */ }
  }, [selectedIds, stackName, generated]);

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
  // Clear EVERYTHING: stack, generated narrative, name, search + all filters,
  // and the mobile drawer. Offers a one-tap undo instead of a blocking confirm.
  const clearAll = useCallback(() => {
    if (selectedIds.length === 0 && !generated) return;
    undoRef.current = { ids: selectedIds, name: stackName, gen: generated };
    setSelectedIds([]);
    setGenerated(null);
    setStackName("My Custom Stack");
    setSearch("");
    setActiveGoal("all");
    setEvidenceFilter("all");
    setVeganOnly(false);
    setBudgetCap(0);
    setCategoryFilter("all");
    setStackDrawerOpen(false);
    setBuyOpen(false);
    setCanUndo(true);
    toast("Stack cleared");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => { setSavedToast(null); setCanUndo(false); }, 4000);
  }, [selectedIds, generated, stackName, toast]);

  const undoClear = useCallback(() => {
    const snap = undoRef.current;
    if (!snap) return;
    setSelectedIds(snap.ids);
    setStackName(snap.name);
    setGenerated(snap.gen);
    setCanUndo(false);
    setSavedToast(null);
  }, []);

  const loadTemplate = useCallback((tpl: { name: string; description: string; ids: string[] }) => {
    const valid = tpl.ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id));
    setSelectedIds(valid);
    setStackName(tpl.name);
    setGenerated({
      stackName: tpl.name,
      summary: tpl.description,
      goals: [],
      reasons: Object.fromEntries(
        valid.map(id => [id, SUPPLEMENT_DB.find(s => s.id === id)?.why ?? ""])
      ),
      poweredBy: "template",
    });
    toast("Stack loaded, tweak from here.");
  }, [toast]);

  // Share / copy URL, uses /share/[token] for a clean URL with a custom OG preview
  const shareUrl = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (selectedIds.length === 0) {
      toast("Add some supplements before sharing.");
      return;
    }
    const token = encodeShareToken({ ids: selectedIds, name: stackName });
    const link = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Share link copied, paste anywhere to preview.");
    } catch {
      toast(`Copy this: ${link}`);
    }
  }, [selectedIds, stackName, toast]);

  // Open the premium "buy full stack" review modal (per-product links avoid the
  // popup-blocker problem that killed the old open-N-tabs approach).
  const openBuy = useCallback(() => {
    if (selected.length === 0) return;
    track("checkout_click", { count: selected.length, total: totalCost });
    setBuyOpen(true);
  }, [selected.length, totalCost]);

  // Triggered by a direct click inside the modal. We open each product as a new
  // TAB (window.open with no "features" string) — passing a features string makes
  // the browser treat each as a popup window, which is what the popup blocker was
  // killing. Opening plain tabs synchronously inside the click gesture lets Chrome
  // open the whole batch. We null the opener for security (replaces noopener).
  const openAllAt = useCallback((which: "iherb" | "amazon") => {
    if (typeof window === "undefined") return;
    for (const s of selected) {
      const url = buyLinks(s)[which];
      if (!url) continue;
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
    }
  }, [selected]);
  const openAllIherb = useCallback(() => openAllAt("iherb"), [openAllAt]);
  const openAllAmazon = useCallback(() => openAllAt("amazon"), [openAllAt]);

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

      {/* AI mode, describe in plain English. Only when no stack exists yet. */}
      {selected.length === 0 && (
        <AIDescribeMode
          onApply={(res: GenerateResponse) => {
            const valid = res.stack.filter(item => SUPPLEMENT_DB.some(s => s.id === item.id));
            setSelectedIds(valid.map(s => s.id));
            setStackName(res.stackName || "My Custom Stack");
            setGenerated({
              stackName: res.stackName || "My Custom Stack",
              summary: res.summary || "",
              synergy: res.synergy,
              goals: res.goals ?? [],
              notes: res.notes,
              reasons: Object.fromEntries(valid.map(item => [item.id, item.reason])),
              poweredBy: res.poweredBy,
            });
            toast(`Your ${valid.length}-supplement stack is ready.`);
          }}
        />
      )}

      {/* AI-generated / template result, the "complete stack" presentation */}
      {generated && selected.length > 0 && (
        <GeneratedStackResult
          meta={generated}
          supps={selected}
          total={totalCost}
          onBuy={openBuy}
          onClear={clearAll}
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
              <button key={t.name} onClick={() => loadTemplate(t)}
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
        {/* minWidth:0 prevents the classic CSS grid blowout, without it the
            ingredient cards force the column wider than the viewport on mobile. */}
        <section style={{ minWidth: 0 }}>
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
                placeholder={`Search ${SUPPLEMENT_DB.length} ingredients, "magnesium", "sleep", "ashwagandha"…`}
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
        <aside data-stack-panel style={{
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
              <button onClick={openBuy} style={{
                padding: "14px 16px", background: TH.ink, color: TH.surface,
                border: "none", borderRadius: 12, cursor: "pointer",
                fontSize: 14.5, fontWeight: 600, minHeight: 48,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 8px 20px ${TH.ink}22`,
              }}>
                Buy full stack · ${totalCost}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
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
              <button onClick={() => { setStackDrawerOpen(false); openBuy(); }} style={{
                padding: "15px 16px", background: TH.ink, color: TH.surface,
                border: "none", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, minHeight: 50,
              }}>Buy full stack · ${totalCost}</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={shareUrl} style={secondaryBtn()}>Share</button>
                <button onClick={clearAll} style={secondaryBtn("#b91c1c")}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy full stack modal */}
      {buyOpen && (
        <BuyAllModal
          supps={selected}
          name={stackName}
          total={totalCost}
          onOpenAll={openAllIherb}
          onOpenAllAmazon={openAllAmazon}
          onClose={() => setBuyOpen(false)}
        />
      )}

      {/* Toast (with one-tap undo after clearing) */}
      {savedToast && (
        <div role="status" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: TH.ink, color: TH.surface, padding: "10px 12px 10px 18px", borderRadius: 999,
          fontSize: 13.5, fontWeight: 500, zIndex: 120,
          boxShadow: "0 14px 38px rgba(10,37,64,0.32)",
          animation: "sd-rise .25s ease-out",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          {savedToast}
          {canUndo && (
            <button onClick={undoClear} style={{
              background: TH.sage, color: "#fff", border: "none", borderRadius: 999,
              padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONTS.body,
            }}>Undo</button>
          )}
        </div>
      )}

      {/* On mobile, lift the global chat launcher above the floating stack CTA so
          they never overlap (the launcher is a fixed bottom-right button). */}
      {selected.length > 0 && (
        <style>{`
          @media (max-width: 1100px) {
            :root { --chat-launcher-bottom: 92px !important; }
          }
        `}</style>
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
        <EvidenceBadge tier={supp.evidence} size="sm" />
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

function AIDescribeMode({ onApply }: { onApply: (res: GenerateResponse) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const examples = [
    "I want more energy, better focus, and improved sleep.",
    "I'm vegan and want a foundational stack for longevity.",
    "Help me recover faster from training and reduce joint stiffness.",
    "I'm 45 and starting to feel burnt out, calmer baseline, deeper sleep.",
  ];

  const runWith = useCallback(async (raw: string) => {
    const t = raw.trim();
    if (t.length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-stack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, budget: "medium" }),
      });
      const body = (await res.json()) as GenerateResponse;
      if (!body.ok) {
        setError(body.error ?? "Couldn't generate a stack.");
      } else {
        track("stack_generate", { count: body.stack.length, poweredBy: body.poweredBy });
        onApply(body);
        setText("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [onApply]);

  const run = useCallback(() => runWith(text), [runWith, text]);

  // Prefill + auto-compose when arriving from the homepage goal search
  // (/build?goal=…). Consume the param immediately so that clearing the stack,
  // which re-mounts this component, does NOT silently regenerate the same stack.
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("goal");
    if (g && g.trim().length >= 3) {
      window.history.replaceState({}, "", "/build");
      setText(g);
      runWith(g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          Describe your goals, we&apos;ll compose the stack
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
            <ThinkingMessages phrases={PHRASES.generateStack} interval={750} size="sm" />
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

// ─── Generated "complete stack" presentation ───────────────────────────────
function GeneratedStackResult({ meta, supps, total, onBuy, onClear }: {
  meta: GeneratedMeta; supps: Supplement[]; total: number;
  onBuy: () => void; onClear: () => void;
}) {
  const sourceLabel =
    meta.poweredBy === "claude" ? "AI-composed for you" :
    meta.poweredBy === "template" ? "Ready-made stack" : "Composed for you";
  // The strongest evidence tier present, surfaced as a headline trust signal
  const tierRank = { "very strong": 3, strong: 2, moderate: 1 } as const;
  const topTier = supps.reduce<Supplement["evidence"]>((acc, s) =>
    tierRank[s.evidence] > tierRank[acc] ? s.evidence : acc, "moderate");

  return (
    <section style={{
      background: TH.surface, border: `1px solid ${TH.edge}`,
      borderRadius: 24, marginBottom: 22, overflow: "hidden",
      boxShadow: "0 2px 6px rgba(10,37,64,0.05), 0 22px 50px -28px rgba(10,37,64,0.22)",
      animation: "sd-fade-in .5s ease-out",
    }}>
      {/* Header band */}
      <div style={{
        padding: "var(--gen-pad)",
        background: `linear-gradient(135deg, ${TH.sage}12, ${TH.amber}10 60%, ${TH.coral}08)`,
        borderBottom: `1px solid ${TH.edge}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{
            ...MM, fontSize: 10, padding: "3px 9px", borderRadius: 999,
            background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
            color: "#fff", fontWeight: 700, letterSpacing: "0.06em",
          }}>{meta.poweredBy === "template" ? "STACK" : "AI"}</span>
          <span style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {sourceLabel}
          </span>
        </div>
        <h2 style={{ ...D, fontSize: "var(--gen-h2)", letterSpacing: "-0.025em", lineHeight: 1.05, color: TH.ink, margin: 0 }}>
          {meta.stackName}
        </h2>
        {meta.summary && (
          <p style={{ fontSize: 15.5, lineHeight: 1.55, color: TH.inkSoft, margin: "12px 0 0", maxWidth: 720 }}>
            {meta.summary}
          </p>
        )}
        {/* Quick stats */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 16 }}>
          <Stat label="Supplements" value={`${supps.length}`} />
          <Stat label="Monthly cost" value={`$${total}`} />
          <Stat label="Evidence" value={topTier === "very strong" ? "Very strong" : topTier === "strong" ? "Strong" : "Moderate"} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--gen-pad)" }}>
        {meta.synergy && (
          <div style={{
            display: "flex", gap: 12, padding: "14px 16px", marginBottom: 18,
            background: TH.bg, borderRadius: 14, border: `1px solid ${TH.edge}`,
          }}>
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1.3 }}>🧬</span>
            <div>
              <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                Why this stack works
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: TH.inkSoft, margin: 0 }}>{meta.synergy}</p>
            </div>
          </div>
        )}

        {/* Supplement breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "var(--gen-cols)", gap: 12 }}>
          {supps.map(s => {
            const t = TIMING_META[s.timing];
            const reason = meta.reasons[s.id] || s.why;
            return (
              <div key={s.id} style={{
                border: `1px solid ${TH.edge}`, borderRadius: 16, padding: 16,
                display: "flex", flexDirection: "column", gap: 9, background: TH.surface,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: s.hue, flexShrink: 0 }} />
                    <Link href={`/ingredients/${s.id}`} style={{ ...D, fontSize: 15.5, color: TH.ink, textDecoration: "none", lineHeight: 1.25 }}>
                      {s.name}
                    </Link>
                  </div>
                  <span style={{
                    ...MM, fontSize: 10, padding: "3px 8px", borderRadius: 999,
                    background: t.bg, color: t.ink, fontWeight: 600, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}><span aria-hidden>{t.icon}</span>{t.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ ...MM, fontSize: 12, color: TH.ink, background: TH.bg, padding: "3px 9px", borderRadius: 8 }}>{s.dose}</span>
                  <EvidenceBadge tier={s.evidence} size="sm" />
                  <span style={{ ...MM, fontSize: 11.5, color: TH.muted }}>${s.monthlyCost}/mo</span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: TH.inkSoft, margin: 0 }}>{reason}</p>
                {s.warnings && s.warnings.length > 0 && (
                  <div style={{
                    fontSize: 12, color: "#92400e", background: "#fef3c7",
                    borderRadius: 8, padding: "7px 10px", lineHeight: 1.4,
                  }}>
                    ⚠ Check with a clinician if you have: {s.warnings.join(", ").replace(/-/g, " ")}.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {meta.notes && meta.notes.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {meta.notes.map((n, i) => (
              <li key={i} style={{
                padding: "10px 12px", background: "#f3f4f6", color: TH.inkSoft,
                borderRadius: 10, fontSize: 12.5, lineHeight: 1.45, display: "flex", gap: 8,
              }}><span aria-hidden>ℹ</span><span>{n}</span></li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
          <button onClick={onBuy} style={{
            flex: "1 1 240px", minHeight: 52, padding: "0 22px", borderRadius: 999, border: "none",
            background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
            fontFamily: FONTS.body, fontWeight: 600, fontSize: 15.5, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
            boxShadow: `0 10px 22px -6px ${TH.sage}80`,
          }}>
            Buy full stack · ${total}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
          <button onClick={onClear} style={{
            minHeight: 52, padding: "0 22px", borderRadius: 999,
            background: TH.surface, color: TH.inkSoft, border: `1px solid ${TH.edgeStrong}`,
            fontFamily: FONTS.body, fontWeight: 500, fontSize: 14.5, cursor: "pointer",
          }}>Start over</button>
        </div>
        <p style={{ fontSize: 12, color: TH.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
          Fine-tune it below, add or remove any ingredient, the stack panel updates live.
        </p>
      </div>

      <style>{`
        :root { --gen-pad: 30px; --gen-h2: 30px; --gen-cols: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
        @media (max-width: 640px) { :root { --gen-pad: 20px; --gen-h2: 24px; } }
      `}</style>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ ...D, fontSize: 22, color: TH.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      <div style={{ ...MM, fontSize: 10, color: TH.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─── Buy full stack modal ───────────────────────────────────────────────────
function BuyAllModal({ supps, name, total, onOpenAll, onOpenAllAmazon, onClose }: {
  supps: Supplement[]; name: string; total: number;
  onOpenAll: () => void; onOpenAllAmazon: () => void; onClose: () => void;
}) {
  const showAmazon = amazonEnabled();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 130,
      background: "rgba(10,37,64,0.55)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "var(--buy-pad)", overflowY: "auto", animation: "sd-fade-in .25s ease-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: TH.bg, borderRadius: 24, maxWidth: 620, width: "100%",
        boxShadow: "0 30px 80px rgba(10,37,64,0.3)", animation: "sd-rise .3s cubic-bezier(.4,0,.2,1)",
        position: "relative", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 24px", borderBottom: `1px solid ${TH.edge}`, background: TH.surface }}>
          <button onClick={onClose} aria-label="Close" style={{
            position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: 999,
            background: TH.bg, border: `1px solid ${TH.edge}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: TH.ink,
          }}>×</button>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Buy your full stack
          </div>
          <h2 style={{ ...D, fontSize: 24, color: TH.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{name}</h2>
          <div style={{ fontSize: 13.5, color: TH.inkSoft, marginTop: 6 }}>
            {supps.length} {supps.length === 1 ? "product" : "products"} · ~${total}/month · third-party-tested brands
          </div>
        </div>

        {/* One-tap open all */}
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <button onClick={onOpenAll} style={{
              width: "100%", minHeight: 52, borderRadius: 14, border: "none", cursor: "pointer",
              background: TH.ink, color: "#fff", fontFamily: FONTS.body, fontWeight: 600, fontSize: 15,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
              boxShadow: `0 8px 20px ${TH.ink}22`,
            }}>
              Open all {supps.length} on iHerb
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </button>
            {showAmazon && (
              <button onClick={onOpenAllAmazon} style={{
                width: "100%", minHeight: 52, borderRadius: 14, border: "1px solid #e3ac00", cursor: "pointer",
                background: "#ffd814", color: "#0f1111", fontFamily: FONTS.body, fontWeight: 600, fontSize: 15,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
                boxShadow: "0 8px 20px rgba(227,172,0,0.25)",
              }}>
                Open all {supps.length} on Amazon
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </button>
            )}
          </div>
          <p style={{ fontSize: 11.5, color: TH.muted, textAlign: "center", margin: "9px 0 0", lineHeight: 1.45 }}>
            Opens one tab per product. If your browser blocks them, allow pop-ups for suppdoc.io, or use the per-product buttons below.
          </p>
        </div>

        {/* Per-product list */}
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {supps.map(s => {
            const { product, iherb, amazon, image } = buyLinks(s);
            const t = TIMING_META[s.timing];
            return (
              <div key={s.id} style={{
                display: "flex", gap: 12, padding: 12, background: TH.surface,
                border: `1px solid ${TH.edge}`, borderRadius: 14, alignItems: "center",
              }}>
                {/* Image / fallback */}
                <div style={{
                  width: 56, height: 56, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                  background: "#fff", border: `1px solid ${TH.edge}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={s.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                  ) : (
                    <span style={{ width: 18, height: 30, borderRadius: 9, background: s.hue }} />
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...D, fontSize: 14, color: TH.ink, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product ? product.productName : s.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: TH.muted, marginTop: 2 }}>
                    {product ? `${product.brand} · ` : ""}{s.dose} · <span style={{ color: t.ink }}>{t.label}</span>
                  </div>
                </div>
                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <a href={iherb} target="_blank" rel="noopener noreferrer sponsored" style={{
                    padding: "8px 12px", borderRadius: 999, background: TH.ink, color: "#fff",
                    textDecoration: "none", fontSize: 12, fontWeight: 600, textAlign: "center", minWidth: 92,
                  }}>iHerb{product ? ` · $${product.approxPrice}` : ""}</a>
                  {showAmazon && (
                    <a href={amazon} target="_blank" rel="noopener noreferrer sponsored" style={{
                      padding: "8px 12px", borderRadius: 999, background: "#ffd814", color: "#0f1111",
                      textDecoration: "none", fontSize: 12, fontWeight: 600, textAlign: "center",
                      border: "1px solid #fcd200",
                    }}>Amazon</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: TH.muted, textAlign: "center", padding: "0 24px 22px", lineHeight: 1.6, margin: 0 }}>
          Prices are approximate and may vary. We may earn a commission on qualifying purchases, at no extra cost to you.
        </p>
      </div>
      <style>{`
        :root { --buy-pad: 40px 16px; }
        @media (max-width: 640px) { :root { --buy-pad: 0; } }
      `}</style>
    </div>
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
