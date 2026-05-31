"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { analyticsAllowed, CONSENT_EVENT } from "@/lib/consent";

/**
 * GDPR-correct Google Analytics (GA4). The gtag script only loads once the user
 * has explicitly allowed analytics cookies, mirroring ConsentedAnalytics.
 * Until then, nothing is requested from Google.
 */
const GA_ID = "G-GZWGZ2NZLS";

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
