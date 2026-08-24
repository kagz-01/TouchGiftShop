"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { Product } from "@/lib/types";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  giftNote?: string;
  personalization?: string;
  customizationImageUrl?: string;
  giftWrapping?: boolean;
  giftWrappingStyle?: "classic" | "premium" | "luxury";
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, options?: Partial<Pick<CartItem, "giftNote" | "personalization" | "customizationImageUrl" | "giftWrapping" | "giftWrappingStyle">>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "touchgift_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback(
    (product: Product, quantity = 1, options?: Partial<Pick<CartItem, "giftNote" | "personalization" | "customizationImageUrl" | "giftWrapping" | "giftWrappingStyle">>) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity,
            giftNote: options?.giftNote,
            personalization: options?.personalization,
            customizationImageUrl: options?.customizationImageUrl,
            giftWrapping: options?.giftWrapping,
            giftWrappingStyle: options?.giftWrappingStyle,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
