"use client";

import { useState } from "react";

/**
 * Inserts Cloudinary white-pad transformation for clean iHerb product photos.
 * Pads each photo to a 600x600 white canvas regardless of original framing.
 */
function cleanIherbImageUrl(url: string): string {
  if (!url.includes("cloudinary.images-iherb.com")) return url;
  return url.replace(
    /\/image\/upload\/([^/]+)\/images\//,
    "/image/upload/$1,c_pad,b_white,w_600,h_600/images/"
  );
}

interface Props {
  images: string[];        // 1..N URLs (may include duplicates if only one image)
  alt: string;
}

export default function ProductImageGallery({ images, alt }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Dedupe + ensure at least one image
  const gallery = Array.from(new Set(images.filter(Boolean)));
  if (gallery.length === 0) return null;

  const activeUrl = cleanIherbImageUrl(gallery[activeIdx] ?? gallery[0]);

  // Track mouse position over main image (% values) for the lens/zoom origin
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Main image with hover-zoom — slightly smaller than full square */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          aspectRatio: "1 / 1",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          overflow: "hidden",
          cursor: hovering ? "zoom-in" : "default",
          margin: "0 auto",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeUrl}
          alt={alt}
          itemProp="image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 20,
            transition: "transform 0.25s ease-out",
            transform: hovering ? `scale(2)` : "scale(1)",
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            display: "block",
          }}
        />
        {hovering && (
          <div style={{
            position: "absolute", bottom: 12, right: 12,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #e5e7eb", borderRadius: 999,
            padding: "4px 10px", fontSize: 11, color: "#374151",
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: "0.04em",
            pointerEvents: "none",
          }}>
            🔍 ZOOM 2x
          </div>
        )}
      </div>

      {/* Thumbnail strip — only shown if 2+ images */}
      {gallery.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 520, margin: "0 auto" }}>
          {gallery.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1} of ${gallery.length}`}
              style={{
                width: 72, height: 72,
                background: "#ffffff",
                border: i === activeIdx ? "2px solid #5ba373" : "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 4,
                cursor: "pointer",
                overflow: "hidden",
                transition: "border-color 0.15s, transform 0.15s",
                transform: i === activeIdx ? "scale(1.05)" : "scale(1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanIherbImageUrl(url)}
                alt={`${alt} — view ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain", display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
