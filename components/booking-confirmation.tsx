"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/services";
import { bookingLocation, locationName } from "@/lib/locations";

function CheckCircleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoaderIcon({ className = "w-8 h-8 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

interface ConfirmedBooking {
  ref: string;
  clientName: string;
  tattooTitle: string;
  date: string;
  time: string;
  placement: string;
  size: string;
  depositPaid: number;
  estimatedTotal: number;
  location: string | null;
}

type Verification =
  | { state: "loading" }
  | {
      state: "paid";
      amount: number;
      bookingRef: string | null;
      customerEmail: string | null;
      booking: ConfirmedBooking | null;
      offer: { percentOff: number; originalEstimate: number } | null;
    }
  | { state: "unpaid" }
  | { state: "error"; message: string };

export function BookingConfirmation({ sessionId }: { sessionId: string }) {
  const [result, setResult] = useState<Verification>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "We couldn’t confirm your payment yet.");
        setResult(
          data.paid
            ? {
                state: "paid",
                amount: Number(data.amount) || 0,
                bookingRef: data.bookingRef ?? null,
                customerEmail: data.customerEmail ?? null,
                booking: data.booking ?? null,
                offer: data.offer ?? null,
              }
            : { state: "unpaid" }
        );
      } catch (error) {
        if (!cancelled) {
          setResult({ state: "error", message: error instanceof Error ? error.message : "We couldn’t confirm your payment yet." });
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (result.state === "loading") {
    return (
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.025] p-8 sm:p-12 text-center" aria-live="polite">
        <LoaderIcon className="mx-auto mb-4 h-10 w-10 animate-spin text-[#d3b995]" />
        <h2 className="text-xl font-medium text-white">Confirming your deposit…</h2>
        <p className="mt-2 text-sm text-zinc-400">This takes a few seconds. Please don’t close this page.</p>
      </section>
    );
  }

  if (result.state !== "paid") {
    const unpaid = result.state === "unpaid";
    return (
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-7 sm:p-10" role="alert">
        <div className="flex items-center gap-3 text-amber-300">
          <AlertCircleIcon className="w-7 h-7" />
          <h2 className="text-xl font-medium">{unpaid ? "Payment not completed" : "We couldn’t confirm your payment yet"}</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
          {unpaid
            ? "Stripe hasn’t confirmed a payment for this checkout, so no booking was made. If you used a bank payment that takes time to clear, your booking will appear in My bookings once the payment succeeds."
            : result.message}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/book" className="studio-button">Try booking again</Link>
          <Link href="/my-bookings" className="studio-button-secondary">My bookings</Link>
        </div>
      </section>
    );
  }

  const b = result.booking;
  const estimatedBalance = b ? Math.max(0, b.estimatedTotal - result.amount) : null;

  return (
    <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#d3b995]/40 bg-white/[0.03] p-7 sm:p-10 shadow-2xl" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d3b995]/20 text-[#d3b995]">
          <CheckCircleIcon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-[#d3b995]">Deposit paid</p>
          <h2 className="text-2xl font-medium text-white">Your booking is in.</h2>
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-300 leading-relaxed">
        We received your {formatUsd(result.amount)} deposit. The studio will contact you to confirm your artist and exact appointment time.
      </p>

      <dl className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
          <dt className="text-zinc-400">Booking reference</dt>
          <dd className="font-mono font-semibold text-white break-all text-right">{result.bookingRef}</dd>
        </div>
        {b && (
          <>
            <div className="flex justify-between gap-4"><dt className="text-zinc-400">Studio</dt><dd className="text-right text-zinc-200">Marked Studio {locationName(bookingLocation(b.location))}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-zinc-400">Service</dt><dd className="text-right text-zinc-200">{b.tattooTitle}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-zinc-400">Size &amp; placement</dt><dd className="text-right text-zinc-200">{b.size} · {b.placement}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-zinc-400">Preferred time</dt><dd className="text-right text-zinc-200">{b.date} · {b.time}</dd></div>
            {result.offer && (
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-400">Offer</dt>
                <dd className="text-right text-[#d3b995]">
                  {result.offer.percentOff}% off · from {formatUsd(b.estimatedTotal)}{" "}
                  <s className="text-zinc-500">{formatUsd(result.offer.originalEstimate)}</s>
                </dd>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between gap-4 border-t border-white/10 pt-3"><dt className="text-[#d3b995]">Deposit paid</dt><dd className="font-mono font-bold text-[#d3b995]">{formatUsd(result.amount)}</dd></div>
        {b && estimatedBalance !== null && (
          <div className="flex justify-between gap-4"><dt className="text-zinc-400">Estimated balance at your session</dt><dd className="font-mono text-zinc-200">from {formatUsd(estimatedBalance)}</dd></div>
        )}
      </dl>

      {result.customerEmail && (
        <p className="mt-4 text-xs text-zinc-400">Stripe sends your payment receipt to <strong className="text-zinc-200">{result.customerEmail}</strong>.</p>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-300">
        <p className="font-medium text-white">Before your appointment</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
          <li>Bring a valid government-issued photo ID. You must be 18 or older.</li>
          <li>Eat a meal, stay hydrated, and avoid alcohol for 24 hours beforehand.</li>
          <li>Need to reschedule? Give at least 48 hours’ notice to keep your deposit. See the <Link href="/policies" className="text-[#d3b995] underline underline-offset-4">deposit policy</Link>.</li>
          <li>Read our <Link href="/aftercare" className="text-[#d3b995] underline underline-offset-4">aftercare guide</Link> so you’re ready to look after your new tattoo.</li>
        </ul>
      </div>

      <div className="mt-7 flex flex-col sm:flex-row gap-3">
        <Link href="/my-bookings" className="studio-button">View my bookings</Link>
        <Link href="/" className="studio-button-secondary">Return home</Link>
      </div>
    </section>
  );
}
