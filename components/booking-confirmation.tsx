"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
function CheckCircleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarPlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm7-7v6m-3-3h6" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoaderIcon({ className = "w-8 h-8 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

interface VerificationState {
  loading: boolean;
  paid: boolean;
  status: string;
  amount: number;
  currency: string;
  channel: string | null;
  bookingRef: string | null;
  customerEmail: string | null;
  booking?: {
    ref: string;
    clientName: string;
    clientEmail: string;
    tattooTitle: string;
    date: string;
    time: string;
    placement?: string;
    size?: string;
    style?: string;
    depositPaid: number;
    estimatedTotal: number;
  } | null;
  error?: string;
}

export function BookingConfirmation({ sessionId, bookingRef }: { sessionId: string; bookingRef?: string }) {
  const [state, setState] = useState<VerificationState>({
    loading: true,
    paid: false,
    status: "verifying",
    amount: 0.50,
    currency: "usd",
    channel: null,
    bookingRef: bookingRef || null,
    customerEmail: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          throw new Error(data.error || "Could not verify payment with Stripe.");
        }

        setState({
          loading: false,
          paid: Boolean(data.paid),
          status: data.status,
          amount: data.amount || 50,
          currency: data.currency || "usd",
          channel: data.channel || "card",
          bookingRef: data.bookingRef || bookingRef || null,
          customerEmail: data.customerEmail || null,
          booking: data.booking || null,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Payment verification failed.";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: msg,
        }));
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId, bookingRef]);

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Marked Studio Tattoo Appointment: ${state.booking?.tattooTitle || "Tattoo Session"}`);
    const details = encodeURIComponent(
      `Appointment reference: ${state.bookingRef}\nDeposit paid: $${state.amount.toFixed(2)}\nLocation: Marked Studio, Los Angeles, CA`
    );
    const location = encodeURIComponent("Marked Studio, Los Angeles, California");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  if (state.loading) {
    return (
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.025] p-8 sm:p-12 text-center">
        <LoaderIcon className="mx-auto mb-4 h-10 w-10 animate-spin text-[#d3b995]" />
        <h2 className="text-xl font-medium text-white">Verifying your Stripe deposit…</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Confirming your reservation details with Stripe and securing your studio slot.
        </p>
      </section>
    );
  }

  if (state.error || !state.paid) {
    return (
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-7 sm:p-10">
        <div className="flex items-center gap-3 text-amber-300">
          <AlertCircleIcon className="w-7 h-7" />
          <h2 className="text-xl font-medium">Payment pending or unconfirmed</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
          {state.error || "Stripe has not marked this checkout session as paid yet. If your card was charged, your reservation will update automatically once verified."}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/book" className="studio-button">
            Try again or book consultation
          </Link>
          <Link href="/" className="studio-button-secondary">
            Return home
          </Link>
        </div>
      </section>
    );
  }

  const b = state.booking;
  const remaining = (b?.estimatedTotal || 280) - state.amount;

  return (
    <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#d3b995]/40 bg-white/[0.03] p-7 sm:p-10 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d3b995]/20 text-[#d3b995]">
          <CheckCircleIcon className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#d3b995]">
            Deposit Confirmed · Stripe
          </span>
          <h2 className="text-2xl font-medium text-white">You’re officially booked!</h2>
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-300 leading-relaxed">
        Your ${state.amount.toFixed(2)} reservation deposit has been authorized and held via Stripe. Your slot is reserved on our studio calendar.
      </p>

      {/* Breakdown Card */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-zinc-400">Reservation Reference</span>
          <span className="font-mono font-semibold text-white">{state.bookingRef}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Piece / Service</span>
          <span className="font-medium text-zinc-200">{b?.tattooTitle || "Custom Tattoo"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Date & Preferred Time</span>
          <span className="text-zinc-200">{b?.date || "Scheduled"} · {b?.time || "Pacific Time"}</span>
        </div>

        {b?.placement && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Placement</span>
            <span className="text-zinc-200">{b.placement}</span>
          </div>
        )}

        {/* Transparent Financial Breakdown: Full Amount, Deposit, Balance */}
        <div className="border-t border-white/10 pt-3 space-y-2.5">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400">Total Estimated Service Price</span>
            <span className="font-mono font-bold text-white">${(b?.estimatedTotal || 280).toFixed(2)} USD</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#d3b995]">
              <ShieldCheckIcon className="h-4 w-4 text-[#d3b995]" />
              <span className="font-medium">Deposit Paid & Held (Stripe)</span>
            </div>
            <span className="font-mono font-bold text-[#d3b995]">-${state.amount.toFixed(2)} USD</span>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-semibold">
            <span className="text-zinc-200">Remaining Balance Due at Studio</span>
            <span className="font-mono text-emerald-400 font-bold">
              ${Math.max(0, (b?.estimatedTotal || 280) - state.amount).toFixed(2)} USD
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            * Payable via cash or card at the studio upon completion of your tattoo appointment.
          </p>
        </div>
      </div>

      {/* Appointment Prep & Actions */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-zinc-400 space-y-1">
        <p className="font-medium text-zinc-300">Studio Preparation Guidelines:</p>
        <p>• Please bring a valid government-issued photo ID (18+ only).</p>
        <p>• Eat a full meal and hydrate before arriving.</p>
        <p>• Deposits are credited directly toward the final cost of your tattoo.</p>
      </div>

      <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
        <a
          href={generateGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="studio-button w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
        >
          <CalendarPlusIcon className="w-4 h-4" />
          Add to Google Calendar
        </a>
        <Link
          href="/"
          className="studio-button-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
        >
          <span>Return Home</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
