import type { NextConfig } from "next";

// Content-Security-Policy: defense against XSS and content-injection.
// Notes:
// - 'unsafe-inline' + 'unsafe-eval' required for Next.js 16 hydration
//   (without these, the app breaks because Next inlines runtime scripts/styles)
// - Allow Cloudinary CDN for product images, Supabase for auth, Google Fonts,
//   Vercel Analytics for stats
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.vercel-analytics.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cloudinary.images-iherb.com https://s3.images-iherb.com https://*.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://*.vercel-analytics.com",
  "frame-ancestors 'self'",
  "frame-src 'self' https://accounts.google.com",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Security headers applied to every response — protects against XSS,
// clickjacking, MIME-sniffing, content injection, and forces HTTPS.
const securityHeaders = [
  {
    // Force the browser to use HTTPS for 2 years; include subdomains;
    // eligible for preload list submission
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Modern Cross-Origin protections (loose preset — won't break embeds)
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Allow Next.js to serve images from iHerb's Cloudinary CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cloudinary.images-iherb.com" },
    ],
  },
};

export default nextConfig;
