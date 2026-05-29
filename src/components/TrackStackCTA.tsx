"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

/**
 * The WOW→HOOK bridge. Shown right after a user gets a stack (quiz/build/audit/
 * bloodwork) to convert a one-time visit into the daily-return tracking loop.
 *
 * Signed-in → enrolls the stack and opens /track.
 * Signed-out → stashes the stack and routes to sign-in, returning to /track.
 */
export default function TrackStackCTA({
  stackName,
  stackIds = [],
  source = "stack",
}: {
  stackName?: string;
  stackIds?: string[];
  source?: string;
}) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) { setSignedIn(false); return; }
    supa.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const start = useCallback(async () => {
    setBusy(true);
    track("track_cta_click", { source, signedIn: Boolean(signedIn) });
    try {
      if (signedIn) {
        await fetch("/api/track/enroll", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ stackName, stackIds }),
        }).catch(() => {});
        router.push("/track");
      } else {
        try { localStorage.setItem("pendingTrackStack", JSON.stringify({ stackName, stackIds })); } catch {}
        router.push("/signin?redirect=/track");
      }
    } finally { setBusy(false); }
  }, [signedIn, stackName, stackIds, router]);

  return (
    <section
      data-source={source}
      style={{
        background: `linear-gradient(135deg, ${TH.ink} 0%, #0d2f4f 100%)`, color: "#fff",
        borderRadius: 20, padding: "24px 26px", display: "flex", alignItems: "center",
        gap: 20, flexWrap: "wrap", justifyContent: "space-between",
        boxShadow: `0 14px 40px -16px ${TH.ink}66`,
      }}
    >
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ ...MM, fontSize: 10.5, color: TH.sage, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Make it stick
        </div>
        <h3 style={{ ...D, fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Is it actually working? Track it.
        </h3>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: 440 }}>
          A 60-second daily check-in turns this stack into a measurable wellness trend — energy, sleep, mood — with a streak to keep you honest.
        </p>
      </div>
      <button
        onClick={start}
        disabled={busy || signedIn === null}
        style={{
          padding: "14px 24px", borderRadius: 999, border: "none", cursor: busy ? "wait" : "pointer",
          background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
          ...D, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: `0 8px 20px -6px ${TH.sage}aa`,
          display: "inline-flex", alignItems: "center", gap: 9,
        }}
      >
        {busy ? "Setting up…" : "Track this stack"}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
