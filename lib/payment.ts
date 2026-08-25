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
  name?: string;
}): Promise<{ orderTrackingId: string; redirectUrl: string }> {
  const token = await getAccessToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

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
        first_name: params.name ? params.name.split(" ")[0] : "Customer",
        last_name: params.name ? params.name.split(" ").slice(1).join(" ") || "TouchGift" : "TouchGift",
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.order_tracking_id) {
    const errorDetails = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
    const message = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
    throw new Error(
      `PesaPal order failed: ${message || errorDetails || res.status} - Full response: ${JSON.stringify(data)}`
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

/**
 * Requests a refund via PesaPal API 3.0.
 *
 * Limitations:
 * - Only one refund per payment allowed
 * - Only COMPLETED mobile payments can be refunded (full amount only)
 * - PesaPal must approve the refund before funds are returned
 *
 * @param confirmationCode - The PesaPal tracking ID (pesapal_tracking_id) from the original payment
 * @param amount - Amount to refund (must match original for mobile payments)
 * @param username - Identity of who initiated the refund (admin name)
 * @param remarks - Reason for the refund
 */
export async function refundPayment(
  confirmationCode: string,
  amount: number,
  username: string,
  remarks: string
): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${PESAPAL_BASE}/api/Transactions/RefundRequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      confirmation_code: confirmationCode,
      amount,
      username,
      remarks,
    }),
  });

  const data = await res.json();

  if (data.error === 200) {
    return { success: true, message: data.message || "Refund submitted" };
  }

  return {
    success: false,
    message: data.message || `Refund failed (error: ${data.error})`,
  };
}
