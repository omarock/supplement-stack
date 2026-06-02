import type { MetadataRoute } from "next";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { STACKS } from "@/lib/stacks";
import { POSTS } from "@/lib/blog";
import { COMPETITORS } from "@/lib/competitors";
import { RESEARCH } from "@/lib/research";
import { INTERACTIONS, interactionSlug, interactionIndexable } from "@/lib/interactions";
import { GOALS } from "@/lib/goals";
import { BIOMARKERS } from "@/lib/biomarkers";
import { TIMING, TIMING_IDS, timingIndexable } from "@/lib/timing";
import { SYMPTOMS, SYMPTOM_SLUGS, symptomIndexable } from "@/lib/symptoms";
import { directionParams } from "@/lib/biomarker-directions";
import { allPublishedDrafts } from "@/lib/agents/store";

const BASE = "https://www.suppdoc.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // ─── Tier 1: highest priority (the 3 services + home) ──────────────────
  entries.push(
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/quiz/express`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/quiz/complete`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/build`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/audit`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/bloodwork`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/bloodwork/history`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/research/state-of-supplement-stacking`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  );

  // ─── Tier 2: stacks index + individual stacks ──────────────────────────
  entries.push({
    url: `${BASE}/stacks`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  });
  for (const stack of STACKS) {
    entries.push({
      url: `${BASE}/stacks/${stack.slug}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    });
  }

  // ─── Tier 3: ingredients index + individual ingredients + research ────
  entries.push({
    url: `${BASE}/ingredients`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  });
  for (const s of SUPPLEMENT_DB) {
    entries.push({
      url: `${BASE}/ingredients/${s.id}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    });
    // Research subpages: ONLY include curated ones. Pages with no RESEARCH entry
    // emit robots noindex, so listing them in the sitemap = "Submitted URL marked
    // noindex" in GSC. Gate inclusion on the same RESEARCH[] guard the page uses.
    if (RESEARCH[s.id]) {
      entries.push({
        url: `${BASE}/ingredients/${s.id}/research`,
        lastModified: now, changeFrequency: "monthly", priority: 0.75,
      });
    }
  }

  // ─── Tier 4: journal index + articles ──────────────────────────────────
  entries.push({
    url: `${BASE}/journal`,
    lastModified: now, changeFrequency: "weekly", priority: 0.8,
  });
  for (const post of POSTS) {
    entries.push({
      url: `${BASE}/journal/${post.slug}`,
      lastModified: new Date(post.date), changeFrequency: "monthly", priority: 0.7,
    });
  }

  // ─── Tier 4a2: agent-published library (DB-backed) ─────────────────────
  // Guarded: if Supabase is unreachable, the sitemap still builds from static
  // data rather than throwing. Only published SEO drafts are listed.
  entries.push({ url: `${BASE}/library`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  try {
    const published = await allPublishedDrafts();
    for (const it of published) {
      if (!it.slug) continue;
      entries.push({
        url: `${BASE}/library/${it.slug}`,
        lastModified: it.approved_at ? new Date(it.approved_at) : now,
        changeFrequency: "monthly", priority: 0.7,
      });
    }
  } catch { /* keep static sitemap on DB error */ }

  // ─── Tier 4b: interaction checker (index + programmatic pairs) ─────────
  entries.push({
    url: `${BASE}/interactions`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  });
  for (const it of INTERACTIONS) {
    // Only list interactions substantive enough to be indexed (short ones emit
    // noindex). Shared guard with the page so they cannot drift.
    if (!interactionIndexable(it)) continue;
    entries.push({
      url: `${BASE}/interactions/${interactionSlug(it.a, it.b)}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    });
  }

  // ─── Tier 4b2: supplement timing ("best time to take X") ───────────────
  entries.push({ url: `${BASE}/timing`, lastModified: now, changeFrequency: "monthly", priority: 0.85 });
  for (const id of TIMING_IDS) {
    // Same word-count gate as the page so the sitemap never lists a noindex URL.
    if (!timingIndexable(TIMING[id])) continue;
    entries.push({ url: `${BASE}/timing/${id}`, lastModified: now, changeFrequency: "monthly", priority: 0.75 });
  }

  // ─── Tier 4b3: symptoms & deficiencies pillar ─────────────────────────
  entries.push({ url: `${BASE}/symptoms`, lastModified: now, changeFrequency: "monthly", priority: 0.85 });
  for (const slug of SYMPTOM_SLUGS) {
    if (!symptomIndexable(SYMPTOMS[slug])) continue;
    entries.push({ url: `${BASE}/symptoms/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.75 });
  }

  // ─── Tier 4c: best-for-goal guides ─────────────────────────────────────
  entries.push({ url: `${BASE}/best`, lastModified: now, changeFrequency: "monthly", priority: 0.85 });
  for (const g of GOALS) {
    entries.push({ url: `${BASE}/best/${g.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // ─── Tier 4d: biomarker guides ─────────────────────────────────────────
  entries.push({ url: `${BASE}/biomarkers`, lastModified: now, changeFrequency: "monthly", priority: 0.85 });
  for (const b of BIOMARKERS) {
    entries.push({ url: `${BASE}/biomarkers/${b.key.replace(/_/g, "-")}`, lastModified: now, changeFrequency: "monthly", priority: 0.75 });
  }
  // Biomarker high/low split (the exact "low ferritin" / "high homocysteine" queries)
  for (const p of directionParams()) {
    entries.push({ url: `${BASE}/biomarkers/${p.marker.replace(/_/g, "-")}/${p.direction}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  }

  // ─── Tier 5: compare pages ─────────────────────────────────────────────
  entries.push({
    url: `${BASE}/compare`,
    lastModified: now, changeFrequency: "monthly", priority: 0.75,
  });
  for (const c of COMPETITORS) {
    entries.push({
      url: `${BASE}/compare/${c.slug}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    });
  }

  // ─── Tier 6: supporting + authority pages ─────────────────────────────
  for (const path of ["/about", "/methodology", "/editorial", "/team", "/changelog", "/help", "/contact"]) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.6,
    });
  }

  // ─── Tier 7: legal ──────────────────────────────────────────────────────
  for (const path of ["/privacy", "/terms", "/disclaimer", "/cookies", "/refunds"]) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now, changeFrequency: "yearly", priority: 0.3,
    });
  }

  // Dedupe by URL (guards against any duplicate slug in the source data leaking
  // two identical <url> entries into the sitemap, which weakens crawl trust).
  const seen = new Set<string>();
  return entries.filter(e => {
    const u = String(e.url);
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}
