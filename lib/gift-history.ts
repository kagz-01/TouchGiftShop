"use client";

import { useState, useEffect } from "react";
import { formatKsh } from "@/lib/utils";

type GiftHistory = {
  recipientName: string;
  recipientRelation: string;
  gifts: Array<{
    productId: string;
    productName: string;
    price: number;
    occasion: string;
    date: string;
  }>;
};

const HISTORY_KEY = "touchgift_gift_history";

export function getGiftHistory(): GiftHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function trackGift(
  recipientName: string,
  recipientRelation: string,
  gift: {
    productId: string;
    productName: string;
    price: number;
    occasion: string;
  }
) {
  if (typeof window === "undefined") return;

  try {
    const history = getGiftHistory();

    // Find or create recipient
    let recipient = history.find(
      (h) => h.recipientName.toLowerCase() === recipientName.toLowerCase()
    );

    if (!recipient) {
      recipient = {
        recipientName,
        recipientRelation,
        gifts: [],
      };
      history.push(recipient);
    }

    // Add gift
    recipient.gifts.push({
      ...gift,
      date: new Date().toISOString(),
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function getAvoidList(recipientName: string): string[] {
  const history = getGiftHistory();
  const recipient = history.find(
    (h) => h.recipientName.toLowerCase() === recipientName.toLowerCase()
  );
  return recipient?.gifts.map((g) => g.productName) || [];
}

export function getGiftSummary(recipientName: string) {
  const history = getGiftHistory();
  const recipient = history.find(
    (h) => h.recipientName.toLowerCase() === recipientName.toLowerCase()
  );

  if (!recipient) return null;

  const occasions = [...new Set(recipient.gifts.map((g) => g.occasion))];
  const totalSpent = recipient.gifts.reduce((sum, g) => sum + g.price, 0);
  const lastGift = recipient.gifts[recipient.gifts.length - 1];

  return {
    recipient: recipient.recipientName,
    relation: recipient.recipientRelation,
    totalGifts: recipient.gifts.length,
    occasions,
    totalSpent,
    lastGift,
    avgPrice: Math.round(totalSpent / recipient.gifts.length),
  };
}
