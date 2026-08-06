import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            <span className="text-4xl block mb-4">🔒</span>
            <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-brand-muted">Last updated: August 2026</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-brand-muted leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">1. Who We Are</h2>
              <p>
                TouchGift (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is an online gifting platform operated in Kenya. We
                enable customers to purchase gifts — flowers, hampers, personalized items, and gift
                experiences — and have them delivered to recipients across Kenya. Our website is
                located at <strong>touchgift.co.ke</strong>.
              </p>
              <p>
                We are committed to protecting your personal information and your right to privacy.
                If you have any questions or concerns about this privacy policy or our practices,
                please contact us at{" "}
                <a href="https://wa.me/254142677898" className="text-brand hover:underline">
                  +254 142 677 898
                </a>{" "}
                or email{" "}
                <a href="mailto:info@touchgiftshop.co.ke" className="text-brand hover:underline">
                  info@touchgiftshop.co.ke
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">2. Information We Collect</h2>
              <p>We collect information to provide and improve our gifting services. The types of data we collect include:</p>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">a) Information You Provide</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Account information:</strong> Name, phone number, and email when you create an account</li>
                <li><strong>Order information:</strong> Sender name, sender phone, recipient name, recipient phone, delivery address/landmark, and gift notes</li>
                <li><strong>Payment information:</strong> Phone number for M-Pesa transactions (processed by PesaPal — we do not store your M-Pesa PIN or card details)</li>
                <li><strong>Wishlist data:</strong> Items you add to wishlists and any associated notes</li>
                <li><strong>Pool contributions:</strong> Name and phone number when you contribute to a group gift pool</li>
                <li><strong>Communications:</strong> Any messages you send us via WhatsApp, email, or our AI Gift Finder</li>
              </ul>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">b) Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Device information:</strong> Browser type, operating system, device type, and screen resolution</li>
                <li><strong>Usage data:</strong> Pages visited, time spent on pages, products viewed, and navigation patterns</li>
                <li><strong>Location data:</strong> Approximate location based on IP address (used for delivery zone estimation)</li>
                <li><strong>Cookies:</strong> Session cookies to keep you logged in and remember your preferences</li>
              </ul>

              <h3 className="font-semibold text-brand-deep mt-4 mb-2">c) Information from Third Parties</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Payment confirmation:</strong> Transaction status and receipt numbers from PesaPal</li>
                <li><strong>Delivery data:</strong> GPS coordinates when a recipient drops their delivery pin</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Process and fulfill your gift orders, including delivery to recipients</li>
                <li>Send order confirmations, status updates, and delivery notifications</li>
                <li>Process payments securely through PesaPal</li>
                <li>Send pin drop links to recipients so they can set their delivery location</li>
                <li>Send tracking links so recipients can follow their gift status</li>
                <li>Provide AI-powered gift recommendations through our Gift Finder (Zawadi)</li>
                <li>Generate handwritten note content using AI services</li>
                <li>Communicate with you about orders, support requests, and account issues</li>
                <li>Send reminders about upcoming occasions you&apos;ve saved (if you opt in)</li>
                <li>Improve our website, services, and user experience</li>
                <li>Detect and prevent fraud, abuse, and security issues</li>
                <li>Comply with legal obligations under Kenyan law</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">4. How We Share Your Information</h2>
              <p>We do <strong>not</strong> sell your personal data. We share information only in these limited circumstances:</p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Payment processing:</strong> We share transaction details with PesaPal to process your M-Pesa,
                  card, or Airtel Money payments. PesaPal&apos;s own privacy policy governs their use of this data.
                </li>
                <li>
                  <strong>Delivery partners:</strong> We share the recipient&apos;s name, delivery landmark/pin location,
                  and contact phone number with our delivery partners solely to complete the delivery.
                </li>
                <li>
                  <strong>AI services:</strong> When you use the Gift Finder or note generator, your queries may be
                  processed by third-party AI providers (OpenAI, Google, xAI) to generate responses. We do not
                  share your personal account data with these providers — only the query text.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose information if required by law, court order,
                  or governmental authority in Kenya.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">5. Recipient Data</h2>
              <p>
                A key part of our service involves collecting information about gift recipients who may
                not have directly interacted with TouchGift. This includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Recipient name and phone number (provided by the sender)</li>
                <li>Delivery location and GPS coordinates (provided by the recipient via pin drop)</li>
                <li>Preferred delivery time window</li>
                <li>Gift notes from the sender</li>
              </ul>
              <p className="mt-3">
                We process this data solely to fulfill the gift delivery. Recipients receive only the
                information necessary to set their delivery location and track their gift. Recipients
                do <strong>not</strong> see the sender&apos;s identity or gift price when Anonymous Mode is enabled.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">6. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All data is encrypted in transit using TLS/SSL</li>
                <li>Payment processing is handled entirely by PesaPal — we never store M-Pesa PINs, card numbers, or CVV codes</li>
                <li>Database access is restricted to authorized personnel only</li>
                <li>API keys and secrets are stored server-side and never exposed to the browser</li>
                <li>Regular security reviews of our codebase and infrastructure</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the Internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">7. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to provide our services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Account data:</strong> Retained until you request account deletion</li>
                <li><strong>Order data:</strong> Retained for 24 months for order history, support, and legal compliance</li>
                <li><strong>Payment references:</strong> Transaction IDs retained for 7 years as required by Kenyan tax law</li>
                <li><strong>Delivery pins:</strong> GPS coordinates retained for 6 months for delivery dispute resolution</li>
                <li><strong>AI chat logs:</strong> Retained for 30 days to improve our Gift Finder, then anonymized</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">8. Your Rights</h2>
              <p>Under Kenya&apos;s Data Protection Act (2019), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Access</strong> the personal data we hold about you</li>
                <li><strong>Correct</strong> any inaccurate or incomplete data</li>
                <li><strong>Delete</strong> your personal data (subject to legal retention requirements)</li>
                <li><strong>Object</strong> to processing of your data for marketing purposes</li>
                <li><strong>Withdraw consent</strong> at any time where we rely on consent to process your data</li>
                <li><strong>Data portability</strong> — request a copy of your data in a machine-readable format</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:info@touchgiftshop.co.ke" className="text-brand hover:underline">
                  info@touchgiftshop.co.ke
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">9. Cookies</h2>
              <p>We use the following types of cookies:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essential cookies:</strong> Required for the site to function (session management, login state)</li>
                <li><strong>Preference cookies:</strong> Remember your settings (language, currency display)</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site (anonymized)</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings. Disabling essential cookies
                may affect site functionality.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">10. Children&apos;s Privacy</h2>
              <p>
                TouchGift is not intended for use by children under 18. We do not knowingly collect
                personal information from children. If you believe a child has provided us with personal
                data, please contact us immediately and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the
                &quot;Last updated&quot; date. Your continued use of TouchGift after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-brand-deep mb-3">12. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our data practices, contact us:</p>
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
