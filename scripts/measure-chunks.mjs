// Measure the real "first load JS" of a route from its prerendered/served HTML.
//
// Why this exists: @next/bundle-analyzer does not work with Turbopack, and the
// Turbopack `next build` table omits per-route sizes. But the HTML a route
// ships references the exact <script>/<link rel=modulepreload> chunks the
// browser downloads up front (prefixed with /_next/). The RSC flight payload
// also *mentions* chunk names, but without the /_next/ prefix, so matching only
// the prefixed attribute references gives us the true initial JS set.
//
// Usage (from repo root, after `next build`):
//   node scripts/measure-chunks.mjs .next/server/app/build.html .next/server/app/results.html
//   node scripts/measure-chunks.mjs --find=SUPPLEMENT_DB        // locate a module's chunk
//
// Static routes (○/●) have a .next/server/app/<route>.html you can point at.
// Dynamic routes (ƒ) have none at build time — save their served HTML from
// `next start` and point at that file instead.

import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "..");
const NEXT_DIR = path.join(REPO, ".next");
const CHUNKS_DIR = path.join(NEXT_DIR, "static", "chunks");

const args = process.argv.slice(2);
const findArg = args.find((a) => a.startsWith("--find="));
const htmlFiles = args.filter((a) => !a.startsWith("--"));

const KB = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";

function chunkPath(rel) {
  // rel looks like "static/chunks/xxx.js"
  return path.join(NEXT_DIR, rel);
}

function sizes(rel) {
  const p = chunkPath(rel);
  if (!existsSync(p)) return { raw: 0, gz: 0, missing: true };
  const buf = readFileSync(p);
  return { raw: buf.length, gz: gzipSync(buf).length, missing: false };
}

function measureHtml(file) {
  const html = readFileSync(file, "utf8");
  // Only count real downloads: src="/_next/static/chunks/..." or href="/_next/..."
  const re = /(?:src|href)="\/_next\/(static\/chunks\/[^"]+\.js)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  const chunks = [...set].map((rel) => ({ rel, ...sizes(rel) }));
  chunks.sort((a, b) => b.raw - a.raw);
  const totalRaw = chunks.reduce((s, c) => s + c.raw, 0);
  const totalGz = chunks.reduce((s, c) => s + c.gz, 0);
  return { file, chunks, totalRaw, totalGz };
}

function findModuleChunk(needle) {
  const hits = [];
  for (const name of readdirSync(CHUNKS_DIR)) {
    if (!name.endsWith(".js")) continue;
    const p = path.join(CHUNKS_DIR, name);
    let txt;
    try {
      txt = readFileSync(p, "utf8");
    } catch {
      continue;
    }
    if (txt.includes(needle)) {
      const buf = Buffer.from(txt);
      hits.push({ name, raw: buf.length, gz: gzipSync(buf).length });
    }
  }
  hits.sort((a, b) => b.raw - a.raw);
  return hits;
}

if (findArg) {
  const needle = findArg.slice("--find=".length);
  const hits = findModuleChunk(needle);
  console.log(`\nChunks containing "${needle}":  ${hits.length} file(s)`);
  for (const h of hits) {
    console.log(`  ${h.name.padEnd(28)} raw ${KB(h.raw)}   gzip ${KB(h.gz)}`);
  }
  if (hits.length === 0) console.log("  (none)");
  console.log("");
}

for (const file of htmlFiles) {
  if (!existsSync(file)) {
    console.log(`\n!! missing HTML: ${file}`);
    continue;
  }
  const r = measureHtml(file);
  const label = path.basename(file);
  console.log(`\n── ${label} ──  initial JS: ${r.chunks.length} chunks · raw ${KB(r.totalRaw).trim()} · gzip ${KB(r.totalGz).trim()}`);
  for (const c of r.chunks.slice(0, 12)) {
    console.log(`   ${c.rel.replace("static/chunks/", "").padEnd(24)} raw ${KB(c.raw)}  gzip ${KB(c.gz)}${c.missing ? "  (missing!)" : ""}`);
  }
  if (r.chunks.length > 12) console.log(`   … +${r.chunks.length - 12} smaller chunks`);
}
console.log("");
