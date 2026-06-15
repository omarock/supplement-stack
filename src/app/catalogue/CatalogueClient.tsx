"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

/** One catalogue entry = an ingredient shown with its bestseller product. */
export interface CatalogueItem {
  id: string;
  name: string;
  purpose: string;
  evidence: "very strong" | "strong" | "moderate";
  category: string;
  price: number;
  brand: string;
  size?: string;
  image?: string;
  hue: string;
  badge?: string;
  vegan: boolean;
  tags: string[];
  buyUrl: string;
  amazonUrl: string;
  href: string;
}

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", elevated: "var(--c-elevated)",
  ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageDeep: "var(--c-sage-deep)", amber: "var(--c-amber)", amberDeep: "var(--c-amber-deep)",
  burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;

// Goal chips → the same ingredient tags the /best/[goal] pages use, so the
// catalogue filter stays consistent with the rest of the site.
const GOAL_FILTERS: { key: string; label: string; tags: string[] }[] = [
  { key: "energy", label: "Energy", tags: ["energy", "low-energy", "afternoon-crash"] },
  { key: "sleep", label: "Sleep", tags: ["sleep", "low-sleep", "sleep-onset", "wake-at-night"] },
  { key: "focus", label: "Focus", tags: ["focus", "brain-fog", "poor-focus", "memory"] },
  { key: "stress", label: "Stress & calm", tags: ["stress", "high-stress", "anxiety"] },
  { key: "mood", label: "Mood", tags: ["low-mood", "mood"] },
  { key: "immunity", label: "Immunity", tags: ["immune", "frequent-illness"] },
  { key: "recovery", label: "Recovery", tags: ["recovery", "active"] },
  { key: "joints", label: "Joints", tags: ["joint", "joint-pain"] },
  { key: "heart", label: "Heart", tags: ["heart"] },
  { key: "longevity", label: "Longevity", tags: ["longevity", "anti-aging"] },
  { key: "gut", label: "Gut", tags: ["gut", "digestive-issues", "bloating"] },
  { key: "beauty", label: "Skin & hair", tags: ["skin", "hair", "beauty"] },
];

const CATEGORY_LABELS: Record<string, string> = {
  vitamins: "Vitamins", minerals: "Minerals", "omega-fats": "Omega & fats", "amino-acids": "Amino acids",
  adaptogens: "Adaptogens", nootropics: "Nootropics", antioxidants: "Antioxidants", sleep: "Sleep",
  joint: "Joint", gut: "Gut", hormonal: "Hormonal", heart: "Heart", performance: "Performance",
  greens: "Greens", specialty: "Specialty",
};

function evidenceMeta(e: CatalogueItem["evidence"]) {
  if (e === "very strong") return { short: "Very strong", bg: "color-mix(in srgb, var(--c-sage) 16%, var(--c-surface))", ink: "var(--c-sage-deep)" };
  if (e === "strong") return { short: "Strong", bg: "color-mix(in srgb, var(--c-sage) 11%, var(--c-surface))", ink: "var(--c-sage-deep)" };
  return { short: "Moderate", bg: "color-mix(in srgb, var(--c-amber) 16%, var(--c-surface))", ink: "var(--c-amber-deep)" };
}
function evidenceRank(e: CatalogueItem["evidence"]) {
  return e === "very strong" ? 3 : e === "strong" ? 2 : 1;
}

type SortKey = "evidence" | "price-asc" | "price-desc" | "name";

export default function CatalogueClient({ items, amazonOn }: { items: CatalogueItem[]; amazonOn: boolean }) {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("evidence");

  const categories = useMemo(() => {
    const present = new Set(items.map(i => i.category));
    return Object.keys(CATEGORY_LABELS).filter(k => present.has(k));
  }, [items]);

  const goalTags = useMemo(() => GOAL_FILTERS.find(g => g.key === goal)?.tags ?? null, [goal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items.filter(it => {
      if (goalTags && !it.tags.some(t => goalTags.includes(t))) return false;
      if (category !== "all" && it.category !== category) return false;
      if (q) {
        const hay = `${it.name} ${it.brand} ${it.purpose} ${it.tags.join(" ")} ${CATEGORY_LABELS[it.category] ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      // evidence (default): strongest first, then having a photo, then cheaper
      return evidenceRank(b.evidence) - evidenceRank(a.evidence)
        || (b.image ? 1 : 0) - (a.image ? 1 : 0)
        || a.price - b.price;
    });
    return out;
  }, [items, query, goalTags, category, sort]);

  const chipBase: CSSProperties = {
    fontSize: 13, padding: "7px 14px", borderRadius: 999, cursor: "pointer",
    border: `1px solid ${th.line}`, background: th.paper, color: th.inkSoft, whiteSpace: "nowrap",
    transition: "background .12s, color .12s, border-color .12s",
  };
  const chipActive: CSSProperties = {
    ...chipBase, background: "color-mix(in srgb, var(--c-sage) 16%, var(--c-surface))",
    color: th.sageDeep, borderColor: "color-mix(in srgb, var(--c-sage) 45%, var(--c-edge))", fontWeight: 600,
  };

  return (
    <>
      {/* Hero — title only (subtitle + stat strip removed per founder) */}
      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 10px", textAlign: "center" }}>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          The <em style={{ color: th.burgundy }}>catalogue</em>.
        </h1>
      </section>

      {/* Controls */}
      <section style={{ padding: "8px var(--section-pad-x) 0" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", paddingBottom: 14, borderBottom: `1px solid ${th.line}` }}>
          {/* search + sort row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 460 }}>
              <span aria-hidden style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: th.inkMute, fontSize: 15 }}>⌕</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search magnesium, vitamin D, omega-3…"
                aria-label="Search the catalogue"
                style={{
                  width: "100%", padding: "11px 14px 11px 38px", borderRadius: 12,
                  border: `1px solid ${th.line}`, background: th.paper, color: th.ink, fontSize: 14, outline: "none",
                }}
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Filter by category"
              style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${th.line}`, background: th.paper, color: th.ink, fontSize: 14 }}
            >
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              aria-label="Sort"
              style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${th.line}`, background: th.paper, color: th.ink, fontSize: 14, marginLeft: "auto" }}
            >
              <option value="evidence">Sort: evidence</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
          {/* goal chips */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
            <button onClick={() => setGoal("all")} style={goal === "all" ? chipActive : chipBase}>All goals</button>
            {GOAL_FILTERS.map(g => (
              <button key={g.key} onClick={() => setGoal(g.key)} style={goal === g.key ? chipActive : chipBase}>{g.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "22px var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: th.inkMute, margin: "0 0 16px" }}>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {goal !== "all" && <> · {GOAL_FILTERS.find(g => g.key === goal)?.label}</>}
            {category !== "all" && <> · {CATEGORY_LABELS[category]}</>}
          </p>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: th.inkSoft }}>
              <p style={{ ...S, fontSize: 26, margin: "0 0 8px", color: th.ink }}>Nothing matches that.</p>
              <p style={{ fontSize: 15, margin: "0 0 18px" }}>Try clearing a filter or searching a different name.</p>
              <button onClick={() => { setQuery(""); setGoal("all"); setCategory("all"); }} style={{ ...chipBase, fontWeight: 600, color: th.ink }}>Clear all filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))", gap: 18 }}>
              {filtered.map(it => <Card key={it.id} it={it} amazonOn={amazonOn} />)}
            </div>
          )}

          {/* Quiz band — keeps the guided funnel visible so the catalogue doesn't cannibalise it */}
          <div style={{
            marginTop: 40, padding: "22px 24px", borderRadius: 18, border: `1px solid ${th.line}`,
            background: "color-mix(in srgb, var(--c-sage) 8%, var(--c-surface))",
            display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ ...S, fontSize: 24, margin: "0 0 4px", color: th.ink, letterSpacing: "-0.01em" }}>Not sure what you actually need?</p>
              <p style={{ fontSize: 14, color: th.inkSoft, margin: 0 }}>Answer a few questions and we&rsquo;ll build a stack from your goals, budget, and what you already take.</p>
            </div>
            <Link href="/quiz" style={{
              flexShrink: 0, padding: "13px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600,
              background: th.burgundy, color: "#fff", textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Take the 2-minute quiz →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({ it, amazonOn }: { it: CatalogueItem; amazonOn: boolean }) {
  const ev = evidenceMeta(it.evidence);
  return (
    <article style={{
      background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18, overflow: "hidden",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Image / placeholder — large, product-forward */}
      <div style={{ position: "relative", height: 232, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${th.line}` }}>
        {it.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={it.image} alt={`${it.name} — ${it.brand}`} loading="lazy" style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain" }} />
        ) : (
          <div aria-hidden style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${it.hue} 12%, #fff)` }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={it.hue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
        )}
        <span style={{
          position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: "4px 10px",
          borderRadius: 999, background: ev.bg, color: ev.ink,
        }}>{ev.short} evidence</span>
        {it.vegan && (
          <span title="Vegan-friendly" style={{
            position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 600, padding: "4px 9px",
            borderRadius: 999, background: "color-mix(in srgb, var(--c-sage) 14%, #fff)", color: th.sageDeep,
          }}>Vegan</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
        <Link href={it.href} style={{ textDecoration: "none" }}>
          <h3 style={{ ...D, fontSize: 16.5, fontWeight: 600, lineHeight: 1.25, color: th.ink, margin: "0 0 3px" }}>{it.name}</h3>
        </Link>
        <p style={{ fontSize: 12.5, color: th.inkMute, margin: "0 0 9px" }}>{it.brand}{it.size ? ` · ${it.size}` : ""}</p>
        <p style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.4, margin: "0 0 16px" }}>{it.purpose}</p>

        <div style={{ marginTop: "auto" }}>
          <div style={{ ...D, fontSize: 19, fontWeight: 600, color: th.ink, marginBottom: 11 }}>~${it.price}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={it.buyUrl} target="_blank" rel="sponsored noopener noreferrer" style={{
              flex: 1, textAlign: "center", padding: "10px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: th.burgundy, color: "#fff", textDecoration: "none", whiteSpace: "nowrap",
            }}>iHerb →</a>
            {amazonOn && (
              <a href={it.amazonUrl} target="_blank" rel="sponsored noopener noreferrer" style={{
                flex: 1, textAlign: "center", padding: "10px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: "transparent", color: th.ink, border: `1px solid ${th.line}`, textDecoration: "none", whiteSpace: "nowrap",
              }}>Amazon →</a>
            )}
          </div>
        </div>
        <Link href={it.href} style={{ fontSize: 12.5, color: th.sageDeep, textDecoration: "none", marginTop: 13, display: "inline-block" }}>
          Details &amp; alternatives →
        </Link>
      </div>
    </article>
  );
}
