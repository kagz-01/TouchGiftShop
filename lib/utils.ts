import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatKsh(amount: number | null | undefined): string {
  const value = typeof amount === "number" && isFinite(amount) ? amount : 0;
  return `KSh ${value.toLocaleString("en-KE")}`;
}

export function isSameDayCutoffPassed(cutoffHour = 14): boolean {
  return new Date().getHours() >= cutoffHour;
}
