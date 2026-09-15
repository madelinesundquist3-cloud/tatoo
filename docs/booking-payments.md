# Deposit bookings and payments

A tattoo booking exists only after its Stripe deposit payment succeeds.

## Flow

1. The client signs in with Google and completes `/book` (studio location, service, size tier, placement, preferred time, contact details, deposit policy agreement).
2. `POST /api/stripe/checkout` verifies the Firebase ID token, validates the request, and prices the deposit from `SIZE_TIERS` in `lib/services.ts`. The browser never sends an amount.
3. The route saves the record with status `awaiting_payment`, then creates a Checkout Session (expires after 45 minutes) and returns its URL. If the database write fails, no Checkout Session is created.
4. On return, `/book?session_id=…` calls `GET /api/stripe/verify`. Stripe's webhook calls the same settlement code. Whichever arrives first settles the booking.
5. `settleCheckoutSession` (`lib/stripe-settle.ts`) confirms the booking (`deposit_held`) only when Stripe reports `payment_status: "paid"` **and** the amount matches the deposit priced at checkout. It is idempotent and never downgrades a booking the studio has already confirmed, completed, or cancelled.
6. Failed delayed payments become `payment_failed` and expired checkouts become `payment_expired`.

Records in `awaiting_payment`, `payment_failed`, or `payment_expired` are not bookings. They never appear in `/api/bookings`, the admin dashboard, or My bookings.

A cancelled checkout returns to `/book` on the last step with the studio, service, size, placement, and time preference in the URL; phone and notes come back from `sessionStorage`. Clients can fill in the first two steps before signing in; Google sign-in (a popup, so the form keeps its state) is required only on the last step.

## Seasonal offer

`OFFER` in `lib/offers.ts` gives 20% off the tattoo price for deposit bookings (tattoo, cover-up, touch-up) that start checkout on or before `endsOn` (Nov 30) in the studio's local time.

- The deposit charged on Stripe does not change. The checkout route stores the discounted `estimatedTotal` and records `offer` (id, percent, original estimate) in the booking notes and Checkout metadata, so the studio sees the discounted balance and the offer is kept even if payment clears after the deadline.
- The site-wide banner (`components/offer-banner.tsx`, in the navbar) counts down to `OFFER_ENDS_AT` and hides itself afterwards. Remove it and `lib/offers.ts` once the offer is over, or update both for the next offer.

Free consultation requests (`POST /api/consultations`) take no payment and don't reserve an appointment. See `consultation-flow.md`.

## Configuration

- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (same mode)
- `STRIPE_WEBHOOK_SECRET`. In the Stripe Dashboard, send these events to `/api/stripe/webhook`:
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`.
  Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- `NEXT_PUBLIC_SITE_URL`: the public origin used for Stripe return links
- `LIVE_TEST_DEPOSIT` (optional, e.g. `0.50`): with live keys, the verified `ADMIN_EMAIL` account is charged this instead of the real deposit, so a real payment can be checked end to end. Customers are never affected. The booking is real (marked `liveTest` in its notes): cancel it in the admin dashboard and refund it in Stripe (Stripe keeps its fee). Keep it unset in production.
- `DATABASE_URL`, Firebase settings, and `ADMIN_EMAIL` (see `.env.example`)

## Before launch

Confirm studio cities and time zones in `LOCATIONS` (`lib/locations.ts`; bookings store the location id), deposit amounts and starting prices in `SIZE_TIERS`, and the terms on `/policies` (bump `DEPOSIT_POLICY_VERSION` when they change). Stripe sends receipts to `receipt_email` for live-mode payments only.
