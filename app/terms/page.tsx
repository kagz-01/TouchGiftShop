import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="page-container py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-surface-border p-8 md:p-12 space-y-8">
          <div>
            <span className="text-4xl block mb-4">📄</span>
            <h1 className="font-display text-3xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-sm text-brand-muted">Last updated: August 2026</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-brand-muted leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using TouchGift (&quot;the Platform&quot;), operated at
                touchgift.co.ke, you agree to be bound by these Terms & Conditions.
                If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                These terms apply to all users of the Platform, including browsers, customers,
                merchants, and contributors of content. We reserve the right to update these
                terms at any time. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">2. Our Services</h2>
              <p>TouchGift provides an online gifting platform that enables you to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Purchase gifts from our curated catalog (flowers, hampers, personalized items, gift experiences)</li>
                <li>Have gifts delivered to recipients in Nairobi (same-day) and nationwide (next-day)</li>
                <li>Pay via M-Pesa, credit/debit card, or Airtel Money through our payment partner PesaPal</li>
                <li>Create group gift pools (Pool a Gift) where multiple people contribute</li>
                <li>Create and share wishlists</li>
                <li>Use our AI Gift Finder (T-Gifter) for personalized gift recommendations</li>
                <li>Generate AI-powered handwritten notes</li>
                <li>Order corporate and bulk gifts with volume discounts</li>
              </ul>
              <p className="mt-3">
                TouchGift acts as an intermediary between gift buyers and delivery. We source
                products from verified suppliers and handle wrapping, personalization, and delivery.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">3. Account Registration</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not share your account credentials with others</li>
                <li>One account per person — duplicate accounts may be suspended</li>
                <li>We use phone number + OTP for authentication (via Supabase Auth)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">4. Orders & Payments</h2>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">Placing an Order</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All orders are subject to product availability</li>
                <li>Prices are displayed in Kenya Shillings (KSh) and include VAT where applicable</li>
                <li>Delivery fees are calculated by area and shown before checkout</li>
                <li>Orders are confirmed only after successful payment via PesaPal</li>
                <li>You will receive an order confirmation after payment is processed</li>
              </ul>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">Payment Methods</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>M-Pesa:</strong> Via PesaPal&apos;s hosted checkout (STK push to your phone)</li>
                <li><strong>Credit/Debit Card:</strong> Visa and Mastercard via PesaPal</li>
                <li><strong>Airtel Money:</strong> Via PesaPal&apos;s hosted checkout</li>
              </ul>
              <p className="mt-2">
                All payment processing is handled by PesaPal. TouchGift does not store your
                M-Pesa PIN, card number, or CVV. See our{" "}
                <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>{" "}
                for details.
              </p>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">Pricing</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All prices are in Kenya Shillings (KSh)</li>
                <li>Prices include applicable taxes unless otherwise stated</li>
                <li>Delivery fees vary by location and are shown at checkout</li>
                <li>Corporate bulk orders receive automatic volume discounts (10% for 10+ items, 15% for 15+)</li>
                <li>TouchGift reserves the right to change prices without prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">5. Delivery</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Nairobi:</strong> Same-day delivery for all Nairobi orders</li>
                <li><strong>Nationwide:</strong> Next-day delivery for orders placed before 4:00 PM EAT</li>
                <li>Delivery times are estimates and not guaranteed unless the on-time guarantee applies</li>
                <li>Recipients may be contacted via the delivery landmark or pin drop location</li>
                <li>If &quot;Surprise Safeguard&quot; is enabled, the rider will not call the recipient</li>
                <li>Failed delivery attempts due to incorrect address/pin may incur additional fees</li>
              </ul>
              <p className="mt-2">
                See our full{" "}
                <Link href="/delivery" className="text-brand hover:underline">Delivery Policy</Link>{" "}
                for complete details including coverage areas, fees, and guarantees.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">6. Returns & Refunds</h2>
              <p>
                Due to the nature of gifting products (perishable items, personalized goods),
                returns are limited. Refunds are issued in these situations:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Product significantly differs from the listing (wrong item, missing items)</li>
                <li>Product arrives damaged or defective</li>
                <li>Delivery fails and cannot be rescheduled</li>
                <li>Payment was processed but order was not fulfilled</li>
              </ul>
              <p className="mt-2">
                Refunds are processed to the original payment method within 5–10 business days.
                See our full{" "}
                <Link href="/returns" className="text-brand hover:underline">Return & Refund Policy</Link>{" "}
                for complete details.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">7. Pool a Gift (Group Gifting)</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Anyone can create a gift pool by setting a title, target amount, and expiry date</li>
                <li>Contributions are individual — each contributor pays independently via PesaPal</li>
                <li>Contributions are non-refundable once the pool reaches its target or expires</li>
                <li>The pool organizer can dispatch early at partial funding</li>
                <li>Expired pools with unreached targets: contributors may request a refund within 7 days</li>
                <li>TouchGift is not responsible for disputes between pool organizers and contributors</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">8. Wishlists</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Wishlists are public — anyone with the link can view and contribute</li>
                <li>Wishlist creators are responsible for sharing their link</li>
                <li>Wishlist items are not reserved — items may go out of stock</li>
                <li>Gifts sent from a wishlist are subject to normal order terms</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">9. AI Gift Finder (T-Gifter)</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>T-Gifter is an AI-powered recommendation tool, not a human</li>
                <li>Recommendations are based on your input and our product catalog</li>
                <li>We do not guarantee that AI suggestions will be suitable or error-free</li>
                <li>Queries may be processed by third-party AI providers (OpenAI, Google, xAI)</li>
                <li>Do not share sensitive personal information in chat messages</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">10. Prohibited Activities</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to access other users&apos; accounts without authorization</li>
                <li>Interfere with or disrupt the Platform&apos;s infrastructure</li>
                <li>Use automated systems (bots, scrapers) to access the Platform</li>
                <li>Submit false or misleading order information</li>
                <li>Use the Platform to send spam, harassment, or abusive content</li>
                <li>Resell TouchGift products without written authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">11. Intellectual Property</h2>
              <p>
                All content on TouchGift — including logos, product images, text, graphics,
                software, and design — is the property of TouchGift or its licensors and is
                protected by Kenyan and international intellectual property laws. You may not
                reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">12. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by Kenyan law:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>TouchGift&apos;s total liability shall not exceed the value of the order in question</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We are not responsible for delays caused by circumstances beyond our control (force majeure, including weather, road closures, strikes, or government actions)</li>
                <li>Product images are for illustration — actual items may vary slightly in color or arrangement</li>
                <li>We are not liable for the actions or omissions of third-party delivery partners</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">13. Indemnification</h2>
              <p>
                You agree to indemnify and hold TouchGift harmless from any claims, losses,
                or damages (including legal fees) arising from your use of the Platform, your
                violation of these terms, or your violation of any rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">14. Governing Law</h2>
              <p>
                These terms are governed by and construed in accordance with the laws of the
                Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction
                of the courts of Kenya.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">15. Severability</h2>
              <p>
                If any provision of these terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary, and
                the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">16. Changes to These Terms</h2>
              <p>
                We reserve the right to update these terms at any time. We will notify you of
                material changes by posting the updated terms on this page and updating the
                &quot;Last updated&quot; date. Your continued use of the Platform after
                changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">17. Contact</h2>
              <p>For questions about these Terms & Conditions:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>WhatsApp: <a href="https://wa.me/254142677898" className="text-brand hover:underline">+254 142 677 898</a></li>
                <li>Email: <a href="mailto:info@touchgiftshop.co.ke" className="text-brand hover:underline">info@touchgiftshop.co.ke</a></li>
                <li>Website: <a href="https://touchgift.co.ke" className="text-brand hover:underline">touchgift.co.ke</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
