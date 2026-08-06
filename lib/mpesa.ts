/**
 * Tuma Payment Gateway — STK Push integration.
 *
 * Docs: https://github.com/matatashadrack/tuma-mpesa-stk-push
 *
 * Flow: getAccessToken() -> initiateStkPush() -> customer gets
 * an M-Pesa prompt -> Tuma POSTs the result to CALLBACK_URL
 * (handled in app/api/mpesa/callback/route.ts).
 *
 * Funds settle directly to your Family Bank account.
 */

const TUMA_BASE = "https://api.tuma.co.ke";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const email = process.env.TUMA_EMAIL!;
  const apiKey = process.env.TUMA_API_KEY!;

  const res = await fetch(`${TUMA_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, api_key: apiKey }),
  });

  if (!res.ok) {
    throw new Error(`Tuma auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Tuma auth rejected: ${data.message}`);
  }

  // Tuma JWT tokens are valid ~24h; refresh 5 min early
  cachedToken = {
    value: data.data.token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };
  return cachedToken.value;
}

/** Normalizes 07XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX to 2547XXXXXXXX. */
export function normalizeKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  throw new Error(`Unrecognized phone number format: ${phone}`);
}

export async function initiateStkPush(params: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<{ checkoutRequestId: string; merchantRequestId: string }> {
  const phone = normalizeKenyanPhone(params.phoneNumber);
  const token = await getAccessToken();

  const res = await fetch(`${TUMA_BASE}/payment/stk-push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      phone,
      description: params.transactionDesc.slice(0, 255),
      callback_url: process.env.TUMA_CALLBACK_URL,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(`Tuma STK push failed: ${data.message || res.status}`);
  }

  return {
    checkoutRequestId: data.data.checkout_request_id,
    merchantRequestId: data.data.merchant_request_id,
  };
}
