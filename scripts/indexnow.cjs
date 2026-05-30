#!/usr/bin/env node
/**
 * Ping IndexNow (Bing, Yandex, Seznam, Naver…) with one or more changed URLs.
 *
 *   node scripts/indexnow.cjs https://www.suppdoc.io/ingredients/magnesium
 *   node scripts/indexnow.cjs https://www.suppdoc.io/best/sleep https://www.suppdoc.io/quiz
 *
 * Use it for NEW or UPDATED pages, not the whole site (the sitemap covers that).
 */
const KEY = "2e769915a3c251da0ac80c05987a39b3";
const HOST = "www.suppdoc.io";

const urls = process.argv.slice(2).filter(Boolean);
if (urls.length === 0) {
  console.error("Usage: node scripts/indexnow.cjs <url> [<url> ...]");
  process.exit(1);
}

(async () => {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  const ok = res.status === 200 || res.status === 202;
  console.log(`IndexNow: HTTP ${res.status} ${ok ? "✓ accepted" : "✗ (check the key file is live)"} — submitted ${urls.length} URL(s)`);
  process.exit(ok ? 0 : 1);
})();
