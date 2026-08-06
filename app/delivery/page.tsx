import Link from "next/link";

export default function DeliveryPolicyPage() {
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
            <span className="text-4xl block mb-4">🚚</span>
            <h1 className="font-display text-3xl font-bold mb-2">Delivery Policy</h1>
            <p className="text-sm text-brand-muted">Last updated: August 2026</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-brand-muted leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">1. Delivery Areas & Timelines</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏙️</span>
                    <h3 className="font-bold text-brand-deep">Nairobi</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
                      Same-day delivery for orders before <strong>2:00 PM EAT</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
                      Delivery window: <strong>10:00 AM – 7:00 PM</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
                      Express option: 3-hour delivery (additional fee)
                    </li>
                  </ul>
                </div>

                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🌍</span>
                    <h3 className="font-bold text-brand-deep">Nationwide</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Next-day delivery for orders before <strong>4:00 PM EAT</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Available to all 47 counties
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Remote areas: 2–3 business days
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">2. Delivery Fees</h2>
              <p>Delivery fees are calculated based on location and shown at checkout before payment:</p>

              <div className="mt-4 overflow-hidden rounded-xl border border-surface-border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-brand-deep">Zone</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-brand-deep">Areas</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-brand-deep">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    <tr>
                      <td className="px-4 py-2.5">CBD / City Centre</td>
                      <td className="px-4 py-2.5 text-brand-muted">Nairobi CBD, Westlands, Karen</td>
                      <td className="px-4 py-2.5 text-right font-medium">KSh 200–350</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Greater Nairobi</td>
                      <td className="px-4 py-2.5 text-brand-muted">Kasarani, Langata, Kilimani, Kileleshwa</td>
                      <td className="px-4 py-2.5 text-right font-medium">KSh 350–500</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Suburbs</td>
                      <td className="px-4 py-2.5 text-brand-muted">Runda, Kitengela, Syokimau, Juja</td>
                      <td className="px-4 py-2.5 text-right font-medium">KSh 500–700</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Major Towns</td>
                      <td className="px-4 py-2.5 text-brand-muted">Mombasa, Kisumu, Nakuru, Eldoret</td>
                      <td className="px-4 py-2.5 text-right font-medium">KSh 400–600</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Remote Areas</td>
                      <td className="px-4 py-2.5 text-brand-muted">Other counties and rural areas</td>
                      <td className="px-4 py-2.5 text-right font-medium">KSh 600–1,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs">
                Fees are estimates. Exact fees are calculated at checkout based on your delivery
                landmark or pin drop location.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">3. Recipient-Led Delivery (Pin Drop)</h2>
              <p>
                If you don&apos;t know the recipient&apos;s exact address, you can enable
                &quot;Pin Drop&quot; at checkout. Here&apos;s how it works:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4 mt-3">
                <li>
                  <strong>You check &quot;I don&apos;t know their exact location&quot;</strong> during checkout
                </li>
                <li>
                  <strong>We send the recipient a WhatsApp link</strong> after your payment is confirmed
                </li>
                <li>
                  <strong>The recipient opens the link</strong> and taps on a map to drop their exact delivery pin
                </li>
                <li>
                  <strong>They select a delivery time window</strong> (Morning / Afternoon / Evening)
                </li>
                <li>
                  <strong>Our rider uses the pin</strong> to deliver directly to that location
                </li>
              </ol>
              <p className="mt-3">
                The recipient sees <strong>no price information</strong> and no sender identity
                (if Anonymous Mode is enabled). They only see that someone sent them a gift.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">4. Surprise Safeguard Delivery</h2>
              <p>
                When &quot;Surprise Safeguard&quot; is enabled at checkout:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The rider will <strong>not call or message</strong> the recipient before arrival</li>
                <li>Delivery is made using the pin drop location, building landmarks, or gate/reception</li>
                <li>If no pin was dropped, the rider will attempt delivery using the landmark provided</li>
                <li>If the rider cannot locate the recipient, they will contact <strong>you</strong> (the sender), not the recipient</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">5. Same-Day Delivery Guarantee</h2>
              <div className="bg-brand-forest/5 border border-brand-forest/20 rounded-2xl p-5 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚡</span>
                  <p className="font-bold text-brand-deep">On-time or it&apos;s free</p>
                </div>
                <p className="text-sm">
                  If your same-day Nairobi order (placed before 2:00 PM EAT) arrives after the
                  guaranteed delivery window, <strong>the delivery fee is refunded in full</strong>.
                </p>
                <p className="text-xs mt-2 text-brand-muted">
                  This guarantee does not apply to orders placed after the cutoff, orders with
                  incomplete delivery information, or delays caused by force majeure events.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">6. Photo Proof Before Dispatch</h2>
              <p>
                Every gift is photographed before it leaves our facility. This pre-dispatch
                photo is uploaded to your order page so you can see exactly what the recipient
                will receive. If the delivered item does not match the photo, contact us
                immediately for a resolution.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">7. Order Tracking</h2>
              <p>You can track your order status at any time:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Order placed:</strong> Payment confirmed, order being prepared</li>
                <li><strong>Processing:</strong> Gift is being assembled and wrapped</li>
                <li><strong>Wrapped:</strong> Gift is ready and awaiting rider pickup</li>
                <li><strong>Dispatched:</strong> Gift is on its way to the recipient</li>
                <li><strong>Delivered:</strong> Gift has been successfully delivered</li>
              </ul>
              <p className="mt-2">
                You can also send a tracking link to the recipient via WhatsApp from your order
                page. The recipient&apos;s view respects Anonymous Mode — they won&apos;t see
                the price or sender identity if enabled.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">8. Delivery Attempts</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Our rider will attempt delivery to the pin/landmark provided</li>
                <li>If the recipient is unavailable, the rider will leave the gift with a guard, reception, or safe location (if available)</li>
                <li>If no safe drop-off point is available, the rider will contact the sender</li>
                <li>A second delivery attempt is made at no extra charge within 24 hours</li>
                <li>If delivery fails after 2 attempts, the order may be cancelled with a partial refund (delivery fee non-refundable)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">9. Perishable Items</h2>
              <p>
                Flowers, food hampers, and other perishable items require same-day delivery
                whenever possible. We recommend:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ordering before 12:00 PM for guaranteed same-day delivery</li>
                <li>Ensuring the recipient will be available to receive the item</li>
                <li>Providing a backup contact in case of delivery issues</li>
              </ul>
              <p className="mt-2">
                Perishable items that fail delivery through no fault of TouchGift are not
                eligible for a full refund. See our{" "}
                <Link href="/returns" className="text-brand hover:underline">Return & Refund Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">10. Corporate & Bulk Orders</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Corporate orders with 10+ items receive automatic volume discounts</li>
                <li>Bulk deliveries may be staggered across multiple time windows</li>
                <li>A dedicated delivery coordinator is assigned for orders with 20+ recipients</li>
                <li>Corporate orders can specify delivery dates up to 30 days in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">11. Force Majeure</h2>
              <p>
                Delivery timelines may be affected by circumstances beyond our control,
                including severe weather, road closures, public holidays, strikes, or
                government restrictions. In such cases, we will notify you promptly and
                offer alternatives (reschedule, partial refund, or full refund).
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">12. Contact Us</h2>
              <p>For delivery questions or issues:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>WhatsApp: <a href="https://wa.me/254142677898" className="text-brand hover:underline">+254 142 677 898</a> (fastest)</li>
                <li>Email: <a href="mailto:delivery@touchgift.co.ke" className="text-brand hover:underline">delivery@touchgift.co.ke</a></li>
                <li>Live chat: Available on our website during business hours</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
