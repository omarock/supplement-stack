const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/products.ts"), "utf8");

const ids = "nmn nr fisetin spermidine apigenin pterostilbene tmg tributyrin lactoferrin dgl theacrine uridine pycnogenol huperzine tocotrienols silica ceramides hmb tribulus tryptophan passionflower gaba bergamot bilberry dandelion artichoke chasteberry glutathione astragalus mucuna eleuthero schisandra chaga potassium calcium".split(" ");

const out = [];
for (const id of ids) {
  const escaped = id.replace(/[-]/g, "\\-");
  const headRe = new RegExp("^  " + escaped + ":\\s*\\[", "m");
  const h = headRe.exec(src);
  if (!h) { console.error("miss", id); continue; }
  const window = src.slice(h.index, h.index + 800);
  const sq = /searchQuery:\s*"([^"]+)"/.exec(window);
  if (sq) {
    // Also pick up productPath if present
    const pp = /productPath:\s*"([^"]+)"/.exec(window);
    out.push(`${id}|${sq[1]}|${pp ? pp[1] : ""}`);
  } else {
    console.error("no searchQuery for", id);
  }
}
fs.writeFileSync(path.join(ROOT, "scripts/scrape35_queries.txt"), out.join("\n"));
console.log("Written", out.length, "queries");
