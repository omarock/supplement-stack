import UpgradeCTA from "@/components/UpgradeCTA";

/**
 * Lock card shown in place of a premium-only feature. Delegates to the shared
 * premium UpgradeCTA so every gate gets the same premium treatment, correct
 * founding-offer copy, and risk reversal (no stale "$9/mo" hardcoding).
 */
export default function Paywall({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets?: string[];
}) {
  return <UpgradeCTA variant="lock" title={title} body={desc} perks={bullets} cta="Unlock Premium" />;
}
