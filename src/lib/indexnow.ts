/**
 * IndexNow, instant indexing for Bing, Yandex, Seznam, Naver and other
 * participating engines. Instead of waiting for a crawl, we ping the protocol
 * with the URLs that changed and they fetch them right away.
 *
 * Ownership is proven by a key file hosted at:
 *   https://www.suppdoc.io/<KEY>.txt   (see public/<KEY>.txt)
 *
 * IndexNow is for NEW or UPDATED urls, not for resubmitting the whole site
 * (the sitemap already handles full discovery). Submit a handful of changed
 * pages at a time.
 */

export const INDEXNOW_KEY = "2e769915a3c251da0ac80c05987a39b3";
const HOST = "www.suppdoc.io";

/** Submit a batch of URLs (max ~10,000) to IndexNow. Returns the HTTP status. */
export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  const urlList = urls.filter(u => u.startsWith(`https://${HOST}/`) || u === `https://${HOST}`);
  if (urlList.length === 0) return { ok: false, status: 0 };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  // 200 = accepted, 202 = accepted (validation pending). Both are success.
  return { ok: res.status === 200 || res.status === 202, status: res.status };
}
