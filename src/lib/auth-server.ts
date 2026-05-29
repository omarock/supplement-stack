import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Resolve the signed-in user from the request cookies (server-side only).
 * Returns { id, email } or null. Use this in API route handlers that write
 * personal data so the identity comes from the verified session, never the body.
 */
export async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* noop — route handlers don't refresh the session here */ },
    },
  });

  const { data: { user } } = await supa.auth.getUser();
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}
