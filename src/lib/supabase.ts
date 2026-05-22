"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client if env vars are configured, otherwise null.
 * This lets the UI gracefully degrade to "demo mode" when Supabase isn't set up yet.
 *
 * To enable:
 *   1. Go to your Supabase project → Settings → API
 *   2. Copy the Project URL and the `anon public` key
 *   3. Add them as environment variables in Vercel:
 *        NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxxx...
 *   4. Redeploy
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
