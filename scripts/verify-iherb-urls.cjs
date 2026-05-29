// Spot-check iHerb productPath entries by fetching the actual product page
// and comparing the on-page brand + title against what we have in products.ts.
// Flags drift (renamed products, different sizes, discontinued).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS = path.join(ROOT, "src/lib/products.ts");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// The 24 original supplements (pre-expansion), per project memory
const ORIGINAL_IDS = [
  "d3k2", "omega3", "omega3-algae", "multivit", "mag-glycinate", "ashwagandha",
  "l-theanine", "glycine", "b12", "b-complex", "rhodiola", "lions-mane",
  "creatine", "collagen", "curcumin", "glucosamine", "vit-c", "zinc",
  "elderberry", "probiotic", "digestive-enzymes", "iron", "coq10", "biotin",
];

const src = fs.readFileSync(PRODUCTS, "utf8");

function extractEntry(id) {
  const escaped = id.replace(/[-]/g, "\\-");
  // Match BOTH `  mag-glycinate: [...]` and `  "mag-glycinate": [...]` styles
  const headRe = new RegExp('^  "?' + escaped + '"?:\\s*\\[', "m");
  const h = headRe.exec(src);
  if (!h) return null;
  const tail = src.slice(h.index);
  const end = /\}\s*\]/.exec(tail);
  if (!end) return null;
  const block = tail.slice(0, end.index + 2);

  const brand = /brand:\s*"([^"]+)"/.exec(block);
  const productName = /productName:\s*"([^"]+)"/.exec(block);
  const size = /size:\s*"([^"]+)"/.exec(block);
  const productPath = /productPath:\s*"([^"]+)"/.exec(block);

  return {
    id,
    brand: brand ? brand[1] : null,
    productName: productName ? productName[1] : null,
    size: size ? size[1] : null,
    productPath: productPath ? productPath[1] : null,
  };
}

function fetchPageTitle(productPath) {
  const url = `https://www.iherb.com${productPath}`;
  try {
    // Use curl with the exact headers that work past iHerb's bot wall
    const html = execFileSync("curl", [
      "-sL", "-A", UA,
      "-H", "Accept: text/html,application/xhtml+xml",
      "-H", "Accept-Language: en-US,en;q=0.9",
      "-H", "Accept-Encoding: identity",
      "--max-redirs", "5",
      "--max-time", "15",
      url,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    if (!html || html.length < 500) return { ok: false, error: "empty response" };
    const titleMatch = /<title>([^<]+)<\/title>/.exec(html);
    const title = titleMatch ? titleMatch[1].replace(/\s+\|\s+iHerb\s*$/, "").trim() : null;
    const canonicalMatch = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/.exec(html);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    const discontinued = /no longer available|product has been discontinued/i.test(html);
    return { ok: true, title, canonical, discontinued };
  } catch (err) {
    return { ok: false, error: err.message.slice(0, 100) };
  }
}

function similarity(a, b) {
  // Quick token-overlap similarity (case-insensitive)
  const tokA = new Set(a.toLowerCase().split(/[\s\-,.()]+/).filter(t => t.length > 2));
  const tokB = new Set(b.toLowerCase().split(/[\s\-,.()]+/).filter(t => t.length > 2));
  if (tokA.size === 0) return 0;
  let overlap = 0;
  for (const t of tokA) if (tokB.has(t)) overlap++;
  return overlap / tokA.size;
}

(async () => {
  const results = [];
  let i = 0;
  for (const id of ORIGINAL_IDS) {
    i++;
    const entry = extractEntry(id);
    if (!entry) {
      console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → NO ENTRY FOUND`);
      continue;
    }
    if (!entry.productPath) {
      console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → no productPath (uses search fallback) — skip`);
      results.push({ id, status: "search_fallback", ...entry });
      continue;
    }

    const expectedTitle = `${entry.brand} ${entry.productName}`;
    const page = fetchPageTitle(entry.productPath);

    if (!page.ok) {
      console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → FETCH ERROR (${page.error})`);
      results.push({ id, status: "fetch_error", ...entry, ...page });
    } else if (page.discontinued) {
      console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → DISCONTINUED at ${entry.productPath}`);
      results.push({ id, status: "discontinued", ...entry, ...page });
    } else if (!page.title) {
      console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → NO TITLE on page`);
      results.push({ id, status: "no_title", ...entry, ...page });
    } else {
      const sim = similarity(expectedTitle, page.title);
      if (sim < 0.4) {
        console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → MISMATCH (sim ${sim.toFixed(2)})`);
        console.log(`     expected: ${expectedTitle}`);
        console.log(`     actual:   ${page.title}`);
        results.push({ id, status: "mismatch", similarity: sim, ...entry, livePage: page.title });
      } else {
        console.log(`[${i}/${ORIGINAL_IDS.length}] ${id} → OK (sim ${sim.toFixed(2)})`);
        results.push({ id, status: "ok", similarity: sim, ...entry, livePage: page.title });
      }
    }
    // Rate limit — 250ms between requests
    await new Promise(r => setTimeout(r, 250));
  }

  // Summary
  console.log("\n=== SUMMARY ===");
  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`);

  // Save detailed report
  fs.writeFileSync(path.join(ROOT, "scripts/iherb-url-audit.json"), JSON.stringify(results, null, 2));
  console.log("\nDetail report written to scripts/iherb-url-audit.json");
})();
