import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /auth/signout — clears the user's Supabase session and redirects home.
 * Used by the "Sign out" button on the profile page.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { origin } = new URL(request.url);

  if (!url || !key) {
    return NextResponse.redirect(`${origin}/?error=auth_not_configured`, { status: 303 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* read-only context */ }
      },
    },
  });

  await supabase.auth.signOut();

  // 303 forces the browser to issue a GET to the destination — required after POST
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
