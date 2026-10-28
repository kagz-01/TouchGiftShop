/**
 * Paystack Payment Integration for TouchGift Shop.
 *
 * Transactions route through the verified Touch Line Ltd corporate account.
 * Branding is maintained via:
 *   1. Custom transaction metadata ("Payment For: TouchGiftShop Order")
 *   2. Custom fields shown on Paystack checkout
 *   3. Customer expectation disclaimers in the frontend UI
 *
 * Docs: https://paystack.com/docs/api/transaction
 *
 * Flow:
 *   1. createPaymentOrder() → returns Paystack checkout authorization_url & reference
 *   2. Customer completes payment on Paystack (Card or M-Pesa)
 *   3. Paystack fires webhook to /api/payment/webhook (verified via HMAC-SHA512)
 *   4. Customer returns to /payment-success?ref=...
 *   5. getTransactionStatus() confirms status with Paystack /transaction/verify/:ref
 */

const PAYSTACK_BASE = "https://api.paystack.co";

/** Normalizes phone to 2547XXXXXXXX or 2541XXXXXXXX format. */
export function normalizeKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && (digits.length === 12)) return digits;
  if (digits.startsWith("0") && (digits.length === 10)) return `254${digits.slice(1)}`;
  if ((digits.startsWith("7") || digits.startsWith("1")) && (digits.length === 9)) return `254${digits}`;
  // Fallback if already cleaned or unusual
  if (digits.length >= 9) return digits.startsWith("254") ? digits : `254${digits}`;
  throw new Error(`Unrecognized phone number format: ${phone}`);
}

/**
 * Paystack strictly requires a valid customer email on every transaction.
 * For fast Kenyan e-commerce where buyers only enter an M-Pesa phone number,
 * this generates a deterministic fallback email.
 */
export function getCustomerEmail(email?: string, phone?: string): string {
  if (email && email.includes("@") && email.trim().length > 3) {
    return email.trim().toLowerCase();
  }

  if (phone) {
    try {
      const normalized = normalizeKenyanPhone(phone);
      return `guest+${normalized}@touchgiftshop.co.ke`;
    } catch {
      const clean = phone.replace(/\D/g, "");
      if (clean) return `guest+${clean}@touchgiftshop.co.ke`;
    }
  }

  return `guest+${Date.now()}@touchgiftshop.co.ke`;
}

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    console.warn("PAYSTACK_SECRET_KEY is missing. Payment calls will fail until configured.");
  }
  return key || "";
}

export async function createPaymentOrder(params: {
  amount: number;
  merchantReference: string;
  description: string;
  callbackUrl: string;
  phoneNumber?: string;
  email?: string;
  name?: string;
}): Promise<{ orderTrackingId: string; redirectUrl: string; accessCode?: string }> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("Payment gateway configuration error: PAYSTACK_SECRET_KEY is not set.");
  }

  const customerEmail = getCustomerEmail(params.email, params.phoneNumber);
  // Paystack amounts are in subunit minor units (cents / KES * 100)
  const amountMinorUnits = Math.round(params.amount * 100);

  const payload = {
    email: customerEmail,
    amount: amountMinorUnits,
    currency: "KES",
    reference: params.merchantReference,
    callback_url: params.callbackUrl,
    channels: ["card", "mobile_money"],
    metadata: {
      custom_fields: [
        {
          display_name: "Payment For",
          variable_name: "payment_for",
          value: "TouchGiftShop Order",
        },
        {
          display_name: "Storefront",
          variable_name: "storefront",
          value: "TouchGiftShop",
        },
        {
          display_name: "Corporate Group",
          variable_name: "corporate_group",
          value: "Touch Line Ltd",
        },
      ],
      storefront: "TouchGiftShop",
      parent_company: "Touch Line Ltd",
      merchant_reference: params.merchantReference,
      phone: params.phoneNumber || "",
      customer_name: params.name || "",
      description: params.description || "TouchGiftShop Order",
    },
  };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.status || !data.data?.authorization_url) {
    const errorMsg = data.message || `Paystack initialization failed (status: ${res.status})`;
    console.error("Paystack createPaymentOrder error:", data);
    throw new Error(errorMsg);
  }

  return {
    orderTrackingId: data.data.reference || params.merchantReference,
    redirectUrl: data.data.authorization_url,
    accessCode: data.data.access_code as string | undefined,
  };
}

export async function getTransactionStatus(
  reference: string
): Promise<{
  status: "pending" | "completed" | "failed";
  receiptNumber?: string;
  amount?: number;
}> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("Payment gateway configuration error: PAYSTACK_SECRET_KEY is not set.");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    // If not found or pending
    if (res.status === 404 || data.message?.toLowerCase().includes("not found")) {
      return { status: "pending" };
    }
    throw new Error(`Paystack verification failed: ${data.message || res.status}`);
  }

  const txData = data.data;
  let status: "pending" | "completed" | "failed" = "pending";

  if (txData.status === "success") {
    status = "completed";
  } else if (txData.status === "failed" || txData.status === "reversed" || txData.status === "abandoned") {
    status = "failed";
  } else {
    status = "pending";
  }

  // Paystack amount is in subunit minor units (cents / KES * 100)
  const amount = typeof txData.amount === "number" ? txData.amount / 100 : undefined;
  const receiptNumber =
    txData.receipt_number ||
    txData.reference ||
    (txData.id ? String(txData.id) : undefined);

  return {
    status,
    receiptNumber,
    amount,
  };
}

/**
 * Initiates a refund via Paystack API.
 */
export async function refundPayment(
  referenceOrId: string,
  amount: number,
  username: string,
  remarks: string
): Promise<{ success: boolean; message: string }> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return { success: false, message: "PAYSTACK_SECRET_KEY is not set." };
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        transaction: referenceOrId,
        amount: Math.round(amount * 100),
        merchant_note: `${remarks} (initiated by ${username})`,
      }),
    });

    const data = await res.json();

    if (data.status) {
      return { success: true, message: data.message || "Refund submitted successfully" };
    }

    return {
      success: false,
      message: data.message || `Refund failed (status ${res.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Refund request error",
    };
  }
}
