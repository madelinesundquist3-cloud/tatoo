// app/api/stripe/checkout/route.ts
//
// Creates a real Stripe Checkout Session for tattoo reservation deposits.
//
// There is no simulated fallback. If Stripe keys are not configured or mismatched,
// this fails loudly with a clear 503 so test and live environments behave
// predictably and identically.

import { NextRequest, NextResponse } from "next/server";
import {
  getStripeInstance,
  stripeCurrency,
  stripeKeyProblem,
  toStripeAmount,
} from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Validate keys: prevent test/live key pollution
  const keyProblem = stripeKeyProblem();
  if (keyProblem) {
    console.error("Stripe configuration error:", keyProblem);
    return NextResponse.json(
      { error: "Card payments are not available right now.", detail: keyProblem },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { booking, origin } = body;

    if (!booking || !booking.ref) {
      return NextResponse.json(
        { error: "Booking reference information is required" },
        { status: 400 }
      );
    }

    const stripe = getStripeInstance();
    const currency = stripeCurrency();

    // Configured deposit amount (Stripe minimum charge for USD is $0.50)
    const depositInUnits = booking.depositPaid !== undefined && booking.depositPaid !== null ? Number(booking.depositPaid) : 0.50;
    const unitAmount = toStripeAmount(depositInUnits, currency);

    const requestOrigin =
      origin ||
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      "http://localhost:3000";

    const cleanOrigin = requestOrigin.replace(/\/$/, "");

    const estimatedTotal = Number(booking.estimatedTotal) || 280;
    const remainingBalance = Math.max(0, estimatedTotal - depositInUnits);

    // Pre-record the pending booking in MongoDB so reference ID exists
    if (process.env.DATABASE_URL && booking.ref) {
      try {
        await prisma.booking.upsert({
          where: { ref: booking.ref },
          update: {
            depositPaid: depositInUnits,
            estimatedTotal: estimatedTotal,
            status: "pending",
          },
          create: {
            ref: booking.ref,
            clientName: booking.clientName || "Client",
            clientEmail: booking.clientEmail || "",
            tattooTitle: booking.tattooTitle || "Custom Design",
            tattooImage: booking.tattooImage || "",
            style: booking.style || "Custom",
            placement: booking.placement || "Discuss at consultation",
            size: booking.size || "Standard",
            date: booking.date || "Flexible",
            time: booking.time || "12:00 PM",
            sessionType: booking.sessionType || "Studio Appointment",
            depositPaid: depositInUnits,
            estimatedTotal: estimatedTotal,
            status: "pending",
            notes: JSON.stringify({
              phone: booking.phone || "",
              notes: booking.notes || "",
              paymentStatus: "unpaid",
              service: booking.service || "tattoo",
            }),
          },
        });
      } catch (dbErr) {
        console.warn("Notice: could not pre-save booking record to DB before Stripe checkout:", dbErr);
      }
    }

    // Prepare line item image if valid public URL
    const images: string[] = [];
    if (
      booking.tattooImage &&
      typeof booking.tattooImage === "string" &&
      booking.tattooImage.startsWith("http")
    ) {
      images.push(booking.tattooImage);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email:
        booking.clientEmail && booking.clientEmail.includes("@")
          ? booking.clientEmail
          : undefined,
      client_reference_id: booking.ref,
      metadata: {
        bookingRef: booking.ref,
        clientName: booking.clientName || "",
        clientEmail: booking.clientEmail || "",
        tattooTitle: booking.tattooTitle || "",
        date: booking.date || "",
        time: booking.time || "",
        placement: booking.placement || "",
        style: booking.style || "",
        size: booking.size || "",
        depositPaid: String(depositInUnits),
        estimatedTotal: String(estimatedTotal),
        remainingBalance: String(remainingBalance),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: `Marked Studio — Reservation Deposit: ${booking.tattooTitle || "Tattoo Appointment"}`,
              description: `Deposit hold ($${depositInUnits.toFixed(2)} USD). Full estimated session price: $${estimatedTotal.toFixed(2)} USD. Remaining balance of $${remainingBalance.toFixed(2)} USD payable at the studio upon appointment completion.`,
              images: images.length > 0 ? images : undefined,
            },
          },
        },
      ],
      success_url: `${cleanOrigin}/book?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(
        booking.ref
      )}&payment=success`,
      cancel_url: `${cleanOrigin}/book?cancelled=true&ref=${encodeURIComponent(
        booking.ref
      )}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a valid checkout redirect URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; type?: string };
    console.error("Stripe Checkout Session creation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initiate Stripe Checkout Session" },
      { status: 500 }
    );
  }
}
