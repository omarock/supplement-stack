"use client";

import dynamic from "next/dynamic";
import { TH } from "@/lib/theme";

// The /build stack builder is a large interactive client island: it statically
// imports SUPPLEMENT_DB (the full ~200-ingredient catalog) and products.ts
// (~360KB of product data) on top of ~1450 lines of builder UI. None of that is
// needed for the first paint, so it loads via next/dynamic with ssr:false — the
// builder JS is split into a separate chunk fetched after the page shell paints,
// off the critical path. Same pattern as the /results SupplementGrid split.
// The page's SEO metadata stays server-rendered from build/page.tsx; only the
// interactive tool is deferred. A bare spinner (no copy) keeps the fallback
// language-neutral so it works identically on /build and /{locale}/build.
const BuildClient = dynamic(() => import("./BuildClient"), {
  ssr: false,
  loading: () => <BuilderSkeleton />,
});

export default function BuildClientLazy() {
  return <BuildClient />;
}

function BuilderSkeleton() {
  return (
    <main style={{ padding: "32px var(--section-pad-x) 80px", maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "52vh" }}>
        <div
          role="status"
          aria-label="Loading"
          style={{
            width: 44, height: 44, borderRadius: 999,
            border: `3px solid ${TH.edge}`, borderTopColor: TH.sage,
            animation: "sd-spin .9s linear infinite",
          }}
        />
      </div>
    </main>
  );
}
