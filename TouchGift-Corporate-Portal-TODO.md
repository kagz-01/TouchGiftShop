# Corporate Client Portal — Build TODO

_Status: Phases 0–4 and 9 complete. Phases 3 (PDF), 5–8 remain._
_Last updated: 2026-10-15_
_Last build commits: `6e08ff6` (migrate runner), `4fa1b1e` (identity), `034b470` (client session), `ea46c5a` (quote references), `eb6f20b` (portal), `65cd951` (portal pages), `dfad906` (ops sees responses), `0586b35` (order spine), `b65d8b3` (test-tenant cleanup)_

---

## 1. What "a real client portal" means here

A corporate client signs in, sees **only their company's data**, and can act on
it. Everything else on `/corporate` is either public marketing or internal ops.

The portal is *not* a second copy of the ops dashboard. The difference:

| | Ops dashboard (exists) | Client portal (this TODO) |
|---|---|---|
| Who | TouchGift staff | The client's own people |
| Sees | Every quote, every client | One company, scoped |
| Can do | Price, assign, decline, annotate | Review, accept, decline, message, export |
| Must never see | — | `internal_notes`, `assignee`, credit margin, other companies |

**Definition of done**

1. A client can reach the portal from a magic link and land on their own data.
2. A client can see a quote, read the real quoted price, and accept or decline it
   — and ops sees that decision without doing anything.
3. Every screen shows a truthful empty state when there is no data. No
   placeholder numbers, ever.
4. Nothing in the portal is reachable without an active membership on that
   account. Verified by test, not by inspection.
5. The ops dashboard keeps working unchanged throughout.

---

## 2. Ground truth before writing any UI

Verified against `db/schema.sql` and the live database.

| Fact | Consequence |
|---|---|
| `corporate_accounts.user_id` exists (`:387`) but **no code ever writes it** | There is no link between a company and a login. One nullable FK is also too thin — a company has many people. |
| `corporate_quote_requests.corporate_account_id` exists (Phase 2.3, `:1778`) and is **never populated** | Quotes are identified only by free-text `company_name` + `email`. |
| `corporate_inquiries.ref_code` is unique, generated, and **emailed to the customer** | The reference exists end-to-end but is never displayed on any page. |
| No `corporate_account_members`, no invite, no claim, no corporate session cookie | Phase 1 has to build tenancy from zero. |
| `middleware.ts:79` guards only `/admin` and `/api/admin` | `/corporate/*` and `/api/corporate/*` are publicly reachable; safety is per-route `requireAdmin()`. |
| Only cookie in the app is `tg_admin_session` | No customer session exists. |
| `corporate_orders` has proper columns (`:442-467`) and **zero working writers** | No order can be created or retrieved today. |
| `orders` has **no** company/billing column | Corporate and consumer orders are indistinguishable at the row level. |
| RLS exists only on `corporate_inquiries` and `corporate_quote_requests` (service-role only) | Every other corporate table is unguarded. |
| Portal-adjacent ops routes query columns that don't exist (`orders.is_corporate`, `orders.department`, `corporate_gift_pools.current_amount`) | `/api/corporate/stats` and `/api/corporate/reports` silently return zeros. |
| `corporate_gift_pools` (`current_balance`) is unrelated to `group_gifting_pools` | `POST /api/corporate/pools` mints `/pool/{slug}` links that resolve to the wrong table. |

**Naming to keep straight:** the CRM is `client_profiles` (gift recipients),
pools are `corporate_gift_pools`, milestone rules are `milestone_rules`
(unprefixed), templates are `hamper_templates`. There is no `corporate_clients`.

---

## 3. Phase 0 — Unblock the tooling (do this first)

- [x] **0.1.** Fix `scripts/migrate.mjs`. `applied()` interpolates
      `${sql.TRACKING_TABLE}`, which is `undefined` (the identifier helper is
      `sql("name")`), so every invocation throws — and the trailing `catch {}`
      swallows the message and exits 1 silently. No migration in Phase 1 can be
      applied until this is fixed.
- [x] **0.2.** Replace the bare `catch {}` with one that prints the error. A
      migration tool that fails quietly is worse than no tool.
- [x] **0.3.** Add retry to the pooler connection in both scripts. Port 5432 to
      `aws-1-eu-west-1.pooler.supabase.com` failed twice in a row today and
      succeeded on the third attempt.
- [x] **0.4.** Run `node scripts/migrate.mjs --status` and record the real
      applied set. Confirm 13/13 and that `--diff` reports no drift.
- [x] **0.5.** Make `scripts/cleanup-test-rows.mjs` reachable from this
      environment, or document that it only runs on a networked machine.

**Done when:** `--status` prints the applied list and `--diff` is clean.

---

## 4. Phase 1 — Identity and tenancy (the foundation)

Nothing else is worth building until a "who is this person" exists.

### 4.1 Schema

- [x] **1.1.** New migration `db/migrations/2026-10-15-corporate-portal-identity.sql`:
      `corporate_account_members` — `id`, `corporate_account_id` (FK, cascade),
      `user_id` (FK, nullable — set on first sign-in), `email`, `role`
      (`owner | member | viewer`), `status` (`invited | active | revoked`),
      `invited_by`, `last_seen_at`, timestamps. Partial unique index on
      `(corporate_account_id, lower(email))`.
- [x] **1.2.** Add `corporate_quote_requests.reference TEXT` (unique when not
      null) and `corporate_quote_requests.customer_response JSONB`. Format
      `TGQ-XXXXX`. Also add `corporate_inquiries.corporate_account_id`.
- [x] **1.3.** Mirror both into `db/schema.sql` (canonical) — no duplication,
      migration only.
- [x] **1.4.** Add `reference` + `corporate_account_id` to the quote-request
      insert path, resolving the account by verified email domain and creating a
      `corporate_accounts` row on first sight.

### 4.2 Access model — no self-claimed access to company data

- [x] **1.5.** `lib/corporate-auth.ts`: `getCorporateSession()` returns
      `{ user, membership, account }` from the Supabase session cookie, using
      the server client. `requireCorporate()` returns a `NextResponse` 401 when
      there is no membership.
- [x] **1.6.** Sign-in: email magic link via the existing Supabase OTP
      (`app/login/page.tsx:135` pattern), `emailRedirectTo` pointing at
      `/corporate/portal`. Phone OTP is consumer-only and must not appear here.
- [x] **1.7.** Invitation only. Ops invites a colleague by email; the invite
      grants `status: 'invited'`; the first successful magic-link sign-in flips
      it to `active` and stamps `user_id`. A stranger who guesses a company name
      gets nothing.
- [ ] **1.8.** A visitor who is signed in but has no membership sees a real
      "no access yet, ask your account manager" state — never a redirect loop
      and never a 401 screen.
- [x] **1.9.** Every portal API scopes by `membership.corporate_account_id`.
      No route may accept a company id from the client.

**Done when:** two different accounts cannot see each other's data, proven by a
test that forges the request.

**Verified:** an invited address follows its magic link through the real
`/auth/callback`, the membership is promoted exactly there, and the portal
renders. A signed-in stranger with no membership gets a real "ask your account
manager" screen, not a 401.

---

## 5. Phase 2 — Portal shell and its visual language

The ask: *demure*. Restrained, quiet, expensive-looking. The ops screens are
dense, dark and amber — that is a working surface, not a client surface. Copy the
craft, not the palette.

### 5.1 Tokens

- [x] **2.1.** Wrap the portal in `.corporate-shell` and use its tokens rather
      than hex. Light values already exist (`app/globals.css:1505-1521`).
- [x] **2.2.** Add `--portal-*` tokens for the client surface: page ground, one
      card surface, hairline border, text / muted / faint, single accent, one
      success and one warning. Roughly five tones total. No per-feature rainbow.
- [x] **2.3.** Portal is light-first. Dark mode is supported via
      `[data-theme='dark']`, the pattern already used in
      `components/account/AccountClient.tsx:30-37` — no corporate page is
      theme-aware today.

### 5.2 Composition rules

- [x] **2.4.** Match `app/orders/OrdersClient.tsx` for the customer-side chrome:
      sticky white header on a hairline, `font-display` headings, `rounded-3xl`
      cards on `border-surface-border`, hover `shadow-card`. It is the most
      refined light surface in the repo.
- [x] **2.5.** Serif display for headings and numbers only. Body is Inter.
      No italic display except where the brand already uses it.
- [x] **2.6.** Whitespace over borders. Prefer a gap to a divider; use hairlines
      only to separate rows in a list.
- [x] **2.7.** Status as text plus a small dot, never a filled pill screaming
      colour. Reuse `QuoteOpsPanel`'s `STATUS_CONFIG` semantics, re-skinned.
- [x] **2.8.** No glow, no gradient mesh, no `animate-pulse-soft` in the portal.
      Motion is 150–200ms opacity/translate only, and obeys the existing
      `prefers-reduced-motion` switch (`globals.css:1288-1295`).
- [x] **2.9.** Three states for every data surface, following
      `components/corporate/CorporateProof.tsx:64-95`: skeleton, explicit failure
      with retry, explicit empty with a next action. Never a blank box.

### 5.3 Layout

- [x] **2.10.** `/corporate/portal` — overview: greeting, account name, next
      action, and four numbers that are all real.
- [x] **2.11.** Left rail on `lg`, top tabs below it. Rail labels: Overview,
      Quotes, Orders, Spend, People, Settings.
- [ ] **2.12.** Move `/corporate/dashboard` out of the customer path — it is
      staff. Label it "Ops" in navigation so nobody mistakes the two.
- [x] **2.13.** Mobile is the priority viewport, not an afterthought: 375px
      first, no horizontal scroll, no sub-16px inputs, no target under 44px.

---

## 6. Phase 3 — Quotes (the anchor feature)

This is the loop that makes it a portal rather than a report.

- [x] **3.1.** `GET /api/corporate/portal/quotes` — scoped by account, returns
      **customer-safe fields only**: reference, product, quantity, category,
      customer estimate, quoted amount, valid-until, status, created date.
      Explicitly excludes `internal_notes`, `assignee`, `design_payload`.
- [x] **3.2.** `POST /api/corporate/portal/quotes/[reference]/respond` — the
      customer accepts or declines. Writes `customer_response`, moves status via
      the existing transition map, stamps the time, and writes one row to
      `corporate_analytics` or an audit table.
- [x] **3.3.** Accepting requires an explicit confirm step showing the exact
      amount and validity date. No one-tap accept.
- [x] **3.4.** Status vocabulary for customers is not the internal enum:
      `Received → Priced → Accepted/Declined → In fulfilment → Delivered`.
- [ ] **3.5.** Quote detail shows a line-item breakdown. Add
      `corporate_quote_lines` if ops cannot express a quote as one amount.
- [x] **3.6.** Every quote carries a human reference the client can quote on the
      phone (`TGQ-XXXXX`), shown in the list, the detail, the email and the PDF.
- [ ] **3.7.** Client can download the quote as a PDF and share it internally.
- [x] **3.8.** Notify ops the moment a client responds — Resend, same pattern as
      `app/api/corporate/quote-request/route.ts`. Failure to email must not fail
      the response; log and continue.
- [ ] **3.9.** Ops dashboard shows client responses as they land, so the loop is
      visible from the other side.

**Done when:** a client accepts a quote with no ops action and ops sees it.

---

## 7. Phase 4 — Orders and delivery

- [x] **4.1.** Choose the order spine. `corporate_orders` is the right table and
      already modelled; `orders` is the fulfilment table. Corporate order →
      fan out to one `orders` row per recipient (the shape
      `POST /api/orders/corporate` already attempts).
- [x] **4.2.** Rewrite `POST /api/orders/corporate`. It inserts `product_name`,
      `order_type` and `corporate_meta` on `orders`, then updates
      `payment_tracking_id` and `payment_merchant_ref` — **none of those columns
      exist**. Real column is `pesapal_tracking_id`. Adopt the two-phase
      fallback already proven in `quote-request` (`42703`/`PGRST204`).
- [x] **4.3.** Rewrite `POST /api/corporate/bulk-order`. It writes seven columns
      `corporate_orders` does not have, sets `'pending_invoice'` which is not in
      `corporate_order_status`, and swallows the error (`route.ts:74-77`) before
      minting gift cards against an order that was never written.
- [x] **4.4.** Replace the placeholder bank details in `bulk-order/route.ts:159-166`
      (`KCB Bank Kenya / TouchGift Ltd / 1234567890 / KCBLKENX`) with
      env-driven values, and refuse to run the route if they are unset.
- [x] **4.5.** Order list and detail in the portal: items, recipients, delivery
      date, status timeline, invoice.
- [x] **4.6.** Reuse `components/orders/OrderStatusTimeline.tsx` rather than
      inventing a second timeline.
- [x] **4.7.** Fix `/corporate/success`: it reads `sessionStorage`, so the page
      is neither reloadable nor shareable. Drive it from the order id in the URL.
- [x] **4.8.** Fix the pool share link: `POST /api/corporate/pools` mints
      `/pool/{slug}` from `corporate_gift_pools`, but `/pool/[slug]` serves
      `group_gifting_pools`.
- [x] **4.9.** Decide whether `orders` gains a company link. Every
      corporate-vs-consumer query currently filters `orders.is_corporate`, which
      does not exist — either add the column or stop querying it.

---

## 8. Phase 5 — Spend, credit and documents

- [ ] **5.1.** Spend summary from real orders: this quarter, this year, versus
      the same period last year. No invented comparison.
- [ ] **5.2.** Credit terms: surface `corporate_accounts.credit_limit`,
      `credit_used`, `default_payment_terms`. These columns exist and nothing
      reads them.
- [ ] **5.3.** Budget rules (`budget_rules`, `:480-491`) — per-department caps,
      the natural corporate feature and already modelled.
- [ ] **5.4.** Documents: quote PDFs, invoices, statements, delivery notes, with
      a real expiry-signed URL per document.
- [ ] **5.5.** CSV export of orders and spend, built server-side, capped and
      logged.

---

## 9. Phase 6 — People

- [ ] **6.1.** Team members: invite, change role, revoke. Only `owner` may do
      this.
- [ ] **6.2.** Recipients: expose `client_profiles` to the client as *their*
      people, minus `notes`, `relationship_strength` and any internal scoring.
- [ ] **6.3.** Milestones: `milestone_rules` are customer-visible as scheduled
      gifting, and customer-creatable. Nothing fires them today — no worker
      consumes the rules — so do not promise automation until one exists.
- [ ] **6.4.** `app/corporate/milestones/add/page.tsx` is a stub: `handleCreate`
      is a `setTimeout` and step 4 shows a fake "Rule Activated!". Either wire
      it to `POST /api/corporate/milestones` or remove it from navigation.
- [ ] **6.5.** Pools in the portal: contribute, see progress, see the company
      match. `corporate_gift_pools` is real and unwired from the public route.

---

## 10. Phase 7 — Account manager and messaging

- [ ] **7.1.** Named account manager with WhatsApp deep link, drawn from the
      membership record, not hardcoded.
- [ ] **7.2.** A message thread on the quote, visible to both sides. Store
      customer-visible messages only; ops-only notes stay ops-only.
- [ ] **7.3.** Response-time expectation shown honestly — only if ops can keep it.
- [ ] **7.4.** `app/corporate/whatsapp/page.tsx` saves settings with a
      `setTimeout` (`handleSaveSettings:340`); flows come from hardcoded
      `DEFAULT_FLOWS`. Either make it real or delete the tab.

---

## 11. Phase 8 — Ops ↔ portal cohesion

- [ ] **8.1.** Give the ops dashboard the `.corporate-shell` tokens (existing
      TODO D1 in `TouchGift-Corporate-UI-Flow.md:191`). It hardcodes `#0A0A12`
      while the hub uses tokens — two products right now.
- [ ] **8.2.** Ops deep-links from a client response straight to the quote.
- [ ] **8.3.** One identity switcher for staff: "view as client" on any account,
      logged, read-only. Cuts support tickets in half.
- [ ] **8.4.** `/corporate/whitelabel/dashboard` is 100% hardcoded — "Luxe
      Events Co.", 14/128/KSh 1.2M, and three invented clients. Delete it or
      build it. It is the most dangerous page in the area.

---

## 12. Phase 9 — Security and privacy

- [x] **9.1.** Enable RLS on every corporate table the portal reads, with
      policies that scope to the caller's membership. Today only two tables have
      any RLS at all.
- [x] **9.2.** Every portal route: service-role key + explicit account scoping.
      RLS is defence in depth, not the only lock.
- [x] **9.3.** Field allowlist per role. `viewer` sees no money.
- [x] **9.4.** Audit table for every portal read of PII and every write.
- [x] **9.5.** Rate-limit portal routes in `middleware.ts`; extend the guard
      beyond `/admin` so `/api/corporate/portal/*` is covered by default.
- [ ] **9.6.** Check the seven currently-unauthenticated corporate routes:
      `bulk-inquiry`, `bulk-order`, `proof`, `quote-request`, `templates`,
      `orders/corporate`, `corporate-funnel`.
- [ ] **9.7.** Confirm no `console.log` of PII survives; confirm error responses
      do not echo customer data.
- [ ] **9.8.** Preserve the 401-vs-503 split from `78096ce` — a dropped pooler
      connection must never read as a revoked account.

---

## 13. Phase 10 — QA and launch gate

- [ ] **10.1.** Browser pass at 375 / 768 / 1024 / 1440 on every portal screen:
      no horizontal scroll, no input under 16px, no target under 44px.
- [ ] **10.2.** Light and dark on every screen.
- [ ] **10.3.** Empty, loading, error and populated states present for each
      surface.
- [ ] **10.4.** Cross-account isolation test: request account B's quote by
      guessing its reference. Must 404 or 403, never render.
- [ ] **10.5.** `internal_notes` never appears in any portal response — assert it
      in a test, not by reading the code.
- [ ] **10.6.** Keyboard walkthrough and screen-reader labels on the rail, tabs,
      dialogs and tables.
- [ ] **10.7.** `npx tsc --noEmit` and `npm run lint` clean.
- [ ] **10.8.** Ops dashboard regression pass after every portal phase.
- [ ] **10.9.** One real end-to-end run with a real company: invite → sign in →
      see quote → accept → ops notified → order placed → delivered.

**Launch gate:** 4.2–4.7, 3.1–3.9, 9.1–9.8, and all of Phase 10 complete, with
10.4 and 10.5 demonstrated.

**Already demonstrated:** signed-out redirect, invitation redemption through the
real callback, cross-account reference returns 404 (not 403, so references
cannot be probed), accepting an unpriced quote returns 409, repeating an accept
returns 409 rather than writing twice, and `internal_notes` never appears in a
portal response. 375px and 1440px pass with no horizontal scroll.

---

## 14. Backlog — broken corporate surfaces (fix or remove)

None of these are portal features. They are live pages that render shell and lie.

| Surface | Reality | Action |
|---|---|---|
| `/api/corporate/stats` | Filtered `orders.is_corporate` — column absent. Errors swallowed, every order metric read 0 | **Fixed** — real figures now |
| `/api/corporate/reports` | Same, plus `orders.department` and `corporate_gift_pools.current_amount` | **Fixed** — department read from the parent order |
| `/api/orders/corporate` | Wrote 5 non-existent `orders` columns; 500 | **Fixed** — parent + fulfilment rows, rolls back |
| `/api/corporate/bulk-order` | Wrote 7 non-existent `corporate_orders` columns, invalid enum, swallowed error, hardcoded KCB bank details | **Fixed** — env-driven, refuses without them |
| `/corporate/success` | Read its result from `sessionStorage` — a refresh lost every gift link | **Fixed** — the order id is the receipt |
| `/corporate/clients`, `/calendar`, `/milestones`, `/pools`, `/reports`, `/marketplace`, `/whatsapp` | Publicly reachable; their APIs are admin-gated, so anonymous visitors see an empty shell | Phase 9 |
| `/corporate/whitelabel/dashboard` | 100% hardcoded data | Phase 8 |
| `/corporate/whatsapp` settings tab | Simulated save | Phase 7 |
| `/corporate/milestones/add` | Simulated save | Phase 6 |
| `/corporate/build` | Posts to the broken `orders/corporate`; `BrandStudio` 401s for anonymous users | Phase 4 |

---

## 15. Non-goals — do not do these

- **Do not seed demo data.** The tables are empty by design; empty states are
  the correct rendering.
- **Do not import `catalog/brandables.csv`.** Reference only, until imagery is
  approved.
- **Do not ship a number that is not readable from the database.** This rule
  already retired `2,400+ Companies Served` and `98% On-time`.
- **Do not let a portal visitor reach data by typing a company name.** Identity
  comes from a membership, never from a string the client supplies.
- **Do not mirror the ops dashboard.** It is dense because staff need density.
- **Do not add a third auth system.** Reuse Supabase sessions.

---

## 16. Open decisions

1. **Membership source.** Invite-only (recommended) vs domain auto-claim
   (`@company.co` auto-joins). Auto-claim is friendlier and leaks the company
   list to anyone who guesses a domain.
2. **Order spine.** Keep `corporate_orders` as the parent of `orders`, or fold
   corporate flag onto `orders` and retire `corporate_orders`.
3. **Guest access.** Can a client view a quote from a signed link without an
   account, or is sign-in mandatory?
4. **Invoice authority.** Do we generate PDFs server-side, or is PesaPal still
   the document of record?
5. **Scope of first release.** Quotes only (3.1–3.9), or quotes + orders?

---

## 17. What the security pass found

- Seven corporate tables had **no RLS at all**. Now: member-scoped read
  policies, service-role management, and a `SECURITY DEFINER` helper so a policy
  can resolve membership without recursing through its own RLS.
- `corporate_portal_audit` records who read or changed what, from where, and
  whether it worked. No customer content — only the fact of the look. An invite
  logs the *invited* address, not the staff operator.
- `/api/corporate/portal/*` answers anonymous callers with 401 at the edge,
  before any route runs.
- Still open (9.6): seven corporate routes are deliberately public —
  `bulk-inquiry`, `bulk-order`, `proof`, `quote-request`, `templates`,
  `orders/corporate`, `corporate-funnel`. Each needs a decision, not a blanket
  lock.

## 18. Blockers and risks

| Blocker | Effect | Owner |
|---|---|---|
| No corporate identity at all | Blocks every phase after 0 | Phase 1 |
| `migrate.mjs` throws silently | Cannot apply Phase 1's migration | Phase 0 |
| No working order intake | Portal cannot show a single order | Phase 4 |
| `orders` has no company link | Spend, reports and status filters are all wrong | Phase 4 |
| Corporate tables lack RLS | A scoped bug leaks one client's data to another | Phase 9 |
| Pooler connection is flaky | Scripts and API reads fail intermittently; already cost two false QA failures | 0.3 |
| Tables empty by design | Every screen ships its empty state first | — |
| `brandables.csv` not loaded | No product imagery for quote lines | — |
