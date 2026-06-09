/**
 * Single source of truth for billing mode.
 *
 * FOUNDING_MODE = true  -> Premium is a one-time $79 lifetime membership,
 *   invoiced by a secure payment link by hand. No subscription, no auto-renewal,
 *   no third-party merchant of record yet.
 *
 * FOUNDING_MODE = false -> the recurring $9/mo or $79/yr plans go live (and the
 *   /refunds page reverts to the subscription/merchant-of-record terms).
 *
 * Pricing and the refund policy both read this flag so the two can never drift
 * out of sync (which previously left /refunds describing a subscription that did
 * not exist).
 */
export const FOUNDING_MODE = true;
