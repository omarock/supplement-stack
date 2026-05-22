"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";

const th = {
  bg: "#f4ede1", ink: "#1c1d18", inkSoft: "#5b5d52",
  sage: "#4a6a4e", burgundy: "#7d2e3a",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setMsg("Supabase isn't configured. Redirecting…");
      setTimeout(() => router.push("/"), 1500);
      return;
    }

    async function run() {
      const code = params.get("code");

      // Modern PKCE flow: exchange the code for a session
      if (code) {
        const { error } = await supa!.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg(`Sign-in failed: ${error.message}. Redirecting…`);
          setTimeout(() => router.push("/signin"), 2500);
          return;
        }
      }

      // Verify a session now exists (works for both PKCE and legacy hash flows)
      const { data } = await supa!.auth.getSession();
      if (data.session) {
        setMsg("Signed in. Redirecting…");
        const hasResults = typeof window !== "undefined" && localStorage.getItem("phylaQuizData");
        setTimeout(() => router.push(hasResults ? "/results" : "/"), 600);
      } else {
        setMsg("Couldn't sign you in. Redirecting…");
        setTimeout(() => router.push("/signin"), 1500);
      }
    }

    run();
  }, [router, params]);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <svg width="56" height="56" viewBox="0 0 24 24"
          style={{ animation: "phyla-sway 3s ease-in-out infinite", marginBottom: 24 }}>
          <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
          <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
          <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
          <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
        </svg>
        <h1 style={{ ...S, fontSize: 36, color: th.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          {msg}
        </h1>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
