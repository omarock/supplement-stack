import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy, suppdoc.io",
  description: "suppdoc.io's refund and cancellation policy for premium subscriptions, including our 7-day money-back guarantee and how to cancel.",
  alternates: { canonical: "https://www.suppdoc.io/refunds" },
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Refund & Cancellation Policy" lastUpdated="May 2026">
      <p>
        This policy explains how billing, cancellations, and refunds work for suppdoc.io
        premium subscriptions. The free parts of suppdoc.io remain free, this policy applies
        only to optional paid plans.
      </p>

      <h2>1. Merchant of Record</h2>
      <p>
        Our order process is conducted by our online reseller <strong>Paddle.com</strong>.
        Paddle.com is the <strong>Merchant of Record</strong> for all our paid orders. Paddle
        handles payment processing, billing, applicable taxes, customer payment inquiries, and
        refunds. A charge for a suppdoc.io subscription will appear on your statement as a
        Paddle descriptor.
      </p>

      <h2>2. Subscriptions &amp; billing</h2>
      <p>
        Premium is offered as a recurring subscription, currently <strong>$9 / month</strong> or
        <strong> $79 / year</strong>. Subscriptions renew automatically at the end of each billing
        period until cancelled. You authorise Paddle to charge your payment method for each
        renewal at the then-current price (we will notify you in advance of any price change).
      </p>

      <h2>3. 7-day money-back guarantee</h2>
      <p>
        We want you to be happy with premium. If you are not satisfied, you may request a
        <strong> full refund within 7 days</strong> of your initial purchase or of any renewal
        charge. Approved refunds are returned to your original payment method by Paddle, and your
        premium access ends when the refund is issued.
      </p>

      <h2>4. Cancellation</h2>
      <p>
        You can <strong>cancel anytime</strong> from your account settings (or via the link in any
        Paddle billing email). When you cancel, your subscription does not renew again and your
        premium access continues until the end of the period you have already paid for. We do not
        provide pro-rated refunds for unused time after the 7-day window, but you keep access
        through the paid period.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Email <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a> with the email address used at
        purchase, or reply to your Paddle receipt. We (or Paddle) will process eligible refunds
        promptly. You can also contact Paddle support directly at{" "}
        <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a>.
      </p>

      <h2>6. Exceptional circumstances</h2>
      <p>
        Refunds outside the 7-day window are at our discretion (for example, a confirmed technical
        fault that prevented you from using premium). Reach out and we will do our best to make it
        right.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about billing, cancellations, or refunds:{" "}
        <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
