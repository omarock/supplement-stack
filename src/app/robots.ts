import type { MetadataRoute } from "next";

// Private surfaces that should never be indexed or trained on.
const DISALLOW = ["/api/", "/admin", "/admin/", "/auth/", "/me", "/me/", "/track"];

// AI crawlers we explicitly welcome, being citable by ChatGPT, Claude,
// Perplexity, and Google AI Overviews is a core part of the GEO strategy.
const AI_BOTS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot",      // OpenAI
  "ClaudeBot", "Claude-Web", "anthropic-ai",       // Anthropic
  "PerplexityBot",                                  // Perplexity
  "Google-Extended",                                // Google AI / Gemini
  "CCBot",                                          // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map(userAgent => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: "https://www.suppdoc.io/sitemap.xml",
    host: "https://www.suppdoc.io",
  };
}
