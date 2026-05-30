/**
 * Cookie-consent state shared between the banner, the analytics gate, and the
 * footer "preferences" link. The banner is the writer; everything else reads.
 *
 * Storage: localStorage holds the full decision; a cookie mirrors a short code so
 * the server could read it later if needed. Consent is opt-in for GDPR, analytics
 * only loads once the user explicitly allows it.
 */
export const CONSENT_KEY = "suppdoc.cookieConsent.v1";

/** Fired (on window) whenever consent changes, so live consumers can re-check. */
export const CONSENT_EVENT = "suppdoc:consent-changed";
/** Fired (on window) to re-open the preferences banner. */
export const CONSENT_REOPEN_EVENT = "suppdoc:consent-reopen";

export interface ConsentPrefs {
  analytics: boolean;
  affiliate: boolean;
}

interface StoredConsent {
  choice: "accept" | "reject" | "custom";
  prefs?: Partial<ConsentPrefs>;
}

/** Read the current consent, or null if the user hasn't decided yet. */
export function readConsent(): ConsentPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredConsent;
    if (p.choice === "accept") return { analytics: true, affiliate: true };
    if (p.choice === "reject") return { analytics: false, affiliate: false };
    return { analytics: Boolean(p.prefs?.analytics), affiliate: Boolean(p.prefs?.affiliate) };
  } catch {
    return null;
  }
}

/** True only when the user has explicitly allowed analytics cookies. */
export function analyticsAllowed(): boolean {
  return readConsent()?.analytics === true;
}

/** Re-open the consent banner (used by the footer "Cookie preferences" link). */
export function openConsentPreferences(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
}

/** Broadcast that consent just changed (called by the banner after it persists). */
export function notifyConsentChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_EVENT));
}
