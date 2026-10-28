# Paystack Payment Integration Plan

## Goal
Integrate Paystack as the primary payment gateway for TouchGift Shop, routed through the verified Touch Line Ltd corporate account. Customers see "TouchGiftShop" on the checkout page, custom payment metadata, and UI disclaimers, while bank/M-Pesa settlements flow safely through Touch Line Ltd.

---

## Architecture & Flow
```
User (Checkout / Gift Card / Pool / Corporate)
   │
   ▼
POST /api/payment/create-order
   │
   ▼
lib/payment.ts (createPaymentOrder)
   │  - Minor units (KES amount * 100)
   │  - Fallback email (guest+<phone>@touchgiftshop.co.ke)
   │  - Metadata ("TouchGiftShop Order", storefront: "TouchGiftShop")
   │  - Channels: ["card", "mobile_money"]
   ▼
Paystack Initialize API (https://api.paystack.co/transaction/initialize)
   │
   ▼ returns authorization_url
User pays on Paystack Checkout (showing "Payment For: TouchGiftShop Order")
   │
   ├──▶ Webhook: POST /api/payment/webhook (HMAC-SHA512 verification)
   │       └──▶ lib/payment-settlement.ts (activates gift cards, pools, orders)
   │
   └──▶ Redirect: /payment-success?ref=<reference>
           └──▶ Poller calls GET /api/payment/status -> Paystack Verify API
```

---

## Tasks

- [x] **Task 1: Shared Settlement Engine** (`lib/payment-settlement.ts`)
  - Extracted and consolidated idempotent order, gift card, pool, and corporate fulfillment handlers.
  - Verified referral bonuses, loyalty points, and gift card balance deduction remain atomic.

- [x] **Task 2: Paystack API Integration** (`lib/payment.ts`)
  - Implemented `createPaymentOrder` calling Paystack's `/transaction/initialize` with minor units, fallback email, and custom metadata.
  - Implemented `getTransactionStatus` calling Paystack's `/transaction/verify/:reference`.
  - Maintained telephone normalization and refund helper.

- [x] **Task 3: Paystack Webhook Handler** (`app/api/payment/webhook/route.ts`)
  - Implemented POST handler verifying `x-paystack-signature` using HMAC-SHA512.
  - Handled `charge.success` and failure events using `lib/payment-settlement.ts`.

- [x] **Task 4: Update Checkout UI with Brand Transparency** (`components/checkout/CheckoutForm.tsx`)
  - Added Paystack badge and corporate disclosure note:
    *"Payments secured by Paystack · Processed via corporate account: Touch Line Ltd"*.
  - Updated redirect messages to reference Paystack instead of PesaPal.

- [x] **Task 5: Environment Configuration** (`.env.example` & `.env.local`)
  - Added `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
  - Documented test keys format (`sk_test_...`, `pk_test_...`).

- [x] **Task 6: Verification & Test Execution**
  - Verified TypeScript compilation across all modified files (`npx tsc --noEmit` passed with 0 errors).
  - Executed tests for Paystack payload construction, telephone normalization, fallback email generation, and constant-time HMAC-SHA512 verification.
