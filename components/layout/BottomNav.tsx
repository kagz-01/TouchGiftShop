"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The 5-tab structure from the implementation plan:
// Home | Gift Lab | Orders | Reminders | Account
// Cart/Checkout is a flow launched from Home or Gift Lab, not a persistent tab.
const TABS = [
  { href: "/", label: "Home" },
  { href: "/gift-lab", label: "Gift Lab" },
  { href: "/orders", label: "Orders" },
  { href: "/reminders", label: "Reminders" },
  { href: "/account", label: "Account" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-gray-200 bg-white"
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-2 text-center text-xs ${
              active ? "text-brand font-semibold" : "text-brand-muted"
            }`}
          >
            {/* TODO: swap for real icon set once brand/design pass is done */}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
