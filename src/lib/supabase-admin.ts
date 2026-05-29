import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the SERVICE_ROLE key.
 * BYPASSES RLS, never expose this client to the browser.
 *
 * Required env vars on Vercel:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  ← server-only, NOT prefixed with NEXT_PUBLIC_
 */
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Comma-separated list of admin emails. Configured via ADMIN_EMAILS env var.
 * Example: ADMIN_EMAILS="fakir.omar@gmail.com,partner@example.com"
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
