/**
 * Guest mode — lets people browse, cart and checkout without an account.
 * Guests miss: points, wishlist, reminders, order history, referral earnings.
 * Flag lives in localStorage; cleared automatically on any successful sign-in.
 */

const KEY = "tg_guest";

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setGuest(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
}

export function clearGuest(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
