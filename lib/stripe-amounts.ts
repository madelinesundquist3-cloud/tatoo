// lib/stripe-amounts.ts
// Currency arithmetic shared by the server and the browser. Kept apart from
// lib/stripe.ts so the client bundle never pulls in the Stripe Node SDK.

/**
 * Currencies Stripe expects in whole units rather than minor units. Sending
 * 5000 for ¥50 would overcharge by 100x, so this list is load-bearing.
 */
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "vnd", "vuv", "xaf", "xof", "xpf",
]);

/** Currencies Stripe accepts only in amounts evenly divisible by 100. */
const HUNDREDS_ONLY = new Set(["isk", "ugx"]);

/** The currency charges are presented in, as seen from the browser. Defaults to usd. */
export const STRIPE_CURRENCY = (
  process.env.NEXT_PUBLIC_STRIPE_CURRENCY || "usd"
).trim().toLowerCase();

/**
 * Convert a price in whole currency units into the minor units Stripe expects.
 *
 * USD 50 becomes 5000. JPY 5,000 stays 5000.
 */
export function toMinorUnits(amountInUnits: number, currency = STRIPE_CURRENCY): number {
  const code = currency.toLowerCase();

  if (ZERO_DECIMAL.has(code)) return Math.round(amountInUnits);

  const minor = Math.round(amountInUnits * 100);
  if (HUNDREDS_ONLY.has(code)) return Math.round(minor / 100) * 100;

  return minor;
}

/** The inverse of toMinorUnits, for reading amounts back off Stripe. */
export function fromMinorUnits(minorUnits: number, currency = STRIPE_CURRENCY): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? minorUnits : minorUnits / 100;
}
