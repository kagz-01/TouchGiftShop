import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const BASE =
  process.env.PESAPAL_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

const TRACKING_ID = process.argv.includes("--status")
  ? process.argv[process.argv.indexOf("--status") + 1]
  : null;

async function getToken() {
  const authRes = await fetch(`${BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  const auth = await authRes.json();
  if (!auth.token) throw new Error(`Auth failed: ${JSON.stringify(auth)}`);
  return auth.token;
}

// --status mode: check an existing order
if (TRACKING_ID) {
  const token = await getToken();
  const res = await fetch(
    `${BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${TRACKING_ID}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
  );
  const s = await res.json();
  console.log(`Status:   ${s.payment_status_description}`);
  console.log(`Receipt:  ${s.confirmation_code ?? "-"}`);
  console.log(`Amount:   ${s.amount ?? "-"} ${s.currency ?? ""}`);
  console.log(`Method:   ${s.payment_method ?? "-"}`);
  console.log(JSON.stringify(s, null, 2));
  process.exit(0);
}

const ref = `TG-TEST-${Date.now().toString(36).toUpperCase()}`;

// 1. Auth
const token = await getToken();
console.log("✓ Step 1: Authenticated");

// 2. Submit order — mirrors lib/payment.ts createPaymentOrder exactly
const orderRes = await fetch(`${BASE}/api/Transactions/SubmitOrderRequest`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${auth.token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: ref,
    currency: "KES",
    amount: 100,
    description: "TouchGift launch test order",
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?ref=${ref}`,
    notification_id: process.env.PESAPAL_IPN_ID,
    billing_address: {
      phone_number: "254700000000",
      email_address: "kagunyaken12@gmail.com",
      country_code: "KE",
      first_name: "Launch",
      last_name: "Test",
    },
  }),
});
const order = await orderRes.json();

if (!orderRes.ok || !order.order_tracking_id) {
  console.error("STEP 2 FAILED (submit order):", JSON.stringify(order, null, 2));
  process.exit(1);
}
console.log(`✓ Step 2: Order created  ref=${ref}`);
console.log(`  tracking id: ${order.order_tracking_id}`);
console.log(`\n👉 PAYMENT LINK (open it, pay KSh 100 via M-Pesa):\n${order.redirect_url}\n`);

// 3. Status check (will be PENDING until paid)
const statusRes = await fetch(
  `${BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${order.order_tracking_id}`,
  { headers: { Authorization: `Bearer ${auth.token}`, Accept: "application/json" } }
);
const status = await statusRes.json();
console.log(`✓ Step 3: Status query OK → ${status.payment_status_description ?? JSON.stringify(status)}`);
console.log(`\nAfter paying, re-run: node scripts/test-transaction.mjs --status ${order.order_tracking_id}`);
