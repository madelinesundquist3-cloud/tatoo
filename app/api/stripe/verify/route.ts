// app/api/stripe/verify/route.ts
//
// Verifies payment completion for a Stripe Checkout Session upon client return.

import { NextRequest, NextResponse } from "next/server";
import { getStripeInstance, stripeConfigured } from "@/lib/stripe";
import { settleFromCheckoutSession } from "@/lib/stripe-settle";

export async function GET(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe payments are not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id parameter is required." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const settlement = await settleFromCheckoutSession(session);

    let bookingData = null;
    if (settlement.bookingRef && process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        bookingData = await prisma.booking.findUnique({
          where: { ref: settlement.bookingRef },
          select: {
            ref: true,
            clientName: true,
            clientEmail: true,
            tattooTitle: true,
            date: true,
            time: true,
            placement: true,
            size: true,
            style: true,
            depositPaid: true,
            estimatedTotal: true,
            status: true,
            notes: true,
            createdAt: true,
          },
        });
      } catch (dbErr) {
        console.warn("Could not query booking details during verification:", dbErr);
      }
    }

    return NextResponse.json({
      paid: settlement.status === "completed",
      status: settlement.status,
      amount: settlement.amount,
      currency: settlement.currency,
      channel: settlement.channel,
      bookingRef: settlement.bookingRef,
      customerEmail: session.customer_details?.email || session.customer_email,
      booking: bookingData,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Stripe verification failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to verify session with Stripe." },
      { status: 500 }
    );
  }
}
