"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface SubscriptionContextType {
  isBuildingSubscription: boolean;
  startBuildingSubscription: () => void;
  cancelBuildingSubscription: () => void;
  subscriptionItems: Product[];
  addSubscriptionItem: (product: Product) => void;
  removeSubscriptionItem: (productId: string) => void;
  clearSubscriptionItems: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isBuildingSubscription, setIsBuildingSubscription] = useState(false);
  const [subscriptionItems, setSubscriptionItems] = useState<Product[]>([]);

  const startBuildingSubscription = () => {
    setIsBuildingSubscription(true);
    setSubscriptionItems([]); // reset
  };

  const cancelBuildingSubscription = () => {
    setIsBuildingSubscription(false);
    setSubscriptionItems([]);
  };

  const addSubscriptionItem = (product: Product) => {
    setSubscriptionItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeSubscriptionItem = (productId: string) => {
    setSubscriptionItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearSubscriptionItems = () => setSubscriptionItems([]);

  return (
    <SubscriptionContext.Provider
      value={{
        isBuildingSubscription,
        startBuildingSubscription,
        cancelBuildingSubscription,
        subscriptionItems,
        addSubscriptionItem,
        removeSubscriptionItem,
        clearSubscriptionItems,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
