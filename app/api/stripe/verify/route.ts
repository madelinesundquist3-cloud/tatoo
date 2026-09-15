// Confirms a Checkout Session when the client returns from Stripe.
// The webhook records the same outcome; whichever arrives first settles the booking.

import { NextResponse } from "next/server";
import { getStripeInstance, stripeConfigured } from "@/lib/stripe";
import { settleCheckoutSession } from "@/lib/stripe-settle";
import { prisma } from "@/lib/prisma";
import { bookingOffer } from "@/lib/offers";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe payments are not configured." }, { status: 503 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || sessionId.length > 255) {
    return NextResponse.json({ error: "session_id parameter is required." }, { status: 400 });
  }

  try {
    const session = await getStripeInstance().checkout.sessions.retrieve(sessionId);
    const settlement = await settleCheckoutSession(session);
    const paid = settlement.status === "paid";

    const record =
      paid && settlement.bookingRef
        ? await prisma.booking.findUnique({
            where: { ref: settlement.bookingRef },
            select: {
              ref: true,
              clientName: true,
              tattooTitle: true,
              date: true,
              time: true,
              placement: true,
              size: true,
              depositPaid: true,
              estimatedTotal: true,
              status: true,
              location: true,
              notes: true,
            },
          })
        : null;
    // Notes hold the client's contact details; only the offer is sent back.
    const booking = record ? { ...record, notes: undefined } : null;

    return NextResponse.json(
      {
        paid,
        status: settlement.status,
        amount: settlement.amount,
        currency: settlement.currency,
        bookingRef: settlement.bookingRef,
        customerEmail: paid ? session.customer_details?.email || session.customer_email || null : null,
        booking,
        offer: bookingOffer(record?.notes),
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("Stripe verification failed:", error);
    return NextResponse.json(
      { error: "We couldn't confirm your payment yet. If you were charged, your booking will appear in My bookings shortly." },
      { status: 502, headers: NO_STORE }
    );
  }
}
