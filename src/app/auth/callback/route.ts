import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Server-side OAuth / magic-link callback.
 *
 * Why this is a Route Handler (not a page):
 *  - PKCE auth flow stores a "code verifier" in cookies when the user initiates sign-in.
 *  - When they return from Google/email, Supabase sends us a `?code=...` parameter.
 *  - We need to read the verifier cookie + the code, and exchange them for a session.
 *  - This MUST happen server-side so the session cookies get set on the response.
 *  - A client component can't reliably do this, it gets the "PKCE code verifier not found" error.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/results";

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing_code`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/signin?error=supabase_not_configured`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can be called in a Server Component context where cookies are read-only.
          // We can ignore here, the redirect response below will carry the Set-Cookie headers.
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const reason = encodeURIComponent(error.message);
    return NextResponse.redirect(`${origin}/signin?error=${reason}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
