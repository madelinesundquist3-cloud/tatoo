import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { fromMinorUnits, toMinorUnits } from "@/lib/stripe-amounts";
import { CHECKOUT_STATUSES, isCheckoutStatus } from "@/lib/services";

export interface SettleResult {
  status: "paid" | "unpaid" | "failed";
  bookingRef: string | null;
  amount: number;
  currency: string;
}

function bookingRefOf(session: Stripe.Checkout.Session) {
  return session.client_reference_id || session.metadata?.bookingRef || null;
}

function parseNotes(notes: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(notes || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return { rawNotes: notes };
  }
}

/**
 * Turns a Checkout Session into a booking, but only when Stripe reports it paid for exactly the
 * deposit the server priced. Safe to call repeatedly (redirect and webhook both call it).
 * Database errors are thrown so the webhook responds 500 and Stripe retries delivery.
 */
export async function settleCheckoutSession(session: Stripe.Checkout.Session): Promise<SettleResult> {
  const bookingRef = bookingRefOf(session);
  const currency = session.currency || "usd";
  const amountMinor = session.amount_total ?? 0;
  const base = { bookingRef, amount: fromMinorUnits(amountMinor, currency), currency };

  // "complete" alone is not enough: delayed methods complete before the money arrives.
  if (!bookingRef || session.payment_status !== "paid") return { ...base, status: "unpaid" };

  const meta = session.metadata ?? {};
  const expectedDeposit = Number(meta.depositAmount);
  if (!Number.isFinite(expectedDeposit) || toMinorUnits(expectedDeposit, currency) !== amountMinor) {
    console.error(
      `Stripe session ${session.id} paid ${amountMinor} ${currency} but deposit ${meta.depositAmount} was expected; booking ${bookingRef} was not confirmed.`
    );
    return { ...base, status: "failed" };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured, so a paid booking cannot be recorded.");
  }

  const payment = {
    paymentStatus: "paid",
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    paidAt: new Date().toISOString(),
  };

  const existing = await prisma.booking.findUnique({ where: { ref: bookingRef } });
  if (existing && !isCheckoutStatus(existing.status)) return { ...base, status: "paid" };

  if (existing) {
    await prisma.booking.updateMany({
      where: { ref: bookingRef, status: { in: [...CHECKOUT_STATUSES] } },
      data: {
        status: "deposit_held",
        depositPaid: base.amount,
        notes: JSON.stringify({ ...parseNotes(existing.notes), ...payment }),
      },
    });
    return { ...base, status: "paid" };
  }

  // The checkout route saves the booking before redirecting; this only covers a record lost since.
  try {
    await prisma.booking.create({
      data: {
        ref: bookingRef,
        clientName: meta.clientName || session.customer_details?.name || "Client",
        clientEmail: meta.clientEmail || session.customer_details?.email || session.customer_email || "",
        tattooTitle: meta.tattooTitle || "Tattoo appointment",
        tattooImage: "",
        style: meta.service || "tattoo",
        placement: meta.placement || "To be discussed",
        size: meta.sizeLabel || "To be discussed",
        location: meta.location || null,
        date: meta.date || "Flexible",
        time: meta.time || "To be confirmed",
        sessionType: "Studio Appointment",
        depositPaid: base.amount,
        estimatedTotal: Number(meta.estimatedTotal) || 0,
        status: "deposit_held",
        notes: JSON.stringify({
          ...payment,
          ...(meta.offerId && {
            offer: { id: meta.offerId, percentOff: Number(meta.offerPercentOff), originalEstimate: Number(meta.originalEstimate) },
          }),
        }),
      },
    });
  } catch (error) {
    // A concurrent redirect/webhook already created it.
    if ((error as { code?: string }).code !== "P2002") throw error;
  }
  return { ...base, status: "paid" };
}

/** Records that a checkout failed or expired. The booking was never created, so it stays hidden. */
export async function markCheckoutUnpaid(
  session: Stripe.Checkout.Session,
  status: "payment_failed" | "payment_expired"
) {
  const bookingRef = bookingRefOf(session);
  if (!bookingRef || !process.env.DATABASE_URL) return;
  await prisma.booking.updateMany({ where: { ref: bookingRef, status: "awaiting_payment" }, data: { status } });
}
