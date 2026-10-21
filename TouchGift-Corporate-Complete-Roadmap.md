# TouchGift Corporate — Complete Build Roadmap
**Phased plan from ops foundation to full B2B loop**  
**Last updated:** 2026-10-14  
**Scope:** TouchGift `/corporate` + Studio + quote/ops systems  
**Sister brand:** TouchLine (bulk uniforms, banners, signage, tenders)

---

## 1. Market context — are we new in Kenya?

### What already exists

| Player type | Examples | What they do well | What they usually lack |
|-------------|----------|-------------------|-------------------------|
| Promo / print houses | MarkenKenya, Waves Branding, Valobrands, GLM, NumberOneBrands, Safeken | Embroidery, screen, sublimation, bulk apparel, workwear | Self-serve design studio, gift UX, same-day gift logistics |
| Gift shops | Purpink, Taz, others | Hampers, personalisation, same-day Nairobi delivery | Deep bulk tooling, size CSVs, proof workflow, ops quote desk |
| Partial digital merch | Custom Junkies Africa | “Place your logo on product” style preview | Full material-aware effects, gift platform, corporate account memory |
| Voucher / rewards | GiftPesa | Digital corporate rewards | Physical branded merchandise |

### Honest position

**You are not the first to brand polos in Kenya.**  
**You are early — possibly first at this depth — combining:**

1. Premium **gift delivery** platform (pools, hampers, pin-drop, live tracking)  
2. **In-browser Customization Studio** (material inference, embroidery/print/sublimation effects, print locations, bulk names → fulfillment JSON)  
3. **Corporate catalog + live quote calculator + quote API + DB**  
4. Planned **ops dashboard → proof approval → production states**  
5. Clear path to **TouchLine** for heavy branding / signage  

Most competitors stop at: *WhatsApp us your logo + quantity*.  
Your edge is **self-serve design + structured quote + gift-grade fulfillment**, not “we also embroider.”

**Positioning line:**  
*Kenya’s gift platform that can also run branded corporate programmes — without turning the gift shop into a print factory.*

---

## 2. Product principles (do not break these)

1. **TouchGift corporate = gifts & gift-led branded merch** (teams, clients, onboarding, milestones).  
2. **TouchLine = scale branding** (uniforms, workwear, banners, tents, signage, tenders).  
3. Every corporate feature should either **convert a quote**, **speed a reorder**, or **reduce WhatsApp chaos**.  
4. Studio designs must stay attached to **orders/quotes** as structured data (you already save fulfillment JSON — protect that).  
5. Prefer **two clear paths**: *Order now* (standard stock) vs *Request quote* (custom / high MOQ).

---

## 3. Phased roadmap

### PHASE 0 — Already done (baseline)
*Do not rebuild; only harden.*

**Studio**
- Fabric.js canvas, material inference, branding effects  
- Aspect ratios, full-bleed, print locations  
- Bulk name input → fulfillment payloads  
- Cart studio badge, SKU detector, “Need this in bulk?” banner  

**Corporate surface**
- `/corporate` hero, merchandise hub, `/corporate/catalog`  
- Category sidebar, MOQ badges, branding tags  
- Quote modal + price slider, quote API, `corporate_quote_requests` table  

**Platform**
- Loyalty, gift cards, pools, hamper builder, tracking, WhatsApp/pin-drop, wishlist, referrals  

**Exit criteria for Phase 0:** Quotes are landing in DB; Studio payloads survive add-to-cart.

---

### PHASE 1 — Close the quote loop (ops can work)
**Goal:** No quote dies in an inbox.  
**Priority:** CRITICAL  
**Suggested duration:** 1–2 weeks  

#### 1.1 Corporate Ops Dashboard `/corporate/dashboard/`
- Table of quote requests: pending → quoted → accepted → (later) proof / production  
- Filters: status, date, category, search (company / phone / email)  
- Row detail: products, qty, MOQ tier, **Studio design payload / preview**, message, contact  
- Fields to add: **assignee**, **internal notes**, **quoted amount**, **valid until**  
- Actions: update status, copy WhatsApp deep link, mark quoted  

#### 1.2 Ops notifications
- New quote → email + WhatsApp to ops group  
- Status change → optional notify customer  

#### 1.3 Minimal quote response template
- Generate a short quote summary (items, qty, unit estimate, next step) for paste into WhatsApp/email  

**Exit criteria:** Ops can list, open, assign, note, and status every quote without opening the database.

---

### PHASE 2 — Remember the buyer (company brain)
**Goal:** Second order is faster than the first.  
**Priority:** HIGH  
**Suggested duration:** 1–2 weeks  

#### 2.1 Company profile (`corporate_accounts`)
- Company name, logo file, VAT, LPO reference, billing address  
- Optional: multiple **delivery sites** (branch list)  
- Preferred branding method (embroidery / print / either)  
- Default **proof approver** email / phone  

#### 2.2 Saved logo in Studio
- Logged-in corporate user → logo preloaded on Studio open  
- Logo library: replace / version (keep last approved file)  

#### 2.3 Account ↔ quotes link
- Quotes and future orders tied to `corporate_account_id`  

**Exit criteria:** Returning company opens Studio with logo already present; ops sees company history.

---

### PHASE 3 — Apparel reality (sizes + names)
**Goal:** Uniform-style orders stop living only in Excel WhatsApps.  
**Priority:** HIGH (especially if polos/tees are a wedge)  
**Suggested duration:** 1–2 weeks  

#### 3.1 Size matrix on apparel products
- UI: qty per size (XS–5XL) with live total  
- Validates against MOQ  

#### 3.2 CSV upload
- Columns: `name, size, department` (optional: phone, email)  
- Preview table + error rows before submit  
- Maps into same bulk fulfillment structure as Studio bulk names  

#### 3.3 Payload contract
- Extend fulfillment JSON: `lineItems[{ name, size, department }]`  
- Ops dashboard shows breakdown, not only total qty  

**Exit criteria:** A 50-person polo order can be submitted with names + sizes without a side spreadsheet.

---

### PHASE 4 — Proof approval workflow
**Goal:** Production starts only after a clear yes.  
**Priority:** HIGH  
**Suggested duration:** 1–2 weeks  

#### 4.1 Status machine (extend existing enum)
```
pending → quoted → accepted → proof_sent → approved → in_production → shipped → delivered → closed
                                      ↘ rejected → proof_sent (v2)
```

#### 4.2 Ops: upload proof
- Attach image(s) + optional note  
- System emails/WhatsApp link to customer token URL  

#### 4.3 Customer proof page
- View proof, **Approve** or **Reject** (reject requires comment)  
- Version history (Proof 1, Proof 2…)  

#### 4.4 On approve
- Status → `approved` / `in_production`  
- Notify ops  

**Exit criteria:** No production without recorded approval; rejects leave a written reason.

---

### PHASE 5 — Money paths (order now vs quote)
**Goal:** Fast cash for standard items; quotes for custom.  
**Priority:** MEDIUM–HIGH  
**Suggested duration:** 1–2 weeks  

#### 5.1 Dual CTA rules
- **Order now:** in-stock / standard branding / within published MOQ bands  
- **Request quote:** custom art, high qty, special materials, multi-product programmes  

#### 5.2 Bulk checkout
- Invoice PDF (company name, VAT, line items, branding notes)  
- Pay: M-Pesa + bank transfer instructions  
- Optional: upload LPO after checkout  

#### 5.3 Quote acceptance → order
- “Accept quote” creates an order record (not a floating quote forever)  

**Exit criteria:** Standard bulk can pay online; accepted quotes become trackable orders.

---

### PHASE 6 — Buyer self-serve tracking
**Goal:** Cut “Did you receive my quote?” messages.  
**Priority:** MEDIUM  
**Suggested duration:** ~1 week  

#### 6.1 Token link after quote submit
- “Track your request” page: status timeline, messages, upload PO/LPO  

#### 6.2 Light messaging thread
- Customer note ↔ ops note (keep simple; not a full helpdesk yet)  

**Exit criteria:** Customer can see status without calling.

---

### PHASE 7 — Kits, samples, re-orders
**Goal:** Higher AOV and retention.  
**Priority:** MEDIUM  
**Suggested duration:** 1–2 weeks  

#### 7.1 Corporate kits (prebuilt)
- Onboarding kit, Client thank-you kit, Event staff kit  
- Fixed or configurable items; Studio on key pieces  

#### 7.2 Sample request
- 1-unit sample path (paid or credited) with logo  
- Status in ops dashboard  

#### 7.3 Re-order same design
- From past order: reload fulfillment payload + logo + product  
- Confirm sizes/qty → quote or order now  

**Exit criteria:** Repeat buyers can reorder in minutes; samples are tracked.

---

### PHASE 8 — Brand boundary & growth
**Goal:** Scale without confusing TouchGift with a print shop.  
**Priority:** MEDIUM (do earlier if catalog feels “too industrial”)  
**Suggested duration:** ongoing / 3–5 days for copy + links  

#### 8.1 TouchGift corporate IA
- Hero + catalog focused on **gift-led** branded merch  
- Footer / hub card: **Uniforms, banners, signage & large programmes → TouchLine**  

#### 8.2 TouchLine mirror link
- “Sending a single gift instead? → TouchGift”  

#### 8.3 Catalog tagging
- SKU flag: `touchgift` | `touchline` | `both`  
- Prevent full workwear/banner range from dominating gift homepage  

#### 8.4 Metrics that matter
- Quote → accepted → paid conversion  
- Time to first quote response  
- % orders with Studio design  
- % apparel orders with size CSV  
- Reorder rate by company  

**Exit criteria:** Public messaging matches ops reality; heavy jobs route to TouchLine cleanly.

---

### PHASE 9 — Later (only after Phase 1–5 are stable)

- Role-based users (buyer vs approver vs ops)  
- Multi-branch delivery scheduling from one order  
- Supplier/cost fields on quotes (true margin)  
- Auto price lists by tier (50 / 100 / 250 / 500) published to catalog  
- Simple contracts / recurring annual gifting  
- Public case studies fed from real completed orders  

---

## 4. Suggested sequence (summary)

| Phase | Name | Outcome |
|------:|------|---------|
| 0 | Baseline (done) | Studio + catalog + quotes in DB |
| 1 | Ops dashboard | Team can action every quote |
| 2 | Company profile + logo | Repeat buyers remembered |
| 3 | Size matrix + CSV | Real apparel orders |
| 4 | Proof workflow | Production gated on approval |
| 5 | Order now + pay | Cash for standard bulk |
| 6 | Buyer tracking | Less support noise |
| 7 | Kits, samples, re-order | AOV + retention |
| 8 | TouchGift / TouchLine boundary | Brand clarity |
| 9 | Scale features | Only after conversion works |

---

## 5. What not to prioritise yet

- Building a second mega-catalog of every industrial SKU on the gift domain  
- Complex ERP/accounting before quotes convert to cash  
- Heavy gamification on corporate accounts  
- Public “500+ items” claims without ops capacity to fulfil  

---

## 6. Definition of “corporate side complete”

The corporate side is **complete enough** when:

1. A company can **design** (Studio), **request** (quote) or **buy** (standard bulk),  
2. Ops can **respond, proof, and produce** without spreadsheets,  
3. Apparel can carry **names + sizes**,  
4. The same company can **reorder** with saved logo,  
5. Heavy branding / signage is **handed to TouchLine** without awkward silence.

That is a full loop — not an endless feature list.

---

## 7. One-page competitive takeaway

| Capability | Typical Kenya print/gift shop | TouchGift target |
|------------|-------------------------------|------------------|
| WhatsApp quote | Yes | Yes (plus structured) |
| Same-day gift delivery | Gift shops yes | Yes |
| In-browser design studio | Rare | Yes (built) |
| Bulk names → fulfilment data | Rare | Yes (built) |
| Ops quote dashboard | Internal/Excel | Phase 1 |
| Proof approve link | Email chaos | Phase 4 |
| Size CSV apparel | Manual | Phase 3 |
| Gift + corporate in one brand system | Split vendors | Your stack |

**Bottom line:** The *services* (embroidery, bulk polos) are common. The *productised system* on a gift platform is not. Finish the loop; don’t only add catalog width.

---

*End of roadmap document*
