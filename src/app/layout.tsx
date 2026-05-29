import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "@/components/CookieConsent";
import ChatAssistant from "@/components/ChatAssistant";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.suppdoc.io"),
  title: "suppdoc.io, AI supplement stacks, audit & bloodwork analysis",
  description:
    "suppdoc is the evidence-graded AI supplement platform. Get a personalised stack, check your supplements for interactions, and turn your bloodwork into a plan, free, grounded in published research. We don't sell our own pills.",
  applicationName: "suppdoc.io",
  keywords:
    "suppdoc, suppdoc.io, AI supplement stack, supplement audit, supplement interaction checker, bloodwork supplement analysis, evidence-based supplements, personalized supplements",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

// Brand entity for Google + AI search ("suppdoc" knowledge). Add real social
// profile URLs to `sameAs` once they exist to strengthen the brand panel.
const BRAND_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.suppdoc.io/#org",
      name: "suppdoc",
      alternateName: "suppdoc.io",
      url: "https://www.suppdoc.io",
      logo: "https://www.suppdoc.io/favicon.svg",
      description: "Evidence-graded AI supplement platform. Personalised stacks, interaction checking, and bloodwork analysis, we don't sell our own supplements.",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.suppdoc.io/#website",
      url: "https://www.suppdoc.io",
      name: "suppdoc.io",
      publisher: { "@id": "https://www.suppdoc.io/#org" },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND_JSONLD) }} />
        {children}
        <ChatAssistant />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
