"use client";

import { useId } from "react";
import type { ProductOption } from "@/lib/products";

/**
 * SVG mockup of a supplement bottle.
 * Designed to look like a real product photograph — 3D shading, label, cap.
 * Fully deterministic, no external image loads, never 404s.
 */

const BRAND_THEMES: Record<string, { capColor: string; labelBg: string; labelInk: string; accent: string }> = {
  "NOW Foods":      { capColor: "#c2410c", labelBg: "#fef2e8", labelInk: "#c2410c", accent: "#f59e0b" },
  "Doctor's Best":  { capColor: "#1e40af", labelBg: "#dbeafe", labelInk: "#1e40af", accent: "#3b82f6" },
  "Sports Research":{ capColor: "#92400e", labelBg: "#fef3c7", labelInk: "#92400e", accent: "#d97706" },
  "Jarrow Formulas":{ capColor: "#92400e", labelBg: "#fef3c7", labelInk: "#92400e", accent: "#eab308" },
  "Garden of Life": { capColor: "#065f46", labelBg: "#d1fae5", labelInk: "#065f46", accent: "#10b981" },
  "Thorne":         { capColor: "#1f2937", labelBg: "#f3f4f6", labelInk: "#1f2937", accent: "#374151" },
  "Solgar":         { capColor: "#92400e", labelBg: "#fef3c7", labelInk: "#92400e", accent: "#ca8a04" },
  "Optimum Nutrition":{ capColor: "#854d0e", labelBg: "#fef9c3", labelInk: "#854d0e", accent: "#facc15" },
  "Nordic Naturals":{ capColor: "#1e40af", labelBg: "#dbeafe", labelInk: "#1e40af", accent: "#3b82f6" },
  "Pure Encapsulations":{ capColor: "#3730a3", labelBg: "#e0e7ff", labelInk: "#3730a3", accent: "#6366f1" },
  "Vital Proteins": { capColor: "#3730a3", labelBg: "#e0e7ff", labelInk: "#3730a3", accent: "#6366f1" },
  "KAL":            { capColor: "#92400e", labelBg: "#fef3c7", labelInk: "#92400e", accent: "#d97706" },
  "Host Defense":   { capColor: "#57534e", labelBg: "#f5f5f4", labelInk: "#57534e", accent: "#78716c" },
  "Real Mushrooms": { capColor: "#92400e", labelBg: "#fef3c7", labelInk: "#92400e", accent: "#d97706" },
  "Enzymedica":     { capColor: "#5b21b6", labelBg: "#ede9fe", labelInk: "#5b21b6", accent: "#8b5cf6" },
  "Renew Life":     { capColor: "#1e40af", labelBg: "#dbeafe", labelInk: "#1e40af", accent: "#3b82f6" },
  "Now Foods":      { capColor: "#c2410c", labelBg: "#fef2e8", labelInk: "#c2410c", accent: "#f59e0b" },
  "Gaia Herbs":     { capColor: "#065f46", labelBg: "#d1fae5", labelInk: "#065f46", accent: "#10b981" },
  "MegaFood":       { capColor: "#991b1b", labelBg: "#fee2e2", labelInk: "#991b1b", accent: "#dc2626" },
  "Sambucol":       { capColor: "#5b21b6", labelBg: "#ede9fe", labelInk: "#5b21b6", accent: "#8b5cf6" },
  "Nature's Way":   { capColor: "#065f46", labelBg: "#d1fae5", labelInk: "#065f46", accent: "#10b981" },
  "Source Naturals":{ capColor: "#065f46", labelBg: "#d1fae5", labelInk: "#065f46", accent: "#10b981" },
  "BulkSupplements":{ capColor: "#1f2937", labelBg: "#f3f4f6", labelInk: "#1f2937", accent: "#4b5563" },
  "Qunol":          { capColor: "#3730a3", labelBg: "#e0e7ff", labelInk: "#3730a3", accent: "#6366f1" },
  "Ovega-3":        { capColor: "#065f46", labelBg: "#d1fae5", labelInk: "#065f46", accent: "#10b981" },
};

function getBrandTheme(brand: string) {
  return BRAND_THEMES[brand] ?? {
    capColor: "#3c4858", labelBg: "#f6f5f1", labelInk: "#0a2540", accent: "#5ba373",
  };
}

interface BottleMockupProps {
  option: ProductOption;
  width?: number;
  height?: number;
  showBackgroundScene?: boolean;
}

export default function BottleMockup({
  option, width = 320, height = 240, showBackgroundScene = true,
}: BottleMockupProps) {
  const id = useId().replace(/:/g, "");
  const theme = getBrandTheme(option.brand);
  const parts = option.brand.split(" ");
  const brand1 = parts[0];
  const brand2 = parts.slice(1).join(" ");

  // Bottle dimensions within viewBox
  const bottleW = 110;
  const bottleH = 180;
  const bottleX = (320 - bottleW) / 2;
  const bottleY = 28;
  const capH = 22;
  const labelY = bottleY + capH + 18;
  const labelH = bottleH - capH - 32;

  return (
    <svg
      viewBox="0 0 320 240"
      width={width}
      height={height}
      style={{ display: "block", width: "100%", height: "auto" }}
      role="img"
      aria-label={`${option.brand} ${option.productName} bottle mockup`}
    >
      <defs>
        {/* Backdrop gradient */}
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`${theme.accent}14`} />
          <stop offset="100%" stopColor={`${theme.accent}04`} />
        </linearGradient>

        {/* Cap gradient (top-light, darker bottom) */}
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(theme.capColor, 0.25)} />
          <stop offset="50%" stopColor={theme.capColor} />
          <stop offset="100%" stopColor={darken(theme.capColor, 0.2)} />
        </linearGradient>

        {/* Bottle gradient (white plastic) */}
        <linearGradient id={`bottle-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="15%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fafafa" />
          <stop offset="85%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#d1d5db" />
        </linearGradient>

        {/* Label gradient */}
        <linearGradient id={`label-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={darken(theme.labelBg, 0.05)} />
          <stop offset="15%" stopColor={theme.labelBg} />
          <stop offset="85%" stopColor={theme.labelBg} />
          <stop offset="100%" stopColor={darken(theme.labelBg, 0.05)} />
        </linearGradient>

        {/* Shadow */}
        <radialGradient id={`shadow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(10,37,64,0.18)" />
          <stop offset="100%" stopColor="rgba(10,37,64,0)" />
        </radialGradient>
      </defs>

      {/* Background scene */}
      {showBackgroundScene && (
        <rect x="0" y="0" width="320" height="240" fill={`url(#bg-${id})`} />
      )}

      {/* Floor shadow */}
      <ellipse
        cx="160" cy={bottleY + bottleH + 4}
        rx={bottleW * 0.55} ry={6}
        fill={`url(#shadow-${id})`}
      />

      {/* Bottle body */}
      <path
        d={`M ${bottleX + 6} ${bottleY + capH + 6}
            Q ${bottleX} ${bottleY + capH + 12} ${bottleX} ${bottleY + capH + 20}
            L ${bottleX} ${bottleY + bottleH - 10}
            Q ${bottleX} ${bottleY + bottleH} ${bottleX + 10} ${bottleY + bottleH}
            L ${bottleX + bottleW - 10} ${bottleY + bottleH}
            Q ${bottleX + bottleW} ${bottleY + bottleH} ${bottleX + bottleW} ${bottleY + bottleH - 10}
            L ${bottleX + bottleW} ${bottleY + capH + 20}
            Q ${bottleX + bottleW} ${bottleY + capH + 12} ${bottleX + bottleW - 6} ${bottleY + capH + 6}
            Z`}
        fill={`url(#bottle-${id})`}
        stroke="#d1d5db"
        strokeWidth="0.5"
      />

      {/* Cap */}
      <rect
        x={bottleX + 4}
        y={bottleY}
        width={bottleW - 8}
        height={capH}
        rx="3"
        fill={`url(#cap-${id})`}
        stroke={darken(theme.capColor, 0.15)}
        strokeWidth="0.5"
      />
      {/* Cap ridge */}
      <rect
        x={bottleX + 6}
        y={bottleY + capH - 4}
        width={bottleW - 12}
        height={3}
        fill={darken(theme.capColor, 0.25)}
        opacity="0.5"
      />

      {/* Label */}
      <rect
        x={bottleX + 4}
        y={labelY}
        width={bottleW - 8}
        height={labelH}
        rx="2"
        fill={`url(#label-${id})`}
        stroke={darken(theme.labelBg, 0.08)}
        strokeWidth="0.4"
      />

      {/* Brand text on label */}
      <text
        x={bottleX + bottleW / 2}
        y={labelY + 22}
        textAnchor="middle"
        fontFamily='"Bricolage Grotesque", system-ui, sans-serif'
        fontSize="14"
        fontWeight="700"
        fill={theme.labelInk}
        style={{ letterSpacing: "-0.02em" }}
      >
        {brand1.toUpperCase()}
      </text>
      {brand2 && (
        <text
          x={bottleX + bottleW / 2}
          y={labelY + 38}
          textAnchor="middle"
          fontFamily='"Bricolage Grotesque", system-ui, sans-serif'
          fontSize="9"
          fontWeight="600"
          fill={theme.labelInk}
          opacity="0.8"
          style={{ letterSpacing: "0.05em" }}
        >
          {brand2.toUpperCase()}
        </text>
      )}

      {/* Divider line on label */}
      <line
        x1={bottleX + 18}
        y1={labelY + 48}
        x2={bottleX + bottleW - 18}
        y2={labelY + 48}
        stroke={theme.accent}
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Product name (truncated) */}
      <text
        x={bottleX + bottleW / 2}
        y={labelY + 64}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="500"
        fill={theme.labelInk}
        opacity="0.85"
      >
        {option.productName.length > 22
          ? option.productName.slice(0, 22) + "…"
          : option.productName}
      </text>

      {/* Size */}
      <text
        x={bottleX + bottleW / 2}
        y={labelY + 76}
        textAnchor="middle"
        fontFamily='"JetBrains Mono", monospace'
        fontSize="6"
        fill={theme.labelInk}
        opacity="0.65"
        style={{ letterSpacing: "0.1em" }}
      >
        {option.size.toUpperCase()}
      </text>

      {/* Dietary supplement tag */}
      <rect
        x={bottleX + bottleW / 2 - 28}
        y={labelY + labelH - 22}
        width="56"
        height="12"
        rx="2"
        fill={theme.accent}
        opacity="0.85"
      />
      <text
        x={bottleX + bottleW / 2}
        y={labelY + labelH - 14}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="6"
        fontWeight="600"
        fill="white"
        style={{ letterSpacing: "0.1em" }}
      >
        DIETARY SUPP.
      </text>

      {/* Bottle highlight (subtle white gradient for 3D effect) */}
      <ellipse
        cx={bottleX + 18}
        cy={bottleY + bottleH / 2 + 5}
        rx="4"
        ry={bottleH * 0.35}
        fill="rgba(255,255,255,0.5)"
      />
    </svg>
  );
}

// ─── Color helpers ───────────────────────────────────────────────────────────
function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.max(0, r - r * amount),
    Math.max(0, g - g * amount),
    Math.max(0, b - b * amount)
  );
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount)
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const expanded = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(expanded, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
