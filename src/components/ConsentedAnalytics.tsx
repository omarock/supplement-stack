"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { analyticsAllowed, CONSENT_EVENT } from "@/lib/consent";

/**
 * GDPR-correct analytics: Vercel Analytics only mounts once the user has
 * explicitly allowed analytics cookies, and unmounts again if they withdraw
 * consent. Until then, nothing is loaded or sent.
 */
export default function ConsentedAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return allowed ? <Analytics /> : null;
}
