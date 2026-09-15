// Starts a Stripe Checkout for a booking deposit.
//
// The server prices the deposit from the chosen size tier and saves the booking as
// "awaiting_payment", which is never shown as a booking. Only a paid Checkout Session
// (see lib/stripe-settle.ts) turns it into a real booking.

import { prisma } from "@/lib/prisma";
import { verifyUser } from "@/lib/require-admin";
import {
  DEPOSIT_POLICY_VERSION,
  TIME_PREFERENCES,
  acceptsDeposit,
  getService,
  getSizeTier,
  isCheckoutStatus,
  isPlacement,
} from "@/lib/services";
import { dateInTimeZone, getLocation, locationName, validPreferredDate } from "@/lib/locations";
import { OFFER, offerAppliesTo, offerPrice } from "@/lib/offers";
import { getStripeInstance, stripeCurrency, stripeKeyProblem, toStripeAmount } from "@/lib/stripe";

export const runtime = "nodejs";

const UUID_V4 = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
// Stripe requires 30 minutes to 24 hours.
const CHECKOUT_WINDOW_SECONDS = 45 * 60;
const FIELDS = ["requestId", "location", "service", "size", "placement", "date", "time", "name", "phone", "notes", "design"] as const;

function siteOrigin(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Please book from this website." }, { status: 403 });
  }

  const keyProblem = stripeKeyProblem();
  if (keyProblem) {
    console.error("Stripe configuration error:", keyProblem);
    return Response.json({ error: "Card payments are not available right now." }, { status: 503 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Online booking is temporarily unavailable. No payment has been taken." }, { status: 503 });
  }

  const viewer = await verifyUser(request);
  if (viewer instanceof Response) return viewer;

  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 8000) return Response.json({ error: "Your booking request is too long." }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    data = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Please check your booking details and try again." }, { status: 400 });
  }

  if (FIELDS.some((key) => typeof data[key] !== "string") || data.consent !== true || data.policyAccepted !== true) {
    return Response.json({ error: "Please complete the booking form and accept the deposit policy." }, { status: 400 });
  }
  const values = Object.fromEntries(FIELDS.map((key) => [key, (data[key] as string).trim()])) as Record<(typeof FIELDS)[number], string>;

  const location = getLocation(values.location);
  const service = getService(values.service);
  const size = getSizeTier(values.size);
  if (!location) {
    return Response.json({ error: "Choose the studio location you’d like to visit." }, { status: 400 });
  }
  if (!service || !acceptsDeposit(service.id) || !size) {
    return Response.json({ error: "Choose a service and size that can be booked with a deposit." }, { status: 400 });
  }
  if (
    !UUID_V4.test(values.requestId) ||
    !values.name || values.name.length > 100 ||
    values.phone.length > 30 || values.notes.length > 1000 || values.design.length > 120 ||
    !isPlacement(values.placement)
  ) {
    return Response.json({ error: "Please check your name, placement, and booking details." }, { status: 400 });
  }
  if ((values.date && !validPreferredDate(values.date, location.timeZone)) || !TIME_PREFERENCES.some((slot) => slot === values.time)) {
    return Response.json({ error: "Please choose a future date and a valid time preference." }, { status: 400 });
  }

  const ref = "MS-" + values.requestId;
  const tattooTitle = values.design ? `${service.name} — ${values.design}` : service.name;
  const date = values.date || "Flexible";
  const time = `${values.time} · ${location.timeZoneLabel}`;
  // Locked in when checkout starts, so a payment that clears after the deadline keeps the offer.
  const offer = offerAppliesTo(service.id, dateInTimeZone(location.timeZone))
    ? { id: OFFER.id, percentOff: OFFER.percentOff, originalEstimate: size.estimate }
    : null;
  const estimatedTotal = offer ? offerPrice(size.estimate) : size.estimate;
  // Live-mode smoke test: the verified admin pays a tiny real deposit (Stripe's USD minimum is 0.50)
  // to exercise checkout, settlement, and the webhook end to end. Leave LIVE_TEST_DEPOSIT unset in production.
  const testDeposit = viewer.isAdmin ? Number(process.env.LIVE_TEST_DEPOSIT) : NaN;
  const liveTest = testDeposit >= 0.5 && testDeposit < size.deposit;
  const deposit = liveTest ? testDeposit : size.deposit;
  const details = {
    clientName: values.name,
    clientEmail: viewer.email,
    tattooTitle,
    tattooImage: "",
    style: service.id,
    placement: values.placement,
    size: size.label,
    location: location.id,
    date,
    time,
    sessionType: "Studio Appointment",
    depositPaid: 0,
    estimatedTotal,
    status: "awaiting_payment",
    notes: JSON.stringify({
      phone: values.phone,
      message: values.notes,
      service: service.id,
      sizeTier: size.id,
      depositDue: deposit,
      consent: true,
      depositPolicyVersion: DEPOSIT_POLICY_VERSION,
      paymentStatus: "awaiting_payment",
      ...(offer && { offer }),
      ...(liveTest && { liveTest: true }),
    }),
  };

  try {
    const existing = await prisma.booking.findUnique({ where: { ref }, select: { status: true, clientEmail: true } });
    if (existing && (!isCheckoutStatus(existing.status) || existing.clientEmail.toLowerCase() !== viewer.email)) {
      return Response.json({ error: "This booking has already been paid. Check My bookings for details." }, { status: 409 });
    }
    if (existing) await prisma.booking.update({ where: { ref }, data: details });
    else await prisma.booking.create({ data: { ref, ...details } });
  } catch (error) {
    console.error("Could not save booking before checkout:", error);
    return Response.json({ error: "We couldn't start your booking. No payment has been taken. Please try again." }, { status: 503 });
  }

  const currency = stripeCurrency();
  const siteUrl = siteOrigin(request);
  // A cancelled checkout reopens the last booking step with these choices filled in.
  const resume = new URLSearchParams({
    cancelled: "true",
    location: location.id,
    service: service.id,
    size: size.id,
    placement: values.placement,
    time: values.time,
  });
  if (values.date) resume.set("date", values.date);
  try {
    const session = await getStripeInstance().checkout.sessions.create({
      mode: "payment",
      customer_email: viewer.email,
      client_reference_id: ref,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_WINDOW_SECONDS,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toStripeAmount(deposit, currency),
            product_data: {
              name: `${liveTest ? "[LIVE TEST] " : ""}Deposit · ${service.name} (${size.label}) · Marked Studio ${locationName(location)}`,
              description:
                "Non-refundable deposit, credited toward your final tattoo price. The remaining balance is due at your session." +
                (offer ? ` ${offer.percentOff}% offer applied to your tattoo price.` : ""),
            },
          },
        },
      ],
      payment_intent_data: {
        receipt_email: viewer.email,
        description: `Marked Studio ${locationName(location)} deposit ${ref}`,
        metadata: { bookingRef: ref, location: location.id },
      },
      metadata: {
        bookingRef: ref,
        location: location.id,
        depositAmount: String(deposit),
        ...(liveTest && { liveTest: "true" }),
        estimatedTotal: String(estimatedTotal),
        ...(offer && {
          offerId: offer.id,
          offerPercentOff: String(offer.percentOff),
          originalEstimate: String(offer.originalEstimate),
        }),
        service: service.id,
        sizeTier: size.id,
        sizeLabel: size.label,
        clientName: values.name,
        clientEmail: viewer.email,
        tattooTitle: tattooTitle.slice(0, 200),
        placement: values.placement,
        date,
        time,
        depositPolicyVersion: DEPOSIT_POLICY_VERSION,
      },
      success_url: `${siteUrl}/book?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book?${resume}`,
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return Response.json({ url: session.url }, { status: 201 });
  } catch (error) {
    console.error("Stripe Checkout Session creation failed:", error);
    return Response.json({ error: "We couldn't open secure checkout. No payment has been taken. Please try again." }, { status: 502 });
  }
}
