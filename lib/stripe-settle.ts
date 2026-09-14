 import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export interface SettleResult {
  status: "completed" | "failed" | "pending" | "unknown";
  creditedNow: boolean;
  amount: number;
  currency: string;
  channel: string | null;
  card: { brand: string | null; last4: string | null } | null;
  message: string | null;
  bookingRef: string | null;
}

// In-memory settled transaction cache to quickly prevent duplicate webhook/redirect processing in the same process
const settledSessions = new Map<string, SettleResult>();

export async function settleFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<SettleResult> {
  const sessionId = session.id;

  if (settledSessions.has(sessionId)) {
    return { ...settledSessions.get(sessionId)!, creditedNow: false };
  }

  const bookingRef = session.client_reference_id || session.metadata?.bookingRef || null;
  const isPaid = session.payment_status === "paid" || session.status === "complete";
  const amount = (session.amount_total ?? 0) / 100;
  const currency = session.currency || "usd";

  if (isPaid) {
    const result: SettleResult = {
      status: "completed",
      creditedNow: true,
      amount,
      currency,
      channel: session.payment_method_types?.[0] ?? "card",
      card: null,
      message: "Stripe payment deposit completed successfully.",
      bookingRef,
    };

    settledSessions.set(sessionId, result);

    // Persist confirmation directly to MongoDB via Prisma
    if (bookingRef && process.env.DATABASE_URL) {
      try {
        const existing = await prisma.booking.findUnique({
          where: { ref: bookingRef },
        });

        if (existing) {
          let notesObj: Record<string, unknown> = {};
          try {
            notesObj = JSON.parse(existing.notes || "{}");
          } catch {
            notesObj = { rawNotes: existing.notes };
          }
          notesObj.stripeSessionId = sessionId;
          notesObj.paymentStatus = "deposit_held";
          notesObj.depositPaid = amount;
          notesObj.settledAt = new Date().toISOString();

          await prisma.booking.update({
            where: { ref: bookingRef },
            data: {
              status: "deposit_held",
              depositPaid: amount,
              notes: JSON.stringify(notesObj),
            },
          });
        } else {
          // If the booking wasn't pre-created, create it from checkout session metadata
          const meta = session.metadata || {};
          const notesObj = {
            stripeSessionId: sessionId,
            paymentStatus: "deposit_held",
            depositPaid: amount,
            settledAt: new Date().toISOString(),
          };

          await prisma.booking.create({
            data: {
              ref: bookingRef,
              clientName: meta.clientName || session.customer_details?.name || "Collector",
              clientEmail: meta.clientEmail || session.customer_details?.email || session.customer_email || "",
              tattooTitle: meta.tattooTitle || "Custom Design",
              tattooImage: meta.tattooImage || "",
              style: meta.style || "Custom",
              placement: meta.placement || "To be discussed",
              size: meta.size || "Standard",
              date: meta.date || "Scheduled",
              time: meta.time || "12:00 PM",
              sessionType: meta.sessionType || "Studio Appointment",
              depositPaid: amount,
              estimatedTotal: Number(meta.estimatedTotal) || 280,
              status: "deposit_held",
              notes: JSON.stringify(notesObj),
            },
          });
        }
      } catch (dbErr) {
        console.error("Failed to persist Stripe settlement in MongoDB:", dbErr);
      }
    }

    return result;
  }

  return {
    status: "pending",
    creditedNow: false,
    amount,
    currency,
    channel: session.payment_method_types?.[0] ?? "card",
    card: null,
    message: "Payment is pending authorization.",
    bookingRef,
  };
}
