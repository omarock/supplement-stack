import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase SSR session refresh (Next.js 16 "proxy" convention, formerly middleware).
 *
 * Without this, the auth cookie is never refreshed on the server, so server
 * components (e.g. getSessionUser()) intermittently see a logged-out state once
 * the short-lived access token expires. Running getUser() here re-issues the
 * cookie on every request, keeping client and server auth in sync.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // IMPORTANT: refresh the session. Do not run other logic between createServerClient
  // and getUser() — it can cause hard-to-debug logout bugs.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets, image optimization, and common
     * static files (so we don't refresh the session for e.g. favicon.ico).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
