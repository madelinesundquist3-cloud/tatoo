"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { getIdToken } from "@/lib/firebase";
import { bookingLocation, locationName } from "@/lib/locations";
import { GoogleLogo } from "@/components/auth-modal";

interface BookingRecord {
  id: string;
  ref: string;
  clientName: string;
  clientEmail: string;
  tattooTitle: string;
  tattooImage: string;
  style: string;
  placement: string;
  size: string;
  date: string;
  time: string;
  sessionType: string;
  location?: string | null;
  depositPaid: number;
  estimatedTotal: number;
  status: string;
  createdAt: string;
}

function LockIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LoaderIcon({ className = "w-5 h-5 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function ArrowUpRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7m0 0H7m10 0v10" />
    </svg>
  );
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  deposit_held: { label: "Deposit paid", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  confirmed: { label: "Confirmed", className: "border-[#d3b995]/40 bg-[#d3b995]/10 text-[#d3b995]" },
  completed: { label: "Completed", className: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
  cancelled: { label: "Cancelled", className: "border-white/15 bg-white/5 text-zinc-400" },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.deposit_held;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>
      <ShieldCheckIcon className="w-3.5 h-3.5" />
      {badge.label}
    </span>
  );
}

export default function MyBookingsPage() {
  const { user, loginWithGoogle } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!user?.email) return;

    async function fetchMyBookings() {
      try {
        setLoading(true);
        // The server returns only bookings for the verified Google account behind this token.
        const token = await getIdToken();
        if (!token) {
          setBookings([]);
          setAccessError("For your privacy, bookings are only shown after you sign in with Google.");
          return;
        }
        const res = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          setBookings([]);
          setAccessError(data.error || "We couldn't verify your account. Please sign in with Google again.");
          return;
        }
        setAccessError("");
        if (!res.ok) {
          setBookings([]);
          setLoadError(data.error || "Your bookings couldn’t be loaded. Please try again shortly.");
          return;
        }
        setLoadError("");
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error("Failed to load customer bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyBookings();
  }, [user]);

  const generateGoogleCalendarUrl = (b: BookingRecord) => {
    const title = encodeURIComponent(`Marked Studio Appointment: ${b.tattooTitle}`);
    const details = encodeURIComponent(
      `Appointment Ref: ${b.ref}\nDeposit Paid: $${b.depositPaid.toFixed(2)} USD\nRemaining Studio Balance: $${Math.max(0, b.estimatedTotal - b.depositPaid).toFixed(2)} USD\nLocation: Marked Studio ${locationName(bookingLocation(b.location))}`
    );
    const location = encodeURIComponent(`Marked Studio ${locationName(bookingLocation(b.location))}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const totalSpentOnDeposits = bookings.reduce((sum, b) => sum + (Number(b.depositPaid) || 0), 0);
  const totalOutstandingBalance = bookings.reduce(
    (sum, b) => sum + Math.max(0, (Number(b.estimatedTotal) || 0) - (Number(b.depositPaid) || 0)),
    0
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main id="main-content" className="flex-1 studio-section pt-32 pb-24 max-w-6xl mx-auto w-full px-5 sm:px-8">
        {/* Sign In Required State */}
        {!user ? (
          <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-[#d3b995]/30 bg-white/[0.03] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d3b995]/15 border border-[#d3b995]/40 text-[#d3b995]">
              <LockIcon className="w-7 h-7" />
            </div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#d3b995]">
              Account Access Required
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-medium text-white">
              Sign in to view your bookings
            </h1>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
              Sign in with the Google account you used when you paid your deposit.
            </p>

            <div className="mt-8 space-y-3 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => startTransition(async () => { await loginWithGoogle(); })}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <GoogleLogo className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="studio-eyebrow">Client portal</p>
                <h1 className="studio-heading mt-2 text-3xl sm:text-4xl">My Studio Bookings</h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Welcome back, <strong className="text-white">{user.name || user.email}</strong>. View your upcoming appointments, deposit receipts, and balance due.
                </p>
              </div>

              <Link href="/book" className="studio-button whitespace-nowrap self-start sm:self-auto text-xs">
                <span>Book New Session</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Total Bookings</span>
                <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white">{bookings.length}</p>
              </div>

              <div className="rounded-2xl border border-[#d3b995]/30 bg-[#d3b995]/5 p-4 sm:p-5">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#d3b995]">Deposits Paid</span>
                <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-[#d3b995]">${totalSpentOnDeposits.toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Balance Due at Studio</span>
                <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400">${totalOutstandingBalance.toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Your studios</span>
                <p className="mt-2 text-sm font-semibold text-zinc-200">
                  {bookings.length
                    ? Array.from(new Set(bookings.map((b) => locationName(bookingLocation(b.location))))).join(" · ")
                    : "None yet"}
                </p>
                <Link href="/locations" className="text-[11px] text-zinc-400 underline underline-offset-4">All locations</Link>
              </div>
            </div>

            {/* Bookings List */}
            {loading ? (
              <div className="mt-16 text-center py-16">
                <LoaderIcon className="mx-auto h-8 w-8 text-[#d3b995] mb-3" />
                <p className="text-sm text-zinc-400">Loading your studio reservations…</p>
              </div>
            ) : loadError ? (
              <div role="alert" className="mt-12 rounded-3xl border border-red-400/30 bg-red-400/10 p-10 text-center">
                <h3 className="text-lg font-semibold text-white">We couldn’t load your bookings</h3>
                <p className="mt-2 text-sm text-red-200">{loadError}</p>
                <p className="mt-2 text-xs text-zinc-400">Your bookings and deposits are safe. Refresh the page to try again.</p>
              </div>
            ) : accessError ? (
              <div className="mt-12 rounded-3xl border border-[#d3b995]/30 bg-white/[0.02] p-12 text-center">
                <LockIcon className="mx-auto h-10 w-10 text-[#d3b995] mb-3" />
                <h3 className="text-lg font-semibold text-white">Verify your account to see bookings</h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">{accessError}</p>
                <button
                  type="button"
                  onClick={() => startTransition(async () => { await loginWithGoogle(); })}
                  className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <GoogleLogo className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-zinc-500 mb-3" />
                <h3 className="text-lg font-semibold text-white">No bookings found for this account</h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                  You don’t have any active appointments under <strong className="text-zinc-200">{user.email}</strong>. Ready to start your next piece?
                </p>
                <Link href="/book" className="studio-button mt-6 inline-flex">
                  Explore Designs & Reserve Slot
                </Link>
              </div>
            ) : (
              <div className="mt-10 space-y-6">
                {bookings.map((b) => {
                  const remaining = Math.max(0, b.estimatedTotal - b.depositPaid);
                  return (
                    <div
                      key={b.ref}
                      className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 hover:border-[#d3b995]/40 transition-all shadow-xl space-y-6"
                    >
                      {/* Top Bar: Title & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-start gap-4">
                          {b.tattooImage ? (
                            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/15 bg-zinc-800 shrink-0">
                              <Image
                                src={b.tattooImage}
                                alt={b.tattooTitle}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg font-bold text-white">{b.tattooTitle}</h2>
                              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
                                {b.style}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              Booking Ref: <strong className="font-mono text-zinc-200">{b.ref}</strong> · {b.placement}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <StatusBadge status={b.status} />
                        </div>
                      </div>

                      {/* Middle Grid: Date, Location, and Financials */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Appointment Info */}
                        <div className="space-y-3 text-xs">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">Session Schedule</span>
                          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Date & Preferred Time:</span>
                              <span className="font-semibold text-white">{b.date} · {b.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Session Type:</span>
                              <span className="text-zinc-200">{b.sessionType || "Studio Appointment"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Location:</span>
                              <span className="text-zinc-200">Marked Studio {locationName(bookingLocation(b.location))}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Breakdown */}
                        <div className="space-y-3 text-xs">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">Financial Breakdown</span>
                          <div className="rounded-2xl border border-[#d3b995]/20 bg-[#d3b995]/5 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Estimated starting price:</span>
                              <span className="font-mono font-bold text-white">${b.estimatedTotal.toFixed(2)} USD</span>
                            </div>
                            <div className="flex items-center justify-between text-[#d3b995]">
                              <span className="font-medium">Deposit paid:</span>
                              <span className="font-mono font-bold">-${b.depositPaid.toFixed(2)} USD</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm font-semibold">
                              <span className="text-zinc-200">Estimated balance at session:</span>
                              <span className="font-mono text-emerald-400 font-bold">${remaining.toFixed(2)} USD</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <p className="text-xs text-zinc-400">
                          Stripe emailed your payment receipt. Need to reschedule? See the{" "}
                          <Link href="/policies" className="text-[#d3b995] underline underline-offset-4">deposit policy</Link>.
                        </p>

                        <a
                          href={generateGoogleCalendarUrl(b)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-400 hover:text-[#d3b995] transition-colors flex items-center gap-1"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Add to Google Calendar</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
