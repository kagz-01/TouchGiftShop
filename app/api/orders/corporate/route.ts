import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPaymentOrder, normalizeKenyanPhone } from "@/lib/payment";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const recipientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  note: z.string().optional(),
});

const corporateOrderSchema = z.object({
  productId: z.string().uuid(),
  recipients: z.array(recipientSchema).min(1).max(500),
  senderName: z.string().min(1),
  senderPhone: z.string().min(1),
  companyName: z.string().optional(),
  corporateAccountId: z.string().uuid().optional(),
  customMessage: z.string().optional(),
  giftWrap: z.enum(["standard", "premium", "branded"]).default("standard"),
  deliveryDate: z.string().optional(),
  department: z.string().max(120).optional(),
});

const WRAP_PRICES: Record<string, number> = {
  standard: 0,
  premium: 100,
  branded: 200,
};

const wrapSurcharge = (wrap: string) => WRAP_PRICES[wrap] ?? 0;

/** Tiered the way the catalog page quotes it, so the number here matches the number the buyer saw. */
function bulkDiscountPercent(count: number) {
  if (count >= 50) return 15;
  if (count >= 10) return 10;
  return 0;
}

/* This route wrote orders.product_name, orders.order_type, orders.corporate_meta
   and orders.payment_tracking_id / payment_merchant_ref — none of which exist,
   so every corporate order 500'd. A fulfilment order holds what is delivered;
   the company, the discount and the invoice belong to corporate_orders. The
   order row is now created per recipient and linked to that parent, which is
   what the portal reads. */

export async function POST(req: NextRequest) {
  try {
    const parsed = corporateOrderSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      productId, recipients, senderName, senderPhone, companyName,
      corporateAccountId, customMessage, giftWrap, deliveryDate, department,
    } = parsed.data;

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const recipientCount = recipients.length;
    const wrap = wrapSurcharge(giftWrap);
    const unitPrice = Number(product.price) + wrap;
    const subtotal = unitPrice * recipientCount;
    const discountPercent = bulkDiscountPercent(recipientCount);
    const discountAmount = (subtotal * discountPercent) / 100;
    const totalAmount = subtotal - discountAmount;

    /* Resolve the company so this order belongs to a tenant the client portal
       can see. Matching is the same conservative rule quote-request uses: exact
       name first, then a shared email domain — but here we only have a name, so
       an unknown company creates a new account rather than guessing at one. */
    let accountId: string | null = corporateAccountId ?? null;
    if (!accountId && companyName) {
      const { data: account } = await supabase
        .from("corporate_accounts")
        .select("id")
        .ilike("company_name", companyName.trim())
        .limit(1)
        .maybeSingle();
      if (account) {
        accountId = account.id;
      } else {
        const { data: created } = await supabase
          .from("corporate_accounts")
          .insert({ company_name: companyName.trim(), is_verified: false })
          .select("id")
          .single();
        accountId = created?.id ?? null;
      }
    }

    /* 1. The parent. Everything about the company, the money and the invoice
          lives here; the per-recipient rows below are fulfilment. */
    const { data: parent, error: parentErr } = await supabase
      .from("corporate_orders")
      .insert({
        corporate_account_id: accountId,
        status: "pending_payment",
        company_name: companyName ?? null,
        sender_name: senderName,
        sender_phone: normalizeKenyanPhone(senderPhone),
        custom_message: customMessage ?? null,
        gift_wrap: giftWrap,
        product_id: productId,
        unit_amount: unitPrice,
        recipient_count: recipientCount,
        subtotal,
        bulk_discount_percent: discountPercent,
        bulk_discount_amount: discountAmount,
        wrap_surcharge: wrap,
        total_amount: totalAmount,
        delivery_date: deliveryDate ? new Date(deliveryDate).toISOString().slice(0, 10) : null,
        notes: department ? `Department: ${department}` : null,
      })
      .select("id")
      .single();

    if (parentErr) {
      console.error("Corporate order parent failed:", parentErr.message, parentErr.code);
      return NextResponse.json(
        { error: "Could not start this order. Please try again." },
        { status: 500 }
      );
    }

    /* 2. One fulfilment order per recipient — only real `orders` columns. */
    const rows = recipients.map((r) => ({
      product_id: productId,
      total_amount: unitPrice,
      shipping_fee: 0,
      sender_name: senderName,
      sender_phone: normalizeKenyanPhone(senderPhone),
      recipient_name: r.name,
      recipient_phone: normalizeKenyanPhone(r.phone),
      is_anonymous: false,
      dont_call_recipient: false,
      gift_note: r.note || customMessage || "",
      quantity: 1,
      status: "pending_payment",
      corporate_order_id: parent.id,
    }));

    const orderIds: string[] = [];
    for (let i = 0; i < rows.length; i += 50) {
      const { data: inserted, error: insertError } = await supabase
        .from("orders")
        .insert(rows.slice(i, i + 50))
        .select("id");

      if (insertError) {
        /* A partial fan-out is worse than none: half the company has orders and
           half does not, with no record of which. Roll the parent back and tell
           the buyer plainly. */
        console.error("Corporate fulfilment rows failed:", insertError.message, insertError.code);
        await supabase.from("corporate_orders").delete().eq("id", parent.id);
        return NextResponse.json(
          { error: "Could not create this order. Nothing was charged — please try again." },
          { status: 500 }
        );
      }
      if (inserted) orderIds.push(...inserted.map((o: { id: string }) => o.id));
    }

    /* 3. One link per recipient back to the parent, so a recipient can be traced
          from either side without walking every order. */
    const { error: linkErr } = await supabase.from("corporate_order_recipients").insert(
      recipients.map((r, i) => ({
        corporate_order_id: parent.id,
        recipient_name: r.name,
        recipient_phone: normalizeKenyanPhone(r.phone),
        personal_note: r.note || null,
        status: "pending_payment",
        order_id: orderIds[i] ?? null,
      }))
    );
    if (linkErr) {
      console.warn("Recipient links failed (orders still created):", linkErr.message);
    }

    /* 4. Payment. `pesapal_tracking_id` is the real column on `orders`;
          payment_merchant_ref lives on the parent. */
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
    const merchantReference = `CORP-${parent.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

    let payment: { orderTrackingId: string; redirectUrl: string } | null = null;
    let paymentError: string | null = null;
    try {
      payment = await createPaymentOrder({
        amount: totalAmount,
        merchantReference,
        description: `TouchGift Corporate: ${product.name} × ${recipientCount}`,
        callbackUrl: `${siteUrl}/payment-success?ref=${merchantReference}&type=corporate`,
        phoneNumber: normalizeKenyanPhone(senderPhone),
      });
    } catch (e) {
      /* The provider's own message is for the log, not the buyer: it quotes
         contract terms and internal codes, and it tells the customer nothing
         they can act on. */
      console.error("Corporate payment init failed:", e);
      paymentError = "We could not start the payment for this order.";
    }

    if (payment) {
      await supabase
        .from("corporate_orders")
        .update({ payment_tracking_id: payment.orderTrackingId, payment_merchant_ref: merchantReference })
        .eq("id", parent.id);
      await supabase.from("orders").update({ pesapal_tracking_id: payment.orderTrackingId }).in("id", orderIds);
    } else {
      /* No payment reference means ops has to chase it manually, so the order
         must not look like it is simply waiting for a redirect. `notes` is left
         alone — it already carries the department, and overwriting it here is
         how a department quietly became "Unassigned" in the reports. */
      await supabase
        .from("corporate_orders")
        .update({ payment_merchant_ref: merchantReference })
        .eq("id", parent.id);
    }

    return NextResponse.json({
      success: true,
      corporateOrderId: parent.id,
      orderIds,
      totalOrders: orderIds.length,
      pricing: {
        perItem: unitPrice,
        recipientCount,
        subtotal,
        bulkDiscount: `${discountPercent}%`,
        discountAmount,
        totalAmount,
        currency: "KES",
      },
      payment: payment
        ? { trackingId: payment.orderTrackingId, redirectUrl: payment.redirectUrl, merchantReference }
        : null,
      /* The order exists either way. A buyer who sees this knows to expect an
         invoice rather than a redirect. */
      paymentPending: !payment,
      ...(paymentError ? { paymentError } : {}),
    });
  } catch (error) {
    console.error("Corporate order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
