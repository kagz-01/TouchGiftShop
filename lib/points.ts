/**
 * Points economy — single source of truth for earn/redeem math.
 *
 * Earning:
 *   - Loyalty: 1 point per KSh 10 spent (awarded on payment via IPN)
 *   - Referral: 1,000 points to EACH side when the referred user's first
 *     order (>= CONVERSION_MIN_ORDER_KSH) is paid
 *
 * Redemption (checkout):
 *   - 2 points = KSh 1  (1 point ≈ KSh 0.50)
 *   - Minimum redemption: 200 points (KSh 100)
 *   - Points can cover at most 50% of the items subtotal
 *   - Points are only deducted from the ledger when payment completes
 *
 * Referral guards:
 *   - Referred first order must be >= CONVERSION_MIN_ORDER_KSH
 *   - Max MONTHLY_CONVERSION_CAP conversions per referrer per calendar month
 */

export const POINTS_PER_KSH_SPENT = 1 / 10; // 1 pt per KSh 10
export const POINTS_PER_KSH_REDEEM = 2; // 2 pts = KSh 1
export const MIN_REDEEM_POINTS = 200; // KSh 100
export const MAX_ORDER_SHARE = 0.5; // max 50% of items subtotal
export const REFERRAL_BONUS_POINTS = 1000; // each side (≈ KSh 500)
export const CONVERSION_MIN_ORDER_KSH = 1000;
export const MONTHLY_CONVERSION_CAP = 10;

/** KSh value of a points balance. */
export function pointsToKsh(points: number): number {
  return Math.floor((Number(points) || 0) / POINTS_PER_KSH_REDEEM);
}

/** Points needed to cover a KSh amount. */
export function kshToPoints(ksh: number): number {
  return Math.ceil((Number(ksh) || 0) * POINTS_PER_KSH_REDEEM);
}

/**
 * Max points redeemable against an items subtotal, respecting the
 * order-share cap and minimum redemption. Returns 0 if below minimum.
 */
export function maxRedeemablePoints(pointsBalance: number, itemsTotal: number): number {
  const balance = Math.max(0, Math.floor(Number(pointsBalance) || 0));
  const shareCap = kshToPoints(Number(itemsTotal) * MAX_ORDER_SHARE);
  const capped = Math.min(balance, shareCap);
  return capped >= MIN_REDEEM_POINTS ? Math.floor(capped) : 0;
}

/** KSh discount for a points redemption amount. */
export function pointsDiscountKsh(points: number): number {
  return pointsToKsh(points);
}
