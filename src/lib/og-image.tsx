import { ImageResponse } from "next/og";

/**
 * Shared Open Graph / social-share image generator for suppdoc.io.
 *
 * Next.js does NOT inherit a parent route's opengraph-image into sibling route
 * trees, so every programmatic hub (/best, /products, /symptoms, /timing, ...)
 * needs its own `opengraph-image.tsx`. Each one is a 3-line wrapper that calls
 * `ogResponse(...)` below, so the look stays identical and there is one place
 * to change the brand treatment.
 *
 * 1200x630 is the Facebook/LinkedIn/Pinterest Rich-Pin standard. Kept dependency
 * free (no dataset imports) so the edge bundle stays tiny.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** "muscle-growth" -> "Muscle Growth". Safe for slugs; leaves unknown text alone. */
export function prettifySlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\bvs\b/gi, "vs")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function ogResponse({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f6f5f1 0%, #ede9d8 100%)",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Sage-to-amber accent stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #5ba373 0%, #e8a04a 100%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 52 }}>
          <svg width="56" height="56" viewBox="0 0 40 40" style={{ display: "block" }}>
            <path d="M 20 36 Q 20 24 20 12" stroke="#3f7a52" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill="#5ba373" />
            <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill="#e8a04a" />
            <circle cx="20" cy="10" r="4" fill="#e8a04a" />
          </svg>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#0a2540",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            suppdoc<span style={{ color: "#5ba373" }}>.io</span>
          </div>
        </div>

        {eyebrow ? (
          <div
            style={{
              fontSize: 22,
              color: "#5ba373",
              letterSpacing: "0.18em",
              marginBottom: 18,
              fontWeight: 600,
              display: "flex",
            }}
          >
            {eyebrow.toUpperCase()}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 82,
            lineHeight: 1.05,
            color: "#0a2540",
            fontWeight: 400,
            fontFamily: "Georgia, serif",
            letterSpacing: "-0.03em",
            marginBottom: 24,
            display: "flex",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: 32,
              color: "#3c4858",
              lineHeight: 1.35,
              display: "flex",
              maxWidth: 980,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {/* Bottom proof strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 30,
            borderTop: "2px solid rgba(10,37,64,0.1)",
          }}
        >
          <div style={{ display: "flex", gap: 40, fontSize: 22, color: "#3c4858", fontWeight: 500 }}>
            <span>200+ ingredients</span>
            <span>Evidence-graded</span>
            <span>No house brand</span>
          </div>
          <div
            style={{
              padding: "14px 30px",
              borderRadius: 999,
              background: "#0a2540",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 600,
              display: "flex",
            }}
          >
            suppdoc.io
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
