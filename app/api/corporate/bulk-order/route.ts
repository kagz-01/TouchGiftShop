import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function generateSlug(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

/**
 * POST /api/corporate/bulk-order
 * Creates N gift cards for bulk corporate orders.
 *
 * Body:
 *   productId    - which product / pack
 *   quantity     - number of recipients
 *   companyName  - company name
 *   contactPhone - billing phone for M-Pesa STK
 *   contactEmail - for invoice / receipt
 *   deliveryMethod - "links" | "csv"
 *   csvPhones    - string[] (only when deliveryMethod === "csv")
 *   paymentMethod - "mpesa" | "bank"
 *   amount       - per-unit amount in KES
 *   totalAmount  - final total (after discount)
 *   style        - card theme
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      quantity = 1,
      companyName,
      contactPhone,
      contactEmail,
      deliveryMethod = "links",
      csvPhones = [],
      paymentMethod = "bank",
      amount,
      totalAmount,
      style = "glassmorphism",
    } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "quantity must be >= 1" }, { status: 400 });
    }
    if (!amount) {
      return NextResponse.json({ error: "amount required" }, { status: 400 });
    }

    // 1. Create a master corporate order record
    const { data: masterOrder, error: orderErr } = await supabaseAdmin
      .from("corporate_orders")
      .insert({
        product_id: productId ?? null,
        company_name: companyName ?? "Corporate Client",
        contact_phone: contactPhone ? normalizePhone(contactPhone) : null,
        contact_email: contactEmail ?? null,
        quantity,
        unit_amount: amount,
        total_amount: totalAmount ?? amount * quantity,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        status: paymentMethod === "bank" ? "pending_invoice" : "pending_payment",
      })
      .select("id")
      .single();

    if (orderErr) {
      // Table may not exist yet — fall through gracefully
      console.warn("[Corporate] corporate_orders insert failed:", orderErr.message);
    }

    const masterOrderId = masterOrder?.id ?? `corp_${Date.now()}`;

    // 2. Generate gift cards in bulk
    const giftCards = Array.from({ length: quantity }, (_, i) => {
      const phone = deliveryMethod === "csv" && csvPhones[i]
        ? normalizePhone(csvPhones[i])
        : null;

      return {
        slug: generateSlug(12),
        amount,
        theme_style: style,
        sender_name: companyName ?? "Your Company",
        status: "active",
        claimed_by_phone: null,
        // store reference back to bulk order
        metadata: { corporate_order_id: masterOrderId, recipient_index: i + 1, ...(phone ? { phone } : {}) },
      };
    });

    const { data: cards, error: cardsErr } = await supabaseAdmin
      .from("digital_gift_cards")
      .insert(giftCards)
      .select("id, slug, metadata");

    if (cardsErr) {
      return NextResponse.json({ error: cardsErr.message }, { status: 500 });
    }

    const links = cards.map(c => ({
      id: c.id,
      slug: c.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgift.shop"}/open/gc/${c.slug}`,
      phone: (c.metadata as any)?.phone ?? null,
    }));

    // 3. If CSV mode with phones — fire off SMS blast (async, non-blocking)
    if (deliveryMethod === "csv" && links.length > 0) {
      const { sendSms } = await import("@/lib/notifications");
      const smsPromises = links
        .filter(l => l.phone)
        .map(l =>
          sendSms(
            `+${l.phone}`,
            `🎁 ${companyName ?? "Your company"} sent you a TouchGift! Open your exclusive gift: ${l.url}`
          ).catch(err => console.error("[SMS Blast] failed for", l.phone, err))
        );
      // Fire and forget — don't await
      Promise.allSettled(smsPromises);
    }

    // 4. Initiate payment if M-Pesa
    let paymentRedirectUrl: string | null = null;
    if (paymentMethod === "mpesa" && contactPhone && totalAmount) {
      try {
        const payRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            merchantReference: masterOrderId,
            description: `TouchGift Corporate – ${companyName ?? "Bulk"} – ${quantity} gifts`,
            phoneNumber: normalizePhone(contactPhone),
          }),
        });
        const payData = await payRes.json();
        if (payData.redirectUrl) paymentRedirectUrl = payData.redirectUrl;
      } catch (e) {
        console.error("[Corporate] PesaPal payment initiation failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: masterOrderId,
      count: cards.length,
      links,
      paymentMethod,
      paymentRedirectUrl,
      // For bank transfer — show invoice details
      invoiceDetails: paymentMethod === "bank" ? {
        amount: totalAmount ?? amount * quantity,
        reference: masterOrderId,
        bankName: "KCB Bank Kenya",
        accountName: "TouchGift Ltd",
        accountNumber: "1234567890",
        swiftCode: "KCBLKENX",
      } : null,
    });
  } catch (err: any) {
    console.error("[Corporate bulk-order]", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
