import type { MetadataRoute } from "next";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { STACKS } from "@/lib/stacks";
import { POSTS } from "@/lib/blog";
import { COMPETITORS } from "@/lib/competitors";
import { RESEARCH } from "@/lib/research";
import { INTERACTIONS, interactionSlug } from "@/lib/interactions";

const BASE = "https://www.suppdoc.io";

export default function sitemap(): MetadataRoute.Sitemap {
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
    // Research subpages — only the curated ones get higher priority
    if (RESEARCH[s.id]) {
      entries.push({
        url: `${BASE}/ingredients/${s.id}/research`,
        lastModified: now, changeFrequency: "monthly", priority: 0.75,
      });
    } else {
      entries.push({
        url: `${BASE}/ingredients/${s.id}/research`,
        lastModified: now, changeFrequency: "monthly", priority: 0.5,
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

  // ─── Tier 4b: interaction checker (index + programmatic pairs) ─────────
  entries.push({
    url: `${BASE}/interactions`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  });
  for (const it of INTERACTIONS) {
    entries.push({
      url: `${BASE}/interactions/${interactionSlug(it.a, it.b)}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    });
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

  // ─── Tier 6: supporting pages ──────────────────────────────────────────
  for (const path of ["/about", "/methodology", "/changelog", "/help", "/contact"]) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now, changeFrequency: "monthly", priority: 0.6,
    });
  }

  // ─── Tier 7: legal ──────────────────────────────────────────────────────
  for (const path of ["/privacy", "/terms", "/disclaimer", "/cookies"]) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now, changeFrequency: "yearly", priority: 0.3,
    });
  }

  return entries;
}
