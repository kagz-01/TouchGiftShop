"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type DeliveryOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  estimatedTime: string;
};

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivered within 2-3 business days",
    price: 0,
    emoji: "📦",
    estimatedTime: "2-3 days",
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Next business day delivery (order before 2PM)",
    price: 500,
    emoji: "🚀",
    estimatedTime: "Next day",
  },
  {
    id: "sameday",
    name: "Same-Day Delivery",
    description: "Nairobi-wide, order before 12PM",
    price: 1000,
    emoji: "⚡",
    estimatedTime: "Today",
  },
  {
    id: "scheduled",
    name: "Scheduled Delivery",
    description: "Choose your preferred delivery date",
    price: 300,
    emoji: "📅",
    estimatedTime: "Your choice",
  },
];

type DeliveryPickerProps = {
  selected: string;
  onSelect: (optionId: string) => void;
  scheduledDate?: string;
  onDateChange?: (date: string) => void;
};

export default function DeliveryPicker({
  selected,
  onSelect,
  scheduledDate,
  onDateChange,
}: DeliveryPickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">🚚</span>
        Delivery Options
      </h3>

      <div className="space-y-2">
        {DELIVERY_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
              selected === option.id
                ? "border-brand bg-brand/5"
                : "border-surface-border bg-white hover:border-brand/20"
            )}
          >
            <span className="text-2xl">{option.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{option.name}</p>
                {option.price === 0 && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">{option.description}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-brand-deep">
                {option.price === 0 ? "Free" : `+KSh ${option.price.toLocaleString()}`}
              </p>
              <p className="text-[10px] text-brand-muted">{option.estimatedTime}</p>
            </div>

            {/* Radio indicator */}
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selected === option.id
                  ? "border-brand"
                  : "border-gray-300"
              )}
            >
              {selected === option.id && (
                <div className="w-2.5 h-2.5 bg-brand rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Scheduled date picker */}
      {selected === "scheduled" && onDateChange && (
        <div className="p-4 bg-brand/5 rounded-xl border border-brand/20">
          <label className="block text-sm font-medium mb-2">Choose delivery date</label>
          <input
            type="date"
            value={scheduledDate || ""}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      )}
    </div>
  );
}

export function getDeliveryPrice(optionId: string): number {
  return DELIVERY_OPTIONS.find((o) => o.id === optionId)?.price ?? 0;
}
