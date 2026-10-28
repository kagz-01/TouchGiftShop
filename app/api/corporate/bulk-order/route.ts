import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveCorporateAccount } from "@/lib/corporate-accounts";

function generateSlug(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

const bodySchema = z.object({
  productId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().min(1).max(2000),
  companyName: z.string().min(1).max(200),
  senderName: z.string().max(100).optional(),
  contactPhone: z.string().min(1).max(30).optional(),
  contactEmail: z.string().email().optional(),
  deliveryMethod: z.enum(["links", "csv"]).default("links"),
  csvPhones: z.array(z.string()).max(2000).default([]),
  amount: z.coerce.number().positive(),
  totalAmount: z.coerce.number().positive().optional(),
  style: z.string().max(40).default("glassmorphism"),
});

/**
 * POST /api/corporate/bulk-order
 *
 * The gift-link factory: mint N shareable gift cards against one corporate
 * order, optionally texting each recipient.
 *
 * What changed: this used to insert seven columns `corporate_orders` does not
 * have (product_id, contact_phone, contact_email, quantity, unit_amount,
 * payment_method, delivery_method) and a status that is not in the enum, then
 * swallow the failure and mint gift cards pointing at an order id it made up.
 * Cards went out for orders that did not exist.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order" },
        { status: 400 }
      );
    }

    const {
      productId, quantity, companyName, senderName, contactPhone, contactEmail,
      deliveryMethod, csvPhones, amount, totalAmount, style,
    } = parsed.data;

    const total = totalAmount ?? amount * quantity;

    const account = companyName
      ? await resolveCorporateAccount({ company: companyName, email: contactEmail ?? "" }).catch(() => null)
      : null;

    /* 1. The master order. A failure here is fatal — cards minted against an id
          that resolves to nothing are the exact bug this file used to have. */
    const { data: masterOrder, error: orderErr } = await supabaseAdmin
      .from("corporate_orders")
      .insert({
        corporate_account_id: account?.id ?? null,
        status: "pending_payment",
        company_name: companyName,
        sender_name: senderName ?? companyName,
        sender_phone: normalizePhone(contactPhone ?? "0"),
        product_id: productId ?? null,
        unit_amount: amount,
        recipient_count: quantity,
        subtotal: amount * quantity,
        total_amount: total,
        payment_method: "paystack",
        delivery_method: deliveryMethod,
      })
      .select("id")
      .single();

    if (orderErr) {
      console.error("[Corporate] corporate_orders insert failed:", orderErr.message, orderErr.code);
      return NextResponse.json(
        { error: "Could not create this order. Please try again." },
        { status: 500 }
      );
    }

    /* 2. Gift cards, pointing at a real order. */
    const giftCards = Array.from({ length: quantity }, (_, i) => {
      const phone =
        deliveryMethod === "csv" && csvPhones[i] ? normalizePhone(csvPhones[i]) : null;

      return {
        slug: generateSlug(12),
        amount,
        theme_style: style,
        sender_name: companyName,
        status: "active",
        corporate_order_id: masterOrder.id,
        metadata: {
          corporate_order_id: masterOrder.id,
          recipient_index: i + 1,
          ...(phone ? { phone } : {}),
        },
      };
    });

    const { data: cards, error: cardsErr } = await supabaseAdmin
      .from("digital_gift_cards")
      .insert(giftCards)
      .select("id, slug, metadata");

    if (cardsErr) {
      // Half-minted is worse than none: take the whole thing back.
      console.error("[Corporate] gift card insert failed:", cardsErr.message);
      await supabaseAdmin.from("digital_gift_cards").delete().eq("corporate_order_id", masterOrder.id);
      await supabaseAdmin.from("corporate_orders").delete().eq("id", masterOrder.id);
      return NextResponse.json({ error: "Could not create gift links. Please try again." }, { status: 500 });
    }

    const links = (cards ?? []).map((c: { id: string; slug: string; metadata: unknown }) => ({
      id: c.id,
      slug: c.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgift.shop"}/open/gc/${c.slug}`,
      phone: (c.metadata as { phone?: string } | null)?.phone ?? null,
    }));

    /* 3. Text the recipients. Fire and forget — the cards exist, a failed SMS is
          the buyer's next problem, not a reason to fail the order. */
    if (deliveryMethod === "csv") {
      const { sendSms } = await import("@/lib/notifications");
      const blasts = links
        .filter((l) => l.phone)
        .map((l) =>
          sendSms(
            `+${l.phone}`,
            `🎁 ${companyName} sent you a TouchGift! Open your exclusive gift: ${l.url}`
          ).catch((err) => console.error("[SMS Blast] failed for", l.phone, err))
        );
      void Promise.allSettled(blasts);
    }

    /* 4. Paystack. The reference is `corp-<id>` because that is what the webhook
       handler routes on; it used to pass the bare uuid, which the handler read
       as a consumer `orders` id and matched nothing — so a paid bulk order was
       never confirmed. */
    let paymentRedirectUrl: string | null = null;
    let paymentError: string | null = null;
    if (contactPhone) {
      try {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        const payRes = await fetch(`${base}/api/payment/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            merchantReference: `corp-${masterOrder.id}`,
            description: `Corporate gifts – ${companyName} – ${quantity}`,
            phoneNumber: normalizePhone(contactPhone),
            email: contactEmail,
            name: senderName ?? companyName,
          }),
        });
        const payData = await payRes.json();
        paymentRedirectUrl = payData.redirectUrl ?? null;
        if (payData.error) paymentError = payData.error;

        if (payData.orderTrackingId) {
          await supabaseAdmin
            .from("corporate_orders")
            .update({
              payment_tracking_id: payData.orderTrackingId,
              payment_merchant_ref: `corp-${masterOrder.id}`,
            })
            .eq("id", masterOrder.id);
        }
      } catch (e) {
        paymentError = "Could not start the payment";
        console.error("[Corporate] payment initiation failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: masterOrder.id,
      count: links.length,
      links,
      paymentRedirectUrl,
      ...(paymentError ? { paymentError } : {}),
    });
  } catch (err) {
    console.error("[Corporate bulk-order]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
