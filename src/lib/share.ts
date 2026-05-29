/**
 * Stack-share token encoding/decoding.
 *
 * A share token packs: a list of supplement IDs + an optional stack name.
 * Encoded as URL-safe base64 of "name|id1,id2,id3..."
 * No PII, no secrets, just a compact way to make the URL pretty.
 */

import { SUPPLEMENT_DB } from "./supplements";

export interface SharePayload {
  ids: string[];
  name?: string;
}

function b64UrlEncode(s: string): string {
  // Standard base64 then replace url-unsafe chars
  return Buffer.from(s, "utf8").toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64UrlDecode(s: string): string {
  // Restore padding + url-unsafe chars
  let padded = s.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4) padded += "=";
  return Buffer.from(padded, "base64").toString("utf8");
}

export function encodeShareToken(payload: SharePayload): string {
  // Filter to valid IDs only (defensive)
  const valid = payload.ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id));
  const namePart = (payload.name ?? "").slice(0, 60);
  return b64UrlEncode(`${namePart}|${valid.join(",")}`);
}

export function decodeShareToken(token: string): SharePayload | null {
  try {
    const raw = b64UrlDecode(token);
    const [namePart, idsPart] = raw.split("|");
    const ids = (idsPart ?? "").split(",").map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return null;
    // Validate IDs against catalog
    const valid = ids.filter(id => SUPPLEMENT_DB.some(s => s.id === id));
    if (valid.length === 0) return null;
    return { ids: valid, name: namePart || undefined };
  } catch {
    return null;
  }
}
