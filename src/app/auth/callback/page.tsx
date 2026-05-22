"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const th = {
  bg: "#f4ede1", ink: "#1c1d18", inkSoft: "#5b5d52",
  sage: "#4a6a4e", burgundy: "#7d2e3a",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setMsg("Supabase isn't configured yet. Redirecting…");
      setTimeout(() => router.push("/"), 1500);
      return;
    }

    // Supabase handles the session via the URL hash automatically.
    // Once the session is set, redirect to the results or home page.
    supa.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (data.session) {
        setMsg("Signed in. Redirecting…");
        // If user had quiz results, go to results, else home
        const hasResults = typeof window !== "undefined" && localStorage.getItem("phylaQuizData");
        router.push(hasResults ? "/results" : "/");
      } else {
        setMsg("Couldn't sign you in. Redirecting…");
        setTimeout(() => router.push("/signin"), 1500);
      }
    });
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center" }}>
        <svg width="56" height="56" viewBox="0 0 24 24" style={{ animation: "phyla-sway 3s ease-in-out infinite", marginBottom: 24 }}>
          <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
          <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
          <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
          <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
        </svg>
        <h1 style={{ ...S, fontSize: 36, color: th.ink, margin: 0, letterSpacing: "-0.02em" }}>{msg}</h1>
      </div>
    </div>
  );
}
