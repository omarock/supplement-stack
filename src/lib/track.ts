"use client";

import { getSupabase } from "./supabase";
import type { QuizData } from "@/types/quiz";
import type { Recommendation, Supplement } from "./supplements";
import type { ProductOption } from "./products";

/**
 * Save a completed quiz submission to Supabase.
 * Silently no-ops if Supabase isn't configured.
 */
export async function trackQuizSubmission(data: QuizData, rec: Recommendation) {
  const supa = getSupabase();
  if (!supa) return;

  const { data: { user } } = await supa.auth.getUser();
  const email = user?.email ?? localStorage.getItem("phylaUserEmail") ?? null;

  await supa.from("quiz_submissions").insert({
    user_id: user?.id ?? null,
    email,
    age: data.age,
    gender: data.gender,
    goals: data.goals,
    diet: data.diet,
    budget: data.budget,
    data,
    recommendation: {
      supplements: rec.supplements.map(s => ({
        id: s.id, name: s.name, brand: s.brand, dose: s.dose, timing: s.timing,
      })),
      scores: rec.scores,
      reasoning: rec.reasoning,
    },
    supplement_count: rec.supplements.length,
    total_monthly_cost: rec.totalMonthlyCost,
  });
}

/**
 * Track an iHerb link click. Fire-and-forget.
 */
export async function trackClick(
  supp: Supplement,
  product: ProductOption,
  source: string,
) {
  const supa = getSupabase();
  if (!supa) return;

  const { data: { user } } = await supa.auth.getUser();
  const email = user?.email ?? localStorage.getItem("phylaUserEmail") ?? null;

  await supa.from("link_clicks").insert({
    user_id: user?.id ?? null,
    email,
    supplement_id: supp.id,
    supplement_name: supp.name,
    product_brand: product.brand,
    product_name: product.productName,
    iherb_url: product.productPath
      ? `https://www.iherb.com${product.productPath}`
      : `https://www.iherb.com/search?kw=${encodeURIComponent(product.searchQuery ?? "")}`,
    source_page: source,
  });
}

/**
 * Capture an email signup (quiz email-capture, founding member, etc.).
 *
 * Goes through the server route /api/lead, which (1) stores the lead with the
 * service-role client so it is never blocked by RLS, and (2) emails the founder
 * as a backstop. Returns an honest { ok } so callers can show real success/error
 * states instead of faking success. Never throws.
 */
export async function trackEmailSignup(
  email: string,
  source: string,
  note?: string,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source, note }),
    });
    const body = await res.json().catch(() => ({ ok: false }));
    return { ok: Boolean(body?.ok) };
  } catch {
    return { ok: false };
  }
}
