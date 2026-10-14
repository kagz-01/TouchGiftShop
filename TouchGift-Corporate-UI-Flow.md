# Corporate UI — Flow Design & Build TODO

_Status: Phase A complete, Phase B (sections 3-5) complete except Proof_
_Last updated: 2026-10-14_

---

## 1. What the main homepage actually does

Measured from `app/page.tsx` + `components/home/StorytellingHome.tsx`:

| # | Section | Role |
|---|---------|------|
| 1 | `HeroCinematic` | Hook. Cinematic, mood-switchable. |
| 2 | `VerticalProductColumns` | **SHOW products — second thing on the page** |
| 3 | `SolutionSection` | Brand reveal — "we can do this for you" |
| 4 | `ProblemSection` | The problem, framed |
| 5 | `CategoryRail` | Browse |
| 6 | `SuperpowersStrip` | Differentiators |
| 7 | `FeaturedRow` ×2 | More products |
| 8 | `SmartReorderBanner` | Return-visit hook |
| 9 | `SocialProof` | Numbers + testimonials |
| 10 | `VisitUs` | Location / contact |

Two rules worth copying:

1. **Products land second.** Not after a pitch. A visitor sees the actual thing
   before they read a claim about it.
2. **Proof comes late, and it's real.** `SocialProof` is last because it only
   lands once the visitor already believes the thing exists.

## 2. Where corporate currently breaks both rules

| Section | Verdict |
|---------|---------|
| Hero | Keep. Strong. |
| Tabs | Keep — corporate is a portal, needs wayfinding (just built). |
| 3 Journeys (client/team/onboarding) | Keep, but move **down**. It is "tell". |
| `Corporate Packs` | **Remove.** Reads `shop_products` filtered on `vibe_tags contains ['Corporate']` — a different table from `products`, and no import path writes that tag. Almost certainly renders empty. Duplicates the merch hub anyway. |
| `Features` (6 cards) | **Rewrite.** Magic Link / CSV Roster / Milestones all describe the same automation three times. |
| `Branded Merchandise Hub` | Keep — but it must become the **product showcase** and move to position 2. |
| `Milestones` section | **Remove or merge.** Overlaps the Features cards; the automation isn't built. |
| `TouchLine bridge` | Keep, but move to the **end** — it's a handoff, not a pitch. |
| CTA banner | Keep as the portal door. |

### Fabricated claims to remove regardless of layout

Same class of problem as the invented "32 styles" category counts:

- `2,400+ Companies Served`, `98% On-time Delivery`, `KES 50M+ Gifts Deployed`,
  `4.9★ Client Rating` — the hero stats row, repeated again as
  "Join 2,400+ companies…". No source; `/corporate/reports` doesn't even read
  quote or order data.
- `Send 500 gift links in one click`, `Track who's opened their gift in real time`,
  `White-label the unboxing with…` — Features copy for unbuilt capability.

**Rule:** on the corporate hub, a number must be readable from the database or
it does not ship. Placeholder copy for unbuilt features belongs in the portal
behind auth, not on a public sales page.

### "Client Portal" points at a staff-only screen

The header and hero both label `/corporate/dashboard` as **"Client Portal"**.
That route's data comes from `/api/corporate/stats`, which is gated by
`requireAdmin()` — a staff session (`tg_admin_session`), not a customer login.
A client who clicks it gets a 401 and an empty dashboard.

Two options, and this is a product decision, not a UI one:

- Relabel to **"Ops Dashboard"** and treat it as an internal tool that happens
  to be linked from the public page — cheapest, honest, but it advertises
  internal tooling to prospects.
- Build the customer-facing portal (Phase 2 `corporate_accounts`, Roadmap §3
  Phase 6 buyer tracking) so "Client Portal" becomes true.

Until one of those happens, **do not label a staff-only screen "Client Portal"**.

## 3. Proposed flow

Corporate keeps tabs (it is a portal, not a storefront), but the section order
follows the homepage's logic: **show, then tell, then prove, then hand off.**

```
/corporate  (the hub — public, sells)

  ┌─────────────────────────────────────────────┐
  │ 1  HERO            keep                       │  the promise
  ├─────────────────────────────────────────────┤
  │ 2  THE RANGE       products, immediately      │  SHOW  ← moved up
  │    (tabs: Client │ Team │ Onboarding)         │
  ├─────────────────────────────────────────────┤
  │ 3  HOW IT WORKS   the platform, once         │  TELL
  ├─────────────────────────────────────────────┤
  │ 4  PROOF          real numbers only          │  PROVE
  ├─────────────────────────────────────────────┤
  │ 5  PORTAL         → /corporate/dashboard     │  the door
  ├─────────────────────────────────────────────┤
  │ 6  TOUCHLINE      handoff, deliberately last  │  the exit
  └─────────────────────────────────────────────┘

  Tabs track 2→3 and sit sticky; the portal CTA is the terminal action.
```

### Section 2 — The range (tabs)

The three journeys already built become tabs rather than stacked sections.
Under each tab: the moments, **plus a live strip of actual products** from that
journey's categories. This is the part that satisfies "show don't tell" and is
the single biggest gap today — nothing shows a product until far down the page.

Blocked on the catalog being loaded (see §5).

### Section 3 — How it works

Replace six overlapping cards with the four things a corporate buyer actually
asks about:

1. **Send** — roster upload, Magic Links, bulk scheduling
2. **Brand** — logo, colours, white-label unboxing (Studio)
3. **Track** — redemption, per-recipient status
4. **Pay** — M-Pesa, bank transfer, LPO, invoice

Each with an honest state: `Live` / `In build`. No capability claims without a
label.

### Section 4 — Proof

Numbers pulled from real tables (`corporate_quote_requests`, `orders`) with a
real window. Empty state says "be the first" rather than inventing 2,400.

## 4. Build TODO

### Phase A — Remove what doesn't hold up (no blockers)

- [x] **A0.** Relabelled "Client Portal" → "Ops Dashboard". The route is
      `requireAdmin()`-gated, so the old label sent clients to a 401.
- [x] **A1.** Deleted `Corporate Packs` + its `shop_products` query. `app/corporate/page.tsx`
      is now a pure metadata route. `shop_products` is still read by
      `/shop/checkout` and `/corporate/checkout` — left in place, not orphaned.
- [x] **A2.** Removed `Milestones`; automation now sits in the `Automate`
      capability card as `In build`.
- [x] **A3.** Removed the four stats and "Join 2,400+". Replaced with three
      claims we can actually stand behind (Studio, structured quotes, delivery).
- [x] **A4.** `FEATURES` → `lib/corporate-capabilities.ts`: Send / Brand /
      Track / Pay / Automate, each labelled `Live` or `In build`. Verified in
      the browser: 3 Live, 2 In build.
- [x] **A5.** TouchLine bridge moved below the portal CTA.
- [x] **A6.** Removed the "Order for Team" modal — `setSelectedProduct` was
      only ever called with `null` once Corporate Packs went, so nothing could
      open it. To be reattached to the product showcase in Phase C.

### Phase B — Restructure to the new order (no blockers)

- [x] **B1.** Range is now position 2, directly under the hero and tab bar.
- [x] **B2.** Journeys are real tabs (`CorporateRangeSection`) with a fourth
      "Everything" tab. `CorporateSectionTabs` keeps section-level scroll-spy
      for Range / How only — two distinct jobs, deliberately not merged.
- [x] **B3.** Portal CTA is terminal; TouchLine sits after it as the exit.
- [ ] **B4.** Proof section — still open, see §6 decision 2.

### Phase C — Product showcase (blocked on catalog load)

- [ ] **C1.** Load `catalog/brandables.csv` into `products` + category links.
      *Explicitly deferred — do not import until imagery exists.*
- [ ] **C2.** Product strip per journey tab, filtering by that journey's slugs.
- [ ] **C3.** Wire the Studio CTA to a real item instead of a generic button.
- [ ] **C4.** Product-level TouchLine note ("50+ with names embroidered?").

### Phase D — Portal cohesion

- [ ] **D1.** Give `/corporate/dashboard` the same `.corporate-shell` tokens so
      the hub and the portal read as one product.
- [ ] **D2.** Portal needs an auth decision — `requireAdmin()` today, which is
      staff-only. A client's own dashboard is Phase 2 `corporate_accounts`.
- [ ] **D3.** Footer/nav TouchLine link (`coporate side.txt` item 3).

### Phase E — Mobile pass

- [ ] **E1.** Re-run the journey/tab audit at 375px after Phase B.
- [ ] **E2.** Product strips need horizontal-scroll treatment and snap points.

---

## 5. Blockers & risks

| Blocker | Effect | Owner |
|---------|--------|-------|
| `brandables.csv` not loaded, no imagery | Section 2 can't show products; any product-shaped UI is a placeholder | — |
| `shop_products` may be empty | "Corporate Packs" likely already renders an empty state | verify |
| Hero stats unverifiable | Cannot be repaired without real order data | — |
| `/corporate/dashboard` is admin-only | "Client Portal" 401s for clients; portal framing is premature | decision |
| Hero stats have no data source | Can't be made truthful without order data | — |

## 6. Decisions needed before Phase B

1. **Tabs: scroll-spy or true switching?** Scroll-spy is friendlier and keeps
   deep links working, but a buyer looking for "Team gifts" wants to *switch*,
   not scroll. Hybrid: true switching for the three journeys, scroll-spy for the rest.
2. **Keep the hero stats with real numbers, or drop them?** Dropping is faster;
   real numbers need a data source agreed.
3. **Does the portal door say "Client Portal" or "Ops Dashboard"?** They are
   different audiences and today only ops can reach it.
