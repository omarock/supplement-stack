"use client";

import { FONTS } from "@/lib/theme";

/** Premium "download / print" trigger for the plan page (browser print → Save as PDF). */
export default function PrintButton({ label = "Download / print plan" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999,
        border: "1px solid rgba(10,37,64,0.14)", background: "#fff", color: "#0a2540", cursor: "pointer",
        fontFamily: FONTS.display, fontWeight: 600, fontSize: 14,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
      {label}
    </button>
  );
}
