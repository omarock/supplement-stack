import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif } from "next/font/google";
import ConsentedAnalytics from "@/components/ConsentedAnalytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DeferredWidgets from "@/components/DeferredWidgets";
import { I18nProvider } from "@/components/I18nProvider";
import { getDict } from "@/lib/i18n-dicts";
import { dictExcept, HEAVY_NAMESPACES } from "@/lib/i18n";
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
const fontVariables = `${bricolage.variable} ${inter.variable} ${instrumentSerif.variable}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.suppdoc.io"),
  title: "suppdoc — Personalised Supplement Stacks & Bloodwork Analysis",
  description:
    "Get a personalised supplement stack, check it for interactions, and turn your bloodwork into a plan. Free, evidence-graded, and we don't sell our own pills.",
  applicationName: "suppdoc.io",
  keywords:
    "suppdoc, suppdoc.io, personalised supplement stack, supplement audit, supplement interaction checker, bloodwork supplement analysis, evidence-based supplements, personalized supplements",
  // Favicons come from the app-router file convention: app/favicon.ico,
  // app/icon.png (512, PWA/stores), app/apple-icon.png (180). Next emits the
  // <link> tags automatically, so no explicit `icons` override here.
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
      // Raster brand logo (Google prefers a raster >=112x112 for the brand panel).
      logo: {
        "@type": "ImageObject",
        url: "https://www.suppdoc.io/suppdoc-icon-512.png",
        width: 512,
        height: 512,
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
const THEME_INIT = `(function(){try{var p=localStorage.getItem('sd-theme');document.documentElement.dataset.theme=p==='dark'?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND_JSONLD) }} />
        <I18nProvider locale="en" messages={dictExcept(getDict("en"), HEAVY_NAMESPACES)}>
          {children}
          {/* DeferredWidgets (cookie banner + chat) MUST live inside the provider,
              or CookieConsent's useT() has no i18n context and renders raw
              "cookie.*" keys to every first-time visitor. */}
          <DeferredWidgets />
        </I18nProvider>
        <ConsentedAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
