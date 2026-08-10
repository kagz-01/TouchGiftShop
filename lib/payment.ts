/**
 * PesaPal API 3.0 — Payment integration.
 *
 * Docs: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication
 *
 * Flow:
 *   1. createPaymentOrder() → returns PesaPal checkout URL
 *   2. Customer is redirected to PesaPal → chooses M-Pesa / card / bank
 *   3. PesaPal sends IPN to /api/payment/ipn when status changes
 *   4. Customer is redirected to /payment-success
 *   5. We query getTransactionStatus() to confirm
 *
 * Supports: M-Pesa, Visa/Mastercard, bank transfer.
 * Settlement: PesaPal settles to your registered bank account.
 */

const PESAPAL_BASE =
  process.env.PESAPAL_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY!,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`PesaPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error(`PesaPal auth rejected: ${JSON.stringify(data)}`);
  }

  // PesaPal tokens expire in 5 minutes; refresh 1 min early
  cachedToken = {
    value: data.token,
    expiresAt: Date.now() + 4 * 60 * 1000,
  };
  return cachedToken.value;
}

/** Normalizes phone to 2547XXXXXXXX format. */
export function normalizeKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  throw new Error(`Unrecognized phone number format: ${phone}`);
}

export async function createPaymentOrder(params: {
  amount: number;
  merchantReference: string;
  description: string;
  callbackUrl: string;
  phoneNumber?: string;
  email?: string;
}): Promise<{ orderTrackingId: string; redirectUrl: string }> {
  const token = await getAccessToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.ac.ke";

  const res = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: params.merchantReference,
      currency: "KES",
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      notification_id: process.env.PESAPAL_IPN_ID || "",
      billing_address: {
        phone_number: params.phoneNumber || "",
        email_address: params.email || "",
        country_code: "KE",
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.order_tracking_id) {
    throw new Error(
      `PesaPal order failed: ${data.message || data.error || res.status}`
    );
  }

  return {
    orderTrackingId: data.order_tracking_id,
    redirectUrl: data.redirect_url,
  };
}

export async function getTransactionStatus(
  orderTrackingId: string
): Promise<{
  status: "pending" | "completed" | "failed";
  receiptNumber?: string;
  amount?: number;
}> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`PesaPal status query failed: ${res.status}`);
  }

  const data = await res.json();

  // PesaPal status: "PENDING", "COMPLETED", "FAILED"
  const statusMap: Record<string, "pending" | "completed" | "failed"> = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
  };

  return {
    status: statusMap[data.status] ?? "pending",
    receiptNumber: data.mpesa_receipt_number || data.transaction_id,
    amount: data.amount,
  };
}
