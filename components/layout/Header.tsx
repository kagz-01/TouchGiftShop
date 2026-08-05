import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function Header() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-200">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="TouchGift"
          width={140}
          height={49}
          priority
        />
      </Link>
      <nav className="flex gap-6 items-center text-sm">
        <Link href="/">Home</Link>
        <Link href="/gift-lab">Gift Lab</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/reminders">Reminders</Link>
        {user ? (
          <Link href="/account" className="font-medium">
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-brand text-white px-4 py-1.5"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
