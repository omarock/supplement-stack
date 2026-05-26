import type { NextConfig } from "next";

// Security headers applied to every response — protects against XSS,
// clickjacking, MIME-sniffing, and forces HTTPS.
const securityHeaders = [
  {
    // Force the browser to use HTTPS for 2 years; include subdomains;
    // eligible for preload list submission
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Prevents MIME-type sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Block iframes from other origins (clickjacking protection)
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Modern replacement for X-Frame-Options + more
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    // Don't leak the full URL when navigating to external sites
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Cross-Origin policies — light but non-breaking
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
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
