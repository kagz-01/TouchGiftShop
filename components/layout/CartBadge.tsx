"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartBadge() {
  // Reactive count from CartProvider — no localStorage polling on a 1s timer.
  const { itemCount: count } = useCart();

  return (
    <div className="group relative flex flex-col items-center justify-center">
      <Link
        href="/cart"
        aria-label="Shopping cart"
        className="relative w-11 h-11 flex items-center justify-center shape-premium-button text-theme-body hover:text-brand hover:bg-brand/5 transition-all duration-200"
      >
        <ShoppingBag className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
      <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
        Cart{count > 0 ? ` (${count})` : ""}
      </span>
    </div>
  );
}
