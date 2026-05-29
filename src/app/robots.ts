import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't index admin, API routes, auth flows, or user-private surfaces
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/auth/",
          "/me",
          "/me/",
        ],
      },
    ],
    sitemap: "https://www.suppdoc.io/sitemap.xml",
    host: "https://www.suppdoc.io",
  };
}
