"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BottleMockup from "@/components/BottleMockup";
import type { ProductOption } from "@/lib/products";

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
  productName: string;
  rating: number;
  image?: string;
  hue: string;
  badge?: string;
  vegan: boolean;
  tags: string[];
  timing: "morning" | "midday" | "evening" | "pre-train";
  tagChips: string[];
  reviewsLabel: string;
  boughtLabel: string;
  buyUrl: string;
  amazonUrl: string;
  href: string;
  altHref: string;
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

function evidenceRank(e: CatalogueItem["evidence"]) {
  return e === "very strong" ? 3 : e === "strong" ? 2 : 1;
}

type SortKey = "evidence" | "price-asc" | "price-desc" | "name";

export default function CatalogueClient({ items, amazonOn }: { items: CatalogueItem[]; amazonOn: boolean }) {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("evidence");

  // Pre-apply / re-apply the filter from the URL (?goal=… / ?cat=…). Reactive to
  // navigation so re-selecting a goal from the nav mega-menu updates the grid even
  // while already on /catalogue (the bug: it used to read the URL only once on mount).
  const searchParams = useSearchParams();
  useEffect(() => {
    const g = searchParams.get("goal");
    setGoal(g && GOAL_FILTERS.some((x) => x.key === g) ? g : "all");
    const c = searchParams.get("cat");
    setCategory(c && CATEGORY_LABELS[c] ? c : "all");
  }, [searchParams]);

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
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
  // BottleMockup only reads brand/productName/size; supply those for image-less items.
  const bottleOption = { brand: it.brand, productName: it.productName, size: it.size ?? "" } as unknown as ProductOption;
  const stars = Math.round(it.rating);
  return (
    <article style={{
      background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 14,
      display: "flex", flexDirection: "column", gap: 10, height: "100%",
      boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 6px 16px rgba(10,37,64,0.04)",
    }}>
      {/* Clean image tile (→ product page); real photo or branded bottle fallback */}
      <Link href={it.href} aria-label={`View ${it.name}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          position: "relative", height: 256, borderRadius: 14, overflow: "hidden",
          background: "#fff", border: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {it.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.image} alt={`${it.name} — ${it.brand}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14 }} />
          ) : (
            <BottleMockup option={bottleOption} height={216} showBackgroundScene={false} />
          )}
        </div>
      </Link>

      {/* Name + brand */}
      <div>
        <Link href={it.href} style={{ textDecoration: "none" }}>
          <h3 style={{ ...D, fontSize: 16.5, fontWeight: 600, lineHeight: 1.25, color: th.ink, margin: "0 0 2px" }}>{it.name}</h3>
        </Link>
        <div style={{ fontSize: 13, color: th.inkSoft }}>{it.brand}{it.size ? ` · ${it.size}` : ""}</div>
      </div>

      {/* Tag chips */}
      {it.tagChips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {it.tagChips.map((t, i) => (
            <span key={i} style={{
              padding: "3px 9px", borderRadius: 6, fontSize: 11.5, fontWeight: 400,
              background: "#f3f4f6", color: "var(--c-ink-soft)", border: "1px solid #e5e7eb", whiteSpace: "nowrap",
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Rating + reviews */}
      {it.rating > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ color: "#ff9900", letterSpacing: "1px", fontSize: 14 }}>
            {"★".repeat(stars)}<span style={{ color: "#e5e7eb" }}>{"★".repeat(5 - stars)}</span>
          </span>
          {it.reviewsLabel && <span style={{ color: th.inkMute }}>({it.reviewsLabel})</span>}
        </div>
      )}
      {it.boughtLabel && (
        <div style={{ fontSize: 12, color: "#565959", marginTop: -4 }}>
          <strong style={{ fontWeight: 600 }}>{it.boughtLabel.split(" ")[0]}</strong>{it.boughtLabel.slice(it.boughtLabel.indexOf(" "))}
        </div>
      )}

      {/* Price */}
      <div style={{ ...D, fontSize: 22, fontWeight: 600, color: th.ink, letterSpacing: "-0.02em", marginTop: 2 }}>
        ${it.price}<span style={{ fontSize: 12, color: th.inkMute, fontWeight: 400, marginLeft: 5 }}>~/month</span>
      </div>

      {/* Buy buttons */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <a href={it.buyUrl} target="_blank" rel="sponsored noopener noreferrer" style={{
          display: "block", textAlign: "center", padding: "12px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
          background: th.burgundy, color: "#fff", textDecoration: "none",
        }}>Buy on iHerb →</a>
        {amazonOn && (
          <a href={it.amazonUrl} target="_blank" rel="sponsored noopener noreferrer" style={{
            display: "block", textAlign: "center", padding: "12px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
            background: "#ffd814", color: "#0f1111", textDecoration: "none", border: "1px solid #fcd200",
          }}>Buy on Amazon →</a>
        )}
        <Link href={it.altHref} style={{ display: "block", textAlign: "center", fontSize: 12.5, color: th.sageDeep, textDecoration: "none", marginTop: 3 }}>
          Details &amp; alternatives →
        </Link>
      </div>
    </article>
  );
}
