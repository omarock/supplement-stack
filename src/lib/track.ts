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
 * Capture an email signup (e.g. from the quiz email-capture step).
 */
export async function trackEmailSignup(email: string, source: string) {
  const supa = getSupabase();
  if (!supa) return;

  await supa.from("email_signups")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });
}
