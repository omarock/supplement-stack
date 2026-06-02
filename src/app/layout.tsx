import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import ConsentedAnalytics from "@/components/ConsentedAnalytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DeferredWidgets from "@/components/DeferredWidgets";
import "./globals.css";

// Self-hosted at build time via next/font: no render-blocking request to Google,
// no layout shift. Each exposes a CSS variable consumed by globals.css and the
// FONTS tokens in lib/theme.ts, so every existing usage keeps working unchanged.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
  fallback: ["system-ui", "sans-serif"],
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "sans-serif"],
});
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  fallback: ["Georgia", "serif"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "monospace"],
});

const fontVariables = `${bricolage.variable} ${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.suppdoc.io"),
  title: "suppdoc.io, personalised supplement stacks, audit & bloodwork analysis",
  description:
    "Get a personalised supplement stack, check it for interactions, and turn your bloodwork into a plan. Free, evidence-graded, and we don't sell our own pills.",
  applicationName: "suppdoc.io",
  keywords:
    "suppdoc, suppdoc.io, personalised supplement stack, supplement audit, supplement interaction checker, bloodwork supplement analysis, evidence-based supplements, personalized supplements",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  verification: {
    google: "g3pNVxrU5kcIHyzAwSKhh3JlUlomQ9c4WpiyBFniDFI",
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
      description: "Evidence-graded supplement platform. Personalised stacks, interaction checking, and bloodwork analysis, we don't sell our own supplements.",
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
    <html lang="en" className={fontVariables}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND_JSONLD) }} />
        {children}
        <DeferredWidgets />
        <ConsentedAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
