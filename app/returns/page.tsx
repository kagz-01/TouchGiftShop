import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-surface-border p-8 md:p-12 space-y-8">
          <div>
            <span className="text-4xl block mb-4">↩️</span>
            <h1 className="font-display text-3xl font-bold mb-2">Return & Refund Policy</h1>
            <p className="text-sm text-brand-muted">Last updated: August 2026</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-brand-muted leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">1. Overview</h2>
              <p>
                At TouchGift, we want every gift to be perfect. Because our products are
                perishable, personalized, or intended as one-time gifts, our return policy
                differs from standard e-commerce. This page explains when refunds apply
                and how to request one.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">2. When You CAN Request a Refund</h2>
              <p>We offer full or partial refunds in these situations:</p>

              <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5 mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="font-semibold text-brand-deep text-sm">Wrong item delivered</p>
                    <p className="text-xs">The product received is significantly different from what was ordered (wrong flower arrangement, wrong hamper contents, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="font-semibold text-brand-deep text-sm">Item arrives damaged or defective</p>
                    <p className="text-xs">The product was damaged during delivery or arrived in an unusable condition (wilted flowers, broken items, crushed packaging)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="font-semibold text-brand-deep text-sm">Delivery failed</p>
                    <p className="text-xs">We were unable to deliver the gift after reasonable attempts and the order cannot be rescheduled</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="font-semibold text-brand-deep text-sm">Payment processed, order not fulfilled</p>
                    <p className="text-xs">Your payment was confirmed but we did not process or deliver the order</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="font-semibold text-brand-deep text-sm">Duplicate charge</p>
                    <p className="text-xs">You were charged multiple times for the same order</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">3. When You CANNOT Request a Refund</h2>
              <p>Refunds are not available for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Change of mind:</strong> You decided you no longer want the gift after ordering</li>
                <li><strong>Recipient not available:</strong> The recipient was not at the delivery location during the agreed window</li>
                <li><strong>Incorrect address/pin:</strong> The delivery location provided was inaccurate</li>
                <li><strong>Personalized items:</strong> Products with custom engraving, names, or messages (unless defective)</li>
                <li><strong>Perishable items past 2 hours:</strong> Flowers or food items reported more than 2 hours after delivery</li>
                <li><strong>Minor variations:</strong> Slight differences in color, arrangement, or packaging from product photos (handmade items naturally vary)</li>
                <li><strong>No-show recipient:</strong> Recipient declined or refused the gift</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">4. How to Request a Refund</h2>
              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 mt-4">
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    <strong className="text-brand-deep">Contact us within 24 hours</strong> of delivery (or attempted delivery)
                    via WhatsApp at <a href="https://wa.me/254142677898" className="text-brand hover:underline">+254 142 677 898</a> or
                    email <a href="mailto:info@touchgiftshop.co.ke" className="text-brand hover:underline">info@touchgiftshop.co.ke</a>
                  </li>
                  <li>
                    <strong className="text-brand-deep">Provide your order ID</strong> and a description of the issue.
                    Photos of the product (if damaged/wrong item) help us resolve faster.
                  </li>
                  <li>
                    <strong className="text-brand-deep">We review your request</strong> within 24 hours and respond with a resolution.
                  </li>
                  <li>
                    <strong className="text-brand-deep">If approved</strong>, the refund is processed to your original payment method.
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">5. Refund Processing</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>M-Pesa refunds:</strong> Processed within 5–10 business days to the phone number used for payment</li>
                <li><strong>Card refunds:</strong> Processed within 5–10 business days (may take longer depending on your bank)</li>
                <li><strong>Pool contributions:</strong> Refunded to the contributor&apos;s M-Pesa within 5–10 business days</li>
                <li>You will receive a confirmation message once the refund is processed</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">6. Partial Refunds</h2>
              <p>Partial refunds may be issued when:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Only part of a multi-item hamper is damaged or missing</li>
                <li>A personalized item has a minor defect but is still usable</li>
                <li>The order was partially fulfilled before cancellation</li>
                <li>Delivery was delayed but the product is still in acceptable condition</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">7. Late or Missing Refunds</h2>
              <p>If you haven&apos;t received your refund within the stated timeframe:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Check your M-Pesa statement or bank statement again</li>
                <li>Contact your bank or M-Pesa — sometimes processing takes extra time</li>
                <li>If you&apos;ve done both and still haven&apos;t received it, contact us with your refund confirmation</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">8. On-Time Delivery Guarantee</h2>
              <p>
                If your gift arrives <strong>after the guaranteed delivery window</strong>,
                the delivery fee is refunded in full. This guarantee applies to same-day
                Nairobi orders placed before 2:00 PM EAT. The gift itself is not refunded
                unless it also meets the refund criteria in Section 2.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">9. Exchanges</h2>
              <p>
                We do not offer direct exchanges. If you need a different product, please
                request a refund for the original order and place a new order. This applies
                to non-personalized items only.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">10. Pre-Dispatch Photo</h2>
              <p>
                Every order includes a photo of the sealed package before dispatch. This photo
                is visible on your order page. If the product you receive does not match the
                pre-dispatch photo, please contact us immediately — this constitutes grounds
                for a full refund.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">11. Contact Us</h2>
              <p>For refund requests or questions:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>WhatsApp: <a href="https://wa.me/254142677898" className="text-brand hover:underline">+254 142 677 898</a> (fastest)</li>
                <li>Email: <a href="mailto:info@touchgiftshop.co.ke" className="text-brand hover:underline">info@touchgiftshop.co.ke</a></li>
                <li>Response time: Within 24 hours</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
