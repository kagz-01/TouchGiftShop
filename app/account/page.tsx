// Account tab — Section 4/8.2. Absorbs what earlier drafts called
// "The Concierge": saved addresses, gift card balance, Anonymous Mode
// default, WhatsApp support link.
export default function AccountPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <h1 className="text-xl font-semibold">Account</h1>

      <section>
        <h2 className="font-medium mb-2">Saved addresses</h2>
        <p className="text-sm text-brand-muted">None saved yet.</p>
      </section>

      <section>
        <h2 className="font-medium mb-2">Digital gift card balance</h2>
        <p className="text-sm text-brand-muted">KSh 0</p>
      </section>

      <section>
        <h2 className="font-medium mb-2">Preferences</h2>
        <label className="flex items-center justify-between text-sm">
          Default to Anonymous Mode on checkout
          <input type="checkbox" />
        </label>
      </section>

      <a
        href="https://wa.me/254700000000"
        className="block text-center rounded-lg border border-gray-300 py-3 text-sm"
      >
        Chat with support on WhatsApp
      </a>
    </div>
  );
}
