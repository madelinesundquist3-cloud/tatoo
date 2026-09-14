// app/api/stripe/webhook/route.ts
//
// Stripe webhook endpoint: the authoritative source of truth for payment settlements.
//
// Webhook signature verification is mandatory to prevent unauthorized requests.

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance, stripeConfigured } from "@/lib/stripe";
import { settleFromCheckoutSession } from "@/lib/stripe-settle";

export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set<Stripe.Event["type"]>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
]);

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET is not set; skipping webhook verification.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const stripe = getStripeInstance();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await settleFromCheckoutSession(session);
      console.log(`Stripe webhook checkout settlement for ${session.id}: ${result.status}`);
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn(`Stripe payment intent failed: ${intent.id} - ${intent.last_payment_error?.message || "declined"}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
