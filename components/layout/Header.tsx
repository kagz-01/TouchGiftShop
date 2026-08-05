import Link from "next/link";

// On desktop this doubles as the top nav (same 5 destinations as BottomNav).
// TODO: replace with a real logo/wordmark once branding is set.
export default function Header() {
  return (
    <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-200">
      <Link href="/" className="font-semibold text-lg">
        TouchGift
      </Link>
      <nav className="flex gap-6 text-sm">
        <Link href="/">Home</Link>
        <Link href="/gift-lab">Gift Lab</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/reminders">Reminders</Link>
        <Link href="/account">Account</Link>
      </nav>
    </header>
  );
}
