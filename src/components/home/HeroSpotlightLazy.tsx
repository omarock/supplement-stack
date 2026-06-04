"use client";

/**
 * Defers the decorative first-visit HeroSpotlight out of the initial bundle.
 * It only appears after 1.4s for first-time visitors, so there is no reason for
 * its JS to load (or block) on first paint. ssr:false is allowed here because
 * this wrapper is a client component (the homepage itself is now server).
 */
import dynamic from "next/dynamic";

const HeroSpotlight = dynamic(() => import("@/components/HeroSpotlight"), { ssr: false });

export default function HeroSpotlightLazy() {
  return <HeroSpotlight />;
}
