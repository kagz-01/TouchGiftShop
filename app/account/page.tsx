import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import LogoutButton from "@/components/account/LogoutButton";
import AccountPrefs from "@/components/account/AccountPrefs";
import ReferralSection from "@/components/account/ReferralSection";

export default async function AccountPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-md mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-brand-muted">
          Sign in to see your orders, saved addresses, and preferences.
        </p>
        <Link
          href="/login"
          className="block text-center rounded-lg bg-brand text-white py-3 font-medium"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const phone = user.phone ?? "Not set";

  return (
    <div className="px-4 md:px-8 py-6 max-w-md mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-brand-muted">{phone}</p>
      </div>

      <section>
        <h2 className="font-medium mb-2">Quick links</h2>
        <div className="space-y-2">
          <Link
            href={`/orders?phone=${encodeURIComponent(phone)}`}
            className="block rounded-lg border border-gray-200 p-3 text-sm hover:border-gray-400 transition-colors"
          >
            My orders
          </Link>
          <Link
            href="/gift-lab/pool"
            className="block rounded-lg border border-gray-200 p-3 text-sm hover:border-gray-400 transition-colors"
          >
            Start a gift pool
          </Link>
          <Link
            href="/gift-cards"
            className="block rounded-lg border border-gray-200 p-3 text-sm hover:border-gray-400 transition-colors"
          >
            Buy a gift card
          </Link>
          <Link
            href="/wishlist/create"
            className="block rounded-lg border border-gray-200 p-3 text-sm hover:border-gray-400 transition-colors"
          >
            Create a wishlist
          </Link>
        </div>
      </section>

      <AccountPrefs />

      <ReferralSection />

      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center rounded-lg border border-gray-300 py-3 text-sm"
      >
        Chat with support on WhatsApp
      </a>

      <LogoutButton />
    </div>
  );
}
