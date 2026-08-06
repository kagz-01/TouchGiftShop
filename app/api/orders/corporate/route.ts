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
  customMessage: z.string().optional(),
  giftWrap: z.enum(["standard", "premium", "branded"]).default("standard"),
  deliveryDate: z.string().optional(),
});

const WRAP_PRICES: Record<string, number> = {
  standard: 0,
  premium: 100,
  branded: 200,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = corporateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, recipients, senderName, senderPhone, companyName, customMessage, giftWrap, deliveryDate } = parsed.data;

    // Fetch product price
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate pricing
    const recipientCount = recipients.length;
    const bulkDiscount = recipientCount >= 50 ? 0.15 : recipientCount >= 10 ? 0.10 : 0;
    const wrapExtra = WRAP_PRICES[giftWrap] || 0;
    const perItem = product.price + wrapExtra;
    const subtotal = perItem * recipientCount;
    const discountAmount = subtotal * bulkDiscount;
    const totalAmount = subtotal - discountAmount;

    // Create individual orders for each recipient
    const orderIds: string[] = [];
    const ordersToInsert = recipients.map((r) => ({
      product_id: productId,
      product_name: product.name,
      total_amount: perItem,
      sender_name: senderName,
      sender_phone: normalizeKenyanPhone(senderPhone),
      recipient_name: r.name,
      recipient_phone: normalizeKenyanPhone(r.phone),
      is_anonymous: false,
      dont_call_recipient: false,
      gift_note: r.note || customMessage || "",
      quantity: 1,
      shipping_fee: 0,
      status: "pending_payment",
      order_type: "corporate",
      corporate_meta: JSON.stringify({
        companyName: companyName || null,
        giftWrap,
        bulkDiscount,
        deliveryDate: deliveryDate || null,
      }),
    }));

    // Insert in batches of 50
    for (let i = 0; i < ordersToInsert.length; i += 50) {
      const batch = ordersToInsert.slice(i, i + 50);
      const { data: inserted, error: insertError } = await supabase
        .from("orders")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error("Corporate order insert error:", insertError);
        return NextResponse.json({ error: "Failed to create orders" }, { status: 500 });
      }

      if (inserted) {
        orderIds.push(...inserted.map((o) => o.id));
      }
    }

    // Create a single PesaPal payment for the entire corporate order
    const merchantReference = `CORP-${Date.now()}-${orderIds[0].slice(0, 8)}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app";

    const payment = await createPaymentOrder({
      amount: totalAmount,
      merchantReference,
      description: `TouchGift Corporate: ${product.name} × ${recipientCount} recipients`,
      callbackUrl: `${siteUrl}/payment-success?ref=${merchantReference}&type=corporate`,
      phoneNumber: normalizeKenyanPhone(senderPhone),
    });

    // Update all orders with the payment reference
    await supabase
      .from("orders")
      .update({
        payment_tracking_id: payment.orderTrackingId,
        payment_merchant_ref: merchantReference,
      })
      .in("id", orderIds);

    return NextResponse.json({
      success: true,
      orderIds,
      totalOrders: orderIds.length,
      pricing: {
        perItem,
        recipientCount,
        subtotal,
        bulkDiscount: `${bulkDiscount * 100}%`,
        discountAmount,
        totalAmount,
        currency: "KES",
      },
      payment: {
        trackingId: payment.orderTrackingId,
        redirectUrl: payment.redirectUrl,
        merchantReference,
      },
    });
  } catch (error) {
    console.error("Corporate order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
