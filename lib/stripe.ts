// lib/stripe.ts
//
// The single Stripe entry point for the server.

import Stripe from "stripe";
import { fromMinorUnits, STRIPE_CURRENCY, toMinorUnits } from "@/lib/stripe-amounts";

export type StripeMode = "test" | "live";

function keyMode(key: string | undefined): StripeMode | null {
  if (!key) return null;
  if (key.startsWith("sk_test_") || key.startsWith("pk_test_") || key.startsWith("rk_test_")) {
    return "test";
  }
  if (key.startsWith("sk_live_") || key.startsWith("pk_live_") || key.startsWith("rk_live_")) {
    return "live";
  }
  return null;
}

/** True when a usable secret key is present. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0);
}

/**
 * Which Stripe environment the current keys point at, or null if unset.
 */
export function stripeMode(): StripeMode | null {
  return keyMode(process.env.STRIPE_SECRET_KEY);
}

/**
 * Validates Stripe environment keys and prevents footguns like mixing
 * sk_test_ with pk_live_ which causes opaque client-side failures.
 */
export function stripeKeyProblem(): string | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!secret) return "STRIPE_SECRET_KEY is not set.";
  if (!publishable) return "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.";

  const secretMode = keyMode(secret);
  const publishableMode = keyMode(publishable);

  if (!secretMode) return "STRIPE_SECRET_KEY is not a recognisable Stripe secret key.";
  if (!publishableMode) {
    return "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not a recognisable Stripe publishable key.";
  }
  if (secretMode !== publishableMode) {
    return `Stripe keys are from different environments: secret key is ${secretMode} mode but publishable key is ${publishableMode} mode.`;
  }
  if (!publishable.startsWith("pk_")) {
    return "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be the publishable key (pk_.), never a secret key.";
  }

  return null;
}

/** The currency charges are presented in. Defaults to usd. */
export function stripeCurrency(): string {
  return STRIPE_CURRENCY;
}

let cachedStripe: Stripe | null = null;

/** The shared Stripe client. Reused so HTTP connections are pooled across requests. */
export function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not configured.");
  }

  if (!cachedStripe) {
    cachedStripe = new Stripe(secretKey, {
      appInfo: { name: "Marked Studio", version: "1.0.0" },
    });
  }

  return cachedStripe;
}

/** Server-side wrapper over the shared conversion. */
export function toStripeAmount(amountInUnits: number, currency = stripeCurrency()): number {
  return toMinorUnits(amountInUnits, currency);
}

/** Inverse of toStripeAmount, for reading amounts back off Stripe. */
export function fromStripeAmount(minorUnits: number, currency = stripeCurrency()): number {
  return fromMinorUnits(minorUnits, currency);
}
