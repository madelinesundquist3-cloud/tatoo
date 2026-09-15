// Stripe webhook: the authoritative record of deposit payments.
// Signature verification is mandatory. Processing errors return 500 so Stripe retries.

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance, stripeConfigured } from "@/lib/stripe";
import { markCheckoutUnpaid, settleCheckoutSession } from "@/lib/stripe-settle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeInstance().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const result = await settleCheckoutSession(event.data.object);
        console.log(`Stripe ${event.type} for ${event.data.object.id}: ${result.status}`);
        break;
      }
      case "checkout.session.async_payment_failed":
        await markCheckoutUnpaid(event.data.object, "payment_failed");
        break;
      case "checkout.session.expired":
        await markCheckoutUnpaid(event.data.object, "payment_expired");
        break;
      default:
        return NextResponse.json({ received: true, ignored: event.type });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
