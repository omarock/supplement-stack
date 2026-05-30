"use client";

import { TH } from "@/lib/theme";
import { openConsentPreferences } from "@/lib/consent";

/** Footer link that re-opens the cookie consent banner (withdraw/change consent). */
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        fontSize: 14, color: TH.muted, fontFamily: "inherit", textAlign: "left",
      }}
    >
      Cookie preferences
    </button>
  );
}
