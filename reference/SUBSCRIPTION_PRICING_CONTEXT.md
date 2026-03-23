# Subscription & pricing context (The Piped Peony Academy)

This document captures how memberships, Stripe, Strapi, and pricing changes work in this codebase, plus the **$15 → $20** rollout and in-app notices. Use it for onboarding and when changing billing or copy.

---

## How subscriptions work (technical)

### Source of truth for **new** checkouts

- **Strapi** collection type **Subscriptions** (active entries via `filters[active][$eq]=true`).
- Key fields: **`stripePriceId`** (Stripe Price ID), **`subscriptionPrice`** (display), **`freeTrialDays`**, **`documentId`** (used in API calls).
- **`GET /api/subscriptions-list`** returns active plans from Strapi.
- **`POST /api/guest-checkout`** (signup before Clerk account) and **`POST /api/subscription-checkout`** (logged-in upgrade) fetch the subscription by `documentId` and create a Stripe Checkout Session with `line_items: [{ price: subscription.stripePriceId }]`.
- **`subscription_data.trial_period_days`** comes from Strapi **`freeTrialDays`** (trial is on the Checkout/subscription, not necessarily stored only on the Price object).

### After payment

- Stripe webhooks (`app/api/stripe-webhook/route.ts`) handle `checkout.session.completed`, `customer.subscription.*`, `invoice.*`.
- **Clerk `publicMetadata.role`** is synced to `subscriber` or `customer` based on subscription **status** (active/trialing vs canceled/past_due, etc.). There is **no** app logic that migrates or updates subscription **prices**.

### Existing subscribers

- Each customer’s **Stripe Subscription** is tied to the **Price ID** from the Checkout session at signup.
- Changing Strapi’s **`stripePriceId`** affects **only new** Checkout sessions. It does **not** change billing for anyone who already has an active subscription.

### Account management

- **`POST /api/billing-portal`** — Stripe Customer Portal (payment method, etc.).
- **`POST /api/cancel-subscription`** — sets `cancel_at_period_end: true` on active/trialing subs.

### Relevant files

| Area | Path |
|------|------|
| Subscription checkout (signed-in) | `app/api/subscription-checkout/route.ts` |
| Guest signup checkout | `app/api/guest-checkout/route.ts` |
| List plans | `app/api/subscriptions-list/route.ts` |
| Stripe webhooks / roles | `app/api/stripe-webhook/route.ts` |
| Plan UI (price from Strapi) | `components/subscription-plans.tsx` |
| Role hook | `hooks/use-role.tsx` |
| Signup → checkout | `app/signup/page.tsx` |
| Upgrade → checkout | `app/upgrade/page.tsx`, `app/signup-subscription/page.tsx` |
| Legacy notice eligibility (Stripe Price check) | `app/api/subscriber-legacy-pricing-notice-eligible/route.ts` |

---

## Price increases: new vs existing customers

### Stripe behavior

- Recurring **Prices** are **immutable** for amount: you **create a new Price** (e.g. $20/month) on the Product; you do not “edit” $15 → $20 on the same `price_…` ID.
- **Existing** subscriptions keep billing the **old** `price_…` until you **explicitly** update each subscription (Dashboard, bulk tools, or API/script), typically for the **next** renewal with chosen **proration** settings.
- Users **in a trial** are already on the Price ID from checkout; they bill at that price after trial unless their subscription is migrated to a new Price.

### Recommended operational steps (new $20, migrate legacy in April)

1. In **Stripe**: create a new monthly **$20** Price on the same Product as today. Optionally **archive** the old $15 Price so it is not used for new sales (do not delete if still attached to live subscriptions).
2. In **Strapi**: set **`stripePriceId`** to the new Price ID and **`subscriptionPrice`** to **20** (so CMS + `subscription-plans` match).
3. **April (or chosen date)**: migrate **existing** subscriptions from the old Price to the new Price in Stripe (separate from this app).
4. Keep **email / terms** aligned with notice periods (e.g. 30 days) for existing members.

### What the app does **not** do

- No subscription schedules, proration rules, or bulk price migration in code.
- Strapi is **not** read on each renewal; only Stripe’s subscription + Price objects determine recurring charges.

---

## Subscriber-only pricing notice (in-app)

### Purpose

Inform **legacy-price subscribers** (still on the old $15 Stripe Price until migration) about **$15 → $20** effective **April 22, 2026**. **New** signups on the **new** Stripe Price do **not** see this banner.

### Implementation

- **Component:** `components/subscriber-pricing-notice.tsx`
- **API:** `GET /api/subscriber-legacy-pricing-notice-eligible` — resolves Stripe customer (Clerk `privateMetadata.stripeCustomerId` or email), lists subscriptions (`active` / `trialing`), returns **`{ eligible: true }`** only if any line item’s Price ID is listed in **`LEGACY_SUBSCRIPTION_STRIPE_PRICE_IDS`**.
- **Mounted in:** `app/layout.tsx` immediately below `<SiteHeader />`.
- **Visibility rules (all required):**
  - Signed in, Clerk role **`subscriber`**, and **`user.id`** available.
  - **`GET /api/subscriber-legacy-pricing-notice-eligible`** returns **`eligible: true`** (legacy Stripe Price on an active/trialing subscription).
  - Current date is **before** local **April 23, 2026** (`NOTICE_END = new Date(2026, 3, 23)`).
  - Not dismissed: **`localStorage`** key **`pipedPeonySubscriberPricingNoticeDismissed:<clerkUserId>`** !== `"1"` (per user on shared devices).
- **Dismiss:** Top-right **X** sets the per-user localStorage key above.
- **Styling:** Background **`rgb(255 228 195)`**, black text, link to **`/terms-subscription`**.

### Required environment variable

```env
# Comma-separated Stripe Price ID(s) for the OLD plan (e.g. $15). New $20 price must NOT be listed.
LEGACY_SUBSCRIPTION_STRIPE_PRICE_IDS=price_xxxxxxxx
```

If this variable is **empty or unset**, **no one** sees the banner (safe default).

### Caveats

- Dismiss state is **per browser + Clerk user id**.
- Requires **`STRIPE_SECRET_KEY`** and correct **legacy** Price ID(s) after you create the new $20 Price in Stripe.

---

## Marketing & legal copy ($20 for new customers, trial unchanged)

### Updated messaging (high level)

- **Signup** (`app/signup/page.tsx`) and **Academy hero** (`app/academy-details/page.tsx`): **7-day free trial** retained; post-trial framing **$20/month**, no contract, cancel anytime; credit card required for trial; cancel before trial ends to avoid charge.
- **Terms** (`app/terms-subscription/page.tsx`): Standard membership fee described as **$20.00** with “then-current fee as shown at signup”; clause for members on a **prior** published rate; **Price Increases** section clarifies the **April 22, 2026** notice applies to **existing members at $15**, not new signups already at $20.

### Dynamic pricing display

- **`components/subscription-plans.tsx`** renders **`${subscription.subscriptionPrice}`** from Strapi — must stay in sync with Strapi after changing prices.

---

## Historical note: subscriber notice copy

The in-app notice still states an increase **from $15 to $20** starting **April 22, 2026** for **existing** subscribers. Update that component (and dates) if the migration schedule or amounts change.

---

## Quick checklist when launching new Stripe price

- [ ] New **Price** in Stripe ($20 / month, correct Product).
- [ ] Strapi **`stripePriceId`** → new `price_…`
- [ ] Strapi **`subscriptionPrice`** → **20**
- [ ] Confirm hardcoded marketing pages match (signup, academy-details).
- [ ] Confirm terms match counsel-approved language.
- [ ] Set **`LEGACY_SUBSCRIPTION_STRIPE_PRICE_IDS`** to the **old** `price_…` (Vercel + `.env.local`).
- [ ] After April 2026 migration: consider removing or editing **`SubscriberPricingNotice`** end date and copy; redeploy if needed.

---

*Last aligned with codebase practices: subscription checkout from Strapi `stripePriceId`, webhook role sync only, no in-app price migration.*
