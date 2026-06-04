"use client";

import Link from "next/link";
import { useId } from "react";
import { TH, FONTS } from "@/lib/theme";

/**
 * The sprout mark, stem reaching up with two leaves and a glowing amber bud.
 */
export function SDMark({ size = 28, monoColor }: { size?: number; monoColor?: string }) {
  const id = useId().replace(/:/g, "");
  if (monoColor) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
        <path d="M 20 36 Q 20 24 20 12" stroke={monoColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill={monoColor} />
        <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill={monoColor} />
        <circle cx="20" cy="10" r="3.5" fill={monoColor} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sd-stem-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={TH.sageDeep} />
          <stop offset="100%" stopColor={TH.sage} />
        </linearGradient>
        <linearGradient id={`sd-lf-l-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={TH.sage} />
          <stop offset="100%" stopColor="#a8c97a" />
        </linearGradient>
        <linearGradient id={`sd-lf-r-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={TH.sage} />
          <stop offset="100%" stopColor={TH.amber} />
        </linearGradient>
        <radialGradient id={`sd-bud-${id}`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#ffe0a8" />
          <stop offset="60%" stopColor={TH.amber} />
          <stop offset="100%" stopColor={TH.amberDeep} />
        </radialGradient>
        <radialGradient id={`sd-bud-glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f5c280" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f5c280" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="10" r="8" fill={`url(#sd-bud-glow-${id})`} />
      <path d="M 20 36 Q 20 24 20 12"
        stroke={`url(#sd-stem-${id})`} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill={`url(#sd-lf-l-${id})`} />
      <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill={`url(#sd-lf-r-${id})`} />
      <circle cx="20" cy="10" r="3.6" fill={`url(#sd-bud-${id})`} />
      <circle cx="19" cy="9" r="1.2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

/**
 * Wordmark: "suppdoc.io" with .io in accent color
 */
export function SDWordmark({
  size = 22, color = TH.ink, accent = TH.sageDeep, weight = 600,
}: {
  size?: number; color?: string; accent?: string; weight?: number;
}) {
  return (
    <span style={{
      fontFamily: FONTS.display,
      fontSize: size, fontWeight: weight, letterSpacing: "-0.03em",
      color, display: "inline-flex", alignItems: "baseline", lineHeight: 1,
    }}>
      suppdoc<span style={{ color: accent, fontWeight: weight, letterSpacing: "-0.02em" }}>.io</span>
    </span>
  );
}

/**
 * Combined logo (mark + wordmark) with optional link wrap.
 */
export default function SuppdocLogo({
  size = 22, color, accent, asLink = true, href = "/",
}: {
  size?: number; color?: string; accent?: string;
  asLink?: boolean; href?: string;
}) {
  const content = (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      textDecoration: "none",
    }}>
      <SDMark size={Math.round(size * 1.3)} />
      <SDWordmark size={size} color={color} accent={accent} />
    </span>
  );
  if (asLink) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}
