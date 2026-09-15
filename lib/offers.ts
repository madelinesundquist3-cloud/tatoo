// Seasonal offer. The checkout API decides whether it applies from the studio's local date,
// never from the browser, and records it on the booking so the studio honors it at the session.
// The deposit charged on Stripe is unchanged; the discount comes off the tattoo price.
import { acceptsDeposit, type ServiceId } from "@/lib/services";

export const OFFER = {
  id: "fall-2026-20-off",
  percentOff: 20,
  /** Last day (inclusive) a deposit booking gets the offer, in the studio's local time. */
  endsOn: "2026-11-30",
  endsLabel: "Nov 30",
} as const;

/** Midnight after the last offer day in Los Angeles, the last studio time zone to reach it (PST, UTC−8). */
export const OFFER_ENDS_AT = Date.parse("2026-12-01T08:00:00Z");

/** Whether a booking made on this studio-local date (YYYY-MM-DD) is inside the offer period. */
export function offerOpenOn(localDate: string) {
  return localDate <= OFFER.endsOn;
}

export function offerAppliesTo(serviceId: ServiceId, localDate: string) {
  return acceptsDeposit(serviceId) && offerOpenOn(localDate);
}

/** A price with the offer taken off, rounded to the cent. */
export function offerPrice(amount: number) {
  return Math.round(amount * (100 - OFFER.percentOff)) / 100;
}

/** The offer recorded on a booking's notes by the checkout API, if any. */
export function bookingOffer(notes: string | null | undefined): { percentOff: number; originalEstimate: number } | null {
  try {
    const offer = JSON.parse(notes || "null")?.offer;
    return offer && Number.isFinite(offer.percentOff) && Number.isFinite(offer.originalEstimate)
      ? { percentOff: offer.percentOff, originalEstimate: offer.originalEstimate }
      : null;
  } catch {
    return null;
  }
}
