"use client";

import { useState, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import CartDrawer from "@/components/cart/CartDrawer";

export default function CartBadge() {
  const { itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      {/* Trigger Button */}
      <div className="group relative flex flex-col items-center justify-center">
        <button
          onClick={openDrawer}
          aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          className="relative w-11 h-11 flex items-center justify-center shape-premium-button text-theme-body hover:text-brand hover:bg-brand/5 transition-all duration-200"
        >
          <ShoppingBag className="w-4 h-4" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-1 ring-2 ring-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
        <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
          {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
        </span>
      </div>

      {/* The actual drawer */}
      <CartDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
