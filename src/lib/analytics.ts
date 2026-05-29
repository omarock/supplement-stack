"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Central funnel-event tracker (thin wrapper over Vercel Analytics custom events).
 * Safe to call anywhere client-side; no-ops if analytics isn't available.
 *
 * Keep event names stable — they're the funnel we optimize against:
 *   home_goal_build · quiz_complete · stack_generate · audit_run ·
 *   bloodwork_analyze · bloodwork_save · track_cta_click · track_enroll ·
 *   checkin_save · checkout_click · interaction_to_audit
 */
export type SuppEvent =
  | "home_goal_build"
  | "quiz_complete"
  | "stack_generate"
  | "audit_run"
  | "bloodwork_analyze"
  | "bloodwork_save"
  | "track_cta_click"
  | "track_enroll"
  | "checkin_save"
  | "checkout_click"
  | "interaction_to_audit";

type Props = Record<string, string | number | boolean | null>;

export function track(event: SuppEvent, props?: Props): void {
  try {
    vercelTrack(event, props);
  } catch {
    /* analytics is best-effort; never break the UX */
  }
}
