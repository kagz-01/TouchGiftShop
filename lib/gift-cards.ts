import { supabaseAdmin } from "@/lib/supabase";

/**
 * Credits a gift card back when an order it paid for is refunded or cancelled.
 *
 * Idempotent: the redemption row is claimed with a compare-and-set on
 * `reversed_at IS NULL`, so triggering a reversal twice cannot credit twice. If
 * the credit itself cannot be applied the claim is rolled back, leaving the
 * redemption reversible so it can be retried.
 */
export async function reverseGiftCardRedemption(
  orderId: string,
  reason: string
): Promise<{ restored: number; balance?: number; reason?: string }> {
  const { data: rows, error: findError } = await supabaseAdmin
    .from("gift_card_redemptions")
    .select("id, gift_card_id, amount")
    .eq("order_id", orderId)
    .is("reversed_at", null)
    .limit(1);

  if (findError) return { restored: 0, reason: findError.message };

  const redemption = rows?.[0];
  if (!redemption) {
    return { restored: 0, reason: "no unreversed redemption for this order" };
  }

  const amount = Number(redemption.amount);
  if (!(amount > 0)) {
    return { restored: 0, reason: "redemption amount is not positive" };
  }

  // Claim the reversal before crediting, so concurrent callers cannot both pay.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("gift_card_redemptions")
    .update({ reversed_at: new Date().toISOString(), reversal_reason: reason })
    .eq("id", redemption.id)
    .is("reversed_at", null)
    .select("id")
    .maybeSingle();

  if (claimError) return { restored: 0, reason: claimError.message };
  if (!claimed) return { restored: 0, reason: "already reversed" };

  const unclaim = async () => {
    await supabaseAdmin
      .from("gift_card_redemptions")
      .update({ reversed_at: null, reversal_reason: null })
      .eq("id", redemption.id);
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: card, error: cardError } = await supabaseAdmin
      .from("gift_cards")
      .select("id, code, balance, status, expires_at")
      .eq("id", redemption.gift_card_id)
      .maybeSingle();

    if (cardError) {
      await unclaim();
      return { restored: 0, reason: cardError.message };
    }
    if (!card) {
      await unclaim();
      return { restored: 0, reason: "gift card no longer exists" };
    }

    const balance = Number(card.balance);
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("gift_cards")
      .update({ balance: balance + amount })
      .eq("id", card.id)
      .eq("balance", balance)
      .select("balance")
      .maybeSingle();

    if (updateError) {
      await unclaim();
      return { restored: 0, reason: updateError.message };
    }
    if (!updated) continue; // balance moved under us — re-read and retry

    const newBalance = Number(updated.balance);

    // Worth a human's attention: the customer is owed value on a card they can
    // no longer spend.
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      console.warn(
        `[gift-cards] restored ${amount} to ${card.code ?? redemption.gift_card_id} ` +
          `for order ${orderId}, but the card expired ${card.expires_at}`
      );
    }

    return { restored: amount, balance: newBalance };
  }

  await unclaim();
  return { restored: 0, reason: "could not credit balance (contention)" };
}