import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import ConsentedAnalytics from "@/components/ConsentedAnalytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DeferredWidgets from "@/components/DeferredWidgets";
import { I18nProvider } from "@/components/I18nProvider";
import { getDict } from "@/lib/i18n-dicts";
import { FOUNDER } from "@/lib/social-proof";
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

// Brand entity for Google + AI search ("suppdoc" knowledge graph).
// TODO(founder): add suppdoc.io's REAL public profile URLs below so Google and AI
// engines (ChatGPT/Perplexity/Gemini) can consolidate the "suppdoc" entity. This
// is the single biggest fix for the brand-name collision with suppdoc.co. Each
// must be a live, public URL. Once added, `sameAs` activates automatically.
const BRAND_SAMEAS: string[] = [
  // "https://www.reddit.com/user/<your-handle>",
  // "https://www.producthunt.com/@<your-handle>",
  // "https://x.com/<your-handle>",
  // "https://www.linkedin.com/company/suppdoc",
  // "https://www.instagram.com/<your-handle>",
];

// Founder for the schema is sourced from FOUNDER in @/lib/social-proof — the single
// place to set founder identity (also drives the on-page FounderNote block).

const BRAND_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.suppdoc.io/#org",
      name: "suppdoc",
      alternateName: "suppdoc.io",
      url: "https://www.suppdoc.io",
      // TODO(founder): drop a 512x512 PNG at /public/logo-512.png and switch this
      // url to it (Google prefers a raster logo >=112x112 for the brand result).
      logo: {
        "@type": "ImageObject",
        url: "https://www.suppdoc.io/favicon.svg",
      },
      description: "Evidence-graded supplement platform. Personalised stacks, interaction checking, and bloodwork analysis, we don't sell our own supplements.",
      slogan: "Evidence over hype.",
      email: "hello@suppdoc.io",
      knowsAbout: [
        "dietary supplements",
        "evidence-based supplementation",
        "supplement interactions",
        "supplement dosing and timing",
        "bloodwork and biomarker interpretation",
        "vitamins and minerals",
      ],
      publishingPrinciples: "https://www.suppdoc.io/editorial",
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@suppdoc.io",
        contactType: "customer support",
        availableLanguage: ["en", "fr", "de", "es"],
      },
      ...(BRAND_SAMEAS.length ? { sameAs: BRAND_SAMEAS } : {}),
      ...(FOUNDER
        ? {
            founder: {
              "@type": "Person",
              name: FOUNDER.name,
              ...(FOUNDER.url ? { url: FOUNDER.url } : {}),
              ...(FOUNDER.title ? { jobTitle: FOUNDER.title } : {}),
            },
          }
        : {}),
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

// No-flash theme init: runs before paint, reads the saved preference (or the OS
// setting for "system") and sets <html data-theme>, which the CSS variables in
// globals.css react to. Keeps the first render in the correct theme.
const THEME_INIT = `(function(){try{var p=localStorage.getItem('sd-theme')||'light';var d=p==='dark'||(p==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND_JSONLD) }} />
        <I18nProvider locale="en" messages={getDict("en")}>{children}</I18nProvider>
        <DeferredWidgets />
        <ConsentedAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
