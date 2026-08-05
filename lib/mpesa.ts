/**
 * M-Pesa Daraja API integration (STK Push / "Lipa na M-Pesa Online").
 *
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 *
 * Flow: getAccessToken() -> initiateStkPush() -> Safaricom shows a prompt
 * on the payer's phone -> Safaricom POSTs the result to MPESA_CALLBACK_URL
 * (handled in app/api/mpesa/callback/route.ts).
 */

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );

  if (!res.ok) {
    throw new Error(`M-Pesa auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  // Token is valid ~1hr; refresh a minute early to be safe.
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000,
  };
  return cachedToken.value;
}

function timestampNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
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
  accountReference: string; // shows on the payer's STK prompt, e.g. order id
  transactionDesc: string;
}): Promise<{ checkoutRequestId: string; merchantRequestId: string }> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = timestampNow();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  const phone = normalizeKenyanPhone(params.phoneNumber);
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amount), // M-Pesa doesn't accept decimals
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: params.accountReference.slice(0, 12), // Safaricom limit
      TransactionDesc: params.transactionDesc.slice(0, 13),
    }),
  });

  const data = await res.json();

  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(
      `STK push failed: ${data.errorMessage || data.ResponseDescription || res.status}`
    );
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  };
}
