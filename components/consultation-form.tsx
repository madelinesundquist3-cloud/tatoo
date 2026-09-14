"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SERVICES, TIME_PREFERENCES, getService, validPreferredDate, type ServiceId } from "@/lib/services";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogo } from "@/components/auth-modal";
function LockIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LoaderIcon({ className = "w-4 h-4 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CheckIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UserCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM19 11l2 2 4-4" />
    </svg>
  );
}

const DEFAULT_SERVICE_TOTALS: Record<ServiceId, number> = {
  tattoo: 280,
  "cover-up": 450,
  "touch-up": 150,
  removal: 220,
};

export function ConsultationForm({
  initialService,
  initialDesign = "",
  initialEstimatedTotal,
  initialDeposit,
  today,
}: {
  initialService: ServiceId;
  initialDesign?: string;
  initialEstimatedTotal?: number;
  initialDeposit?: number;
  today: string;
}) {
  const { user, loginWithGoogle, openAuthModal, logout } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [bookingMode, setBookingMode] = useState<"deposit" | "consultation">(
    initialService === "removal" ? "consultation" : "deposit"
  );
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<ServiceId>(initialService);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(
    initialEstimatedTotal || DEFAULT_SERVICE_TOTALS[initialService] || 280
  );
  const [depositAmount, setDepositAmount] = useState<number>(
    initialDeposit !== undefined ? initialDeposit : 50.00
  );
  const [depositPreset, setDepositPreset] = useState<"test" | "50" | "20pct" | "custom">(
    initialDeposit === 0.50 ? "test" : initialDeposit === 50 ? "50" : initialDeposit ? "custom" : "50"
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string>(TIME_PREFERENCES[3]);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState(initialDesign ? "Design inspiration: " + initialDesign : "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const requestId = useRef("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const service = getService(serviceId)!;
  const minDate = new Date(today + "T12:00:00Z");
  minDate.setUTCDate(minDate.getUTCDate() + 1);

  // Sync user info into form fields when user logs in
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, name, email]);

  function move(next: number) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  function handleSetFullAmount(val: number) {
    const newTotal = Math.max(10, val);
    setEstimatedTotal(newTotal);
    if (depositPreset === "20pct") {
      setDepositAmount(Math.max(0.50, Math.round(newTotal * 0.20)));
    } else if (depositAmount > newTotal) {
      setDepositAmount(newTotal);
    }
  }

  function handleSetDepositPreset(preset: "test" | "50" | "20pct" | "custom") {
    setDepositPreset(preset);
    if (preset === "test") {
      setDepositAmount(0.50);
    } else if (preset === "50") {
      setDepositAmount(Math.min(estimatedTotal, 50.00));
    } else if (preset === "20pct") {
      setDepositAmount(Math.max(0.50, Math.round(estimatedTotal * 0.20)));
    }
  }

  function handleCustomDeposit(val: number) {
    setDepositPreset("custom");
    setDepositAmount(val);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (step === 1) { move(2); return; }
    if (date && !validPreferredDate(date)) { setError("Please choose a future date, or leave the date blank if you’re flexible."); return; }
    if (step === 2) { move(3); return; }

    if (bookingMode === "deposit") {
      if (depositAmount < 0.50) {
        setError("Deposit must be at least $0.50 USD to process with Stripe.");
        return;
      }
      if (depositAmount > estimatedTotal) {
        setError("Deposit cannot exceed the full estimated service amount.");
        return;
      }
    }

    setBusy(true);
    setError("");
    if (!requestId.current) requestId.current = crypto.randomUUID();

    try {
      if (bookingMode === "deposit") {
        // Initiate real Stripe Checkout Session
        const bookingRef = "MS-" + requestId.current;
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking: {
              ref: bookingRef,
              userId: user?.id,
              clientName: name,
              clientEmail: email,
              clientUsername: user?.username,
              clientAvatar: user?.avatarUrl,
              phone,
              tattooTitle: service.name + (initialDesign ? ` (${initialDesign})` : ""),
              service: serviceId,
              style: serviceId,
              date: date || "Flexible",
              time: time + " · Pacific Time",
              placement: "Discuss at studio",
              depositPaid: depositAmount,
              estimatedTotal: estimatedTotal,
              notes,
            },
            origin: window.location.origin,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.url) {
          throw new Error(data.error || "Could not initiate Stripe Checkout. Please try again.");
        }

        // Redirect directly to Stripe Checkout
        window.location.href = data.url;
        return;
      }

      // Free consultation mode
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId.current, service: serviceId, date, time, name, email, phone, notes, consent }),
      });
      const data = await response.json();
      if (!response.ok || !data.ref) throw new Error(data.error || "We couldn’t save your request. Please try again.");
      setReference(data.ref);
      requestAnimationFrame(() => titleRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t process your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Gate booking behind login: User must be signed in with Google or an account to book
  if (!user) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-[#d3b995]/30 bg-white/[0.03] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d3b995]/15 border border-[#d3b995]/40 text-[#d3b995]">
          <LockIcon className="w-7 h-7" />
        </div>
        <span className="text-xs uppercase tracking-widest font-mono text-[#d3b995]">
          Sign-In Required
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-medium text-white">
          Please sign in to book
        </h2>
        <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
          Sign in with your Google account or email to reserve an appointment slot, pay your deposit securely, and manage your bookings.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-3 max-w-sm mx-auto">
          <button
            type="button"
            disabled={googleLoading}
            onClick={async () => {
              try {
                setGoogleLoading(true);
                setError("");
                await loginWithGoogle();
              } catch (err: any) {
                setError(err?.message || "Google sign-in could not be completed.");
              } finally {
                setGoogleLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <><LoaderIcon className="w-4 h-4 animate-spin text-black" /> Connecting to Google…</>
            ) : (
              <><GoogleLogo className="w-4 h-4" /> Continue with Google</>
            )}
          </button>

          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="w-full studio-button-secondary text-xs"
          >
            Sign in with Email & Password
          </button>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-zinc-400">
          <span>First time here? Google sign-in registers you automatically in seconds.</span>
        </div>
      </div>
    );
  }

  if (reference) return <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#d3b995]/30 bg-white/[0.025] p-7 sm:p-10">
    <CheckIcon className="mb-5 text-[#d3b995] w-8 h-8" />
    <h2 ref={titleRef} tabIndex={-1} className="text-2xl font-medium">Your consultation request is saved.</h2>
    <p className="mt-4 leading-relaxed text-zinc-300">Keep your reference below. Your appointment still needs confirmation of the provider, location, and time. No payment has been taken.</p>
    <dl className="mt-6 space-y-4 rounded-2xl bg-black/20 p-5 text-sm">
      <div><dt className="text-zinc-400">Reference</dt><dd className="mt-1 break-all font-mono">{reference}</dd></div>
      <div><dt className="text-zinc-400">Service</dt><dd>{service.name}</dd></div>
      <div><dt className="text-zinc-400">Preferred time · Pacific Time</dt><dd>{date || "Flexible date"} · {time}</dd></div>
      <div><dt className="text-zinc-400">Contact email</dt><dd className="break-all">{email}</dd></div>
    </dl>
    <Link href="/" className="studio-button mt-7">Back to home</Link>
  </section>;

  return <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
      {/* Active User Account Badge */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-[#d3b995]/20 bg-[#d3b995]/5 px-4 py-2.5 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <UserCheckIcon className="w-4 h-4 text-[#d3b995]" />
          <span>Signed in as <strong className="text-white">{user.name || user.email}</strong></span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-zinc-400 hover:text-white underline text-[11px]"
        >
          Switch account
        </button>
      </div>

      <ol aria-label="Booking steps" className="mb-8 flex justify-between gap-3 border-b border-white/10 pb-6 text-xs sm:text-sm">{["Service", "Preferred time", "Your details & payment"].map((label, i) => <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={step === i + 1 ? "text-[#d3b995]" : "text-zinc-400"}>{i + 1}. {label}</li>)}</ol>
      <h2 ref={titleRef} tabIndex={-1} className="mb-5 text-2xl font-medium">{step === 1 ? "What can we help with?" : step === 2 ? "When works for you?" : "Details & reservation options"}</h2>
      {step === 1 && (
        <fieldset>
          <legend className="sr-only">Choose a service</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((item) => (
              <label
                key={item.id}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  item.id === serviceId ? "border-[#d3b995] bg-[#d3b995]/10" : "border-white/15 hover:border-white/25"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="service"
                    value={item.id}
                    checked={item.id === serviceId}
                    onChange={() => {
                      setServiceId(item.id);
                      const def = DEFAULT_SERVICE_TOTALS[item.id] || 280;
                      setEstimatedTotal(def);
                      if (depositPreset === "20pct") {
                        setDepositAmount(Math.max(0.50, Math.round(def * 0.20)));
                      }
                      requestId.current = "";
                    }}
                    className="accent-[#d3b995]"
                  />
                  <span className="text-base font-medium">{item.name}</span>
                </span>
                <span className="mt-3 block text-sm leading-relaxed text-zinc-400">{item.detail}</span>
                <span className="mt-3 inline-block rounded-md bg-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300 border border-white/10">
                  Full est. from ${DEFAULT_SERVICE_TOTALS[item.id]} · Deposit from $50 (or $0.50 test)
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Choose your preferred session date and time window. All times are Los Angeles local time (Pacific Time).
          </p>
          <label className="block text-sm">
            Preferred date <span className="text-zinc-400">(optional)</span>
            <input
              type="date"
              value={date}
              min={minDate.toISOString().slice(0, 10)}
              onChange={(event) => { setDate(event.target.value); requestId.current = ""; }}
              className="studio-input [color-scheme:dark]"
            />
          </label>
          <label className="block text-sm">
            Time of day
            <select
              value={time}
              onChange={(event) => { setTime(event.target.value); requestId.current = ""; }}
              className="studio-input"
            >
              {TIME_PREFERENCES.map((slot) => <option key={slot}>{slot}</option>)}
            </select>
          </label>
          <p className="text-sm text-zinc-400">Not sure yet? Leave the date blank and select “I’m flexible.”</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {/* Reservation Type Selector */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Reservation Type</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  bookingMode === "deposit"
                    ? "border-[#d3b995] bg-[#d3b995]/10 shadow-sm"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bookingMode"
                    value="deposit"
                    checked={bookingMode === "deposit"}
                    onChange={() => setBookingMode("deposit")}
                    className="accent-[#d3b995]"
                  />
                  <span className="text-sm font-semibold text-white">Book with Deposit</span>
                </span>
                <span className="mt-1.5 block text-xs text-zinc-400">
                  Pay deposit today via Stripe to secure your date. Balance due at studio.
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  bookingMode === "consultation"
                    ? "border-[#d3b995] bg-[#d3b995]/10 shadow-sm"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bookingMode"
                    value="consultation"
                    checked={bookingMode === "consultation"}
                    onChange={() => setBookingMode("consultation")}
                    className="accent-[#d3b995]"
                  />
                  <span className="text-sm font-semibold text-white">Free Consultation</span>
                </span>
                <span className="mt-1.5 block text-xs text-zinc-400">
                  No payment today. Discuss ideas, sizing, and pricing first.
                </span>
              </label>
            </div>
          </div>

          {/* Full Amount & Deposit Pricing Controls */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-black/50 p-5 sm:p-6 space-y-6">
            {/* Section 1: Full Amount */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d3b995]/20 text-[11px] font-bold text-[#d3b995]">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-white">Full Estimated Service Amount</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Insert the total estimated quote for this tattoo session (USD).
                  </p>
                </div>

                {/* Editable Full Amount Input */}
                <div className="relative flex items-center self-start sm:self-auto">
                  <span className="absolute left-3 text-sm font-mono text-zinc-400">$</span>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    step={10}
                    value={estimatedTotal}
                    onChange={(e) => handleSetFullAmount(Number(e.target.value) || 0)}
                    className="w-36 rounded-xl border border-white/20 bg-zinc-900 py-2.5 pl-7 pr-3 text-right text-base font-bold text-white focus:border-[#d3b995] focus:outline-none focus:ring-1 focus:ring-[#d3b995]"
                    placeholder="280"
                  />
                  <span className="ml-2 text-xs font-mono text-zinc-400">USD</span>
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="pt-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                  Or select common session tier:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Small / Flash", amount: 150 },
                    { label: "Medium Piece", amount: 280 },
                    { label: "Large / Half Sleeve", amount: 600 },
                    { label: "Full Sleeve / Back", amount: 1200 },
                  ].map((preset) => (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => handleSetFullAmount(preset.amount)}
                      className={`rounded-xl border px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                        estimatedTotal === preset.amount
                          ? "border-[#d3b995] bg-[#d3b995]/20 text-white font-semibold shadow-sm"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-mono font-bold text-zinc-100">${preset.amount}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Deposit Amount & Selection */}
            {bookingMode === "deposit" && (
              <div className="border-t border-white/10 pt-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d3b995]/20 text-[11px] font-bold text-[#d3b995]">
                        2
                      </span>
                      <h3 className="text-sm font-bold text-white">Deposit to Reserve Appointment</h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Amount charged today via Stripe. Deducted directly from your full amount.
                    </p>
                  </div>

                  {/* Editable Deposit Input */}
                  <div className="relative flex items-center self-start sm:self-auto">
                    <span className="absolute left-3 text-sm font-mono text-[#d3b995]">$</span>
                    <input
                      type="number"
                      min={0.50}
                      max={estimatedTotal}
                      step={depositAmount < 1 ? 0.10 : 5}
                      value={depositAmount}
                      onChange={(e) => handleCustomDeposit(Math.max(0.50, Number(e.target.value) || 0))}
                      className="w-36 rounded-xl border border-[#d3b995]/50 bg-zinc-900 py-2.5 pl-7 pr-3 text-right text-base font-bold text-[#d3b995] focus:border-[#d3b995] focus:outline-none focus:ring-1 focus:ring-[#d3b995]"
                      placeholder="50.00"
                    />
                    <span className="ml-2 text-xs font-mono text-zinc-400">USD</span>
                  </div>
                </div>

                {/* Deposit Option Buttons */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                    Select or customize deposit:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetDepositPreset("test")}
                      className={`rounded-xl border px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                        depositPreset === "test" && depositAmount === 0.50
                          ? "border-[#d3b995] bg-[#d3b995]/20 text-white font-semibold"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-mono font-bold text-emerald-400">$0.50</div>
                      <div className="text-[10px] text-zinc-400 truncate">Stripe Test Hold</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetDepositPreset("50")}
                      className={`rounded-xl border px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                        depositPreset === "50" && depositAmount === 50
                          ? "border-[#d3b995] bg-[#d3b995]/20 text-white font-semibold"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-mono font-bold text-zinc-100">$50.00</div>
                      <div className="text-[10px] text-zinc-400 truncate">Standard Deposit</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetDepositPreset("20pct")}
                      className={`rounded-xl border px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                        depositPreset === "20pct"
                          ? "border-[#d3b995] bg-[#d3b995]/20 text-white font-semibold"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-mono font-bold text-zinc-100">
                        ${Math.max(0.50, Math.round(estimatedTotal * 0.20))}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">20% of Quote</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositPreset("custom")}
                      className={`rounded-xl border px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                        depositPreset === "custom"
                          ? "border-[#d3b995] bg-[#d3b995]/20 text-white font-semibold"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-mono font-bold text-zinc-100">Custom</div>
                      <div className="text-[10px] text-zinc-400 truncate">Type Any Deposit</div>
                    </button>
                  </div>
                </div>

                {/* 3-Line Financial Calculation Breakdown */}
                <div className="mt-4 rounded-xl border border-[#d3b995]/30 bg-black/60 p-4 space-y-2.5 text-xs shadow-inner">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-medium">1. Full Estimated Service Amount:</span>
                    <span className="font-mono font-bold text-white text-sm">${estimatedTotal.toFixed(2)} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-[#d3b995]">
                    <span className="font-medium">2. Deposit Required Today (Stripe):</span>
                    <span className="font-mono font-bold text-sm">-${depositAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm font-semibold">
                    <span className="text-zinc-200">3. Remaining Balance Due at Studio:</span>
                    <span className="font-mono text-emerald-400 font-bold text-base">
                      ${Math.max(0, estimatedTotal - depositAmount).toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed border-t border-white/5 mt-2">
                    💡 <strong>How this works:</strong> The ${depositAmount.toFixed(2)} deposit confirms and locks your appointment on our schedule. It is 100% credited toward your tattoo. When you arrive for your appointment, you only pay the remaining balance of ${Math.max(0, estimatedTotal - depositAmount).toFixed(2)} USD (Cash, Card, or Apple Pay).
                  </p>
                </div>
              </div>
            )}
          </div>

          <label className="block text-sm">
            Full name
            <input
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => { setName(event.target.value); requestId.current = ""; }}
              className="studio-input"
            />
          </label>
          <label className="block text-sm">
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => { setEmail(event.target.value); requestId.current = ""; }}
              className="studio-input"
            />
          </label>
          <label className="block text-sm">
            Phone <span className="text-zinc-400">(optional)</span>
            <input
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={phone}
              onChange={(event) => { setPhone(event.target.value); requestId.current = ""; }}
              className="studio-input"
            />
          </label>
          <label className="block text-sm">
            Anything you’d like us to know? <span className="text-zinc-400">(optional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(event) => { setNotes(event.target.value); requestId.current = ""; }}
              placeholder="Your idea, preferred style, or questions about the service."
              className="studio-input"
            />
            <span className="mt-2 block text-xs text-zinc-400">Please keep medical information for your provider consultation.</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1.5 accent-[#d3b995]"
            />
            <span>
              I agree to be contacted about this request and have read the{" "}
              <Link href="/privacy" target="_blank" className="underline underline-offset-4">privacy notice</Link>.{" "}
              {bookingMode === "deposit"
                ? `I understand the $${depositAmount.toFixed(2)} deposit secures the studio slot, and the balance of $${Math.max(0, estimatedTotal - depositAmount).toFixed(2)} is due at the session.`
                : "I understand this does not confirm an appointment."}
            </span>
          </label>
        </div>
      )}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
        {step > 1 ? (
          <button type="button" disabled={busy} onClick={() => move(step - 1)} className="flex min-h-11 items-center gap-1 text-sm disabled:opacity-50 cursor-pointer">
            <ChevronLeftIcon className="w-4 h-4" /> Back
          </button>
        ) : (
          <span className="text-xs text-zinc-400">Step 1 of 3</span>
        )}
        <button type="submit" disabled={busy} className="studio-button disabled:opacity-50">
          {busy ? (
            <><LoaderIcon className="w-4 h-4 animate-spin" /> {bookingMode === "deposit" && step === 3 ? "Redirecting to Stripe…" : "Saving request…"}</>
          ) : (
            <>{step === 3 ? (bookingMode === "deposit" ? `Pay $${depositAmount.toFixed(2)} Deposit with Stripe` : "Request Consultation") : "Continue"}<ArrowRightIcon className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </form>
    <aside className="rounded-2xl border border-white/10 p-6 lg:sticky lg:top-28">
      <p className="studio-eyebrow">Your reservation</p>
      <h2 className="mt-4 text-xl">{service.name}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{service.description}</p>
      <dl className="mt-6 space-y-4 border-t border-white/10 pt-5 text-sm">
        <div><dt className="text-zinc-400">Service area</dt><dd>Los Angeles, California</dd></div>
        <div><dt className="text-zinc-400">Preferred time</dt><dd>{date || "Flexible date"} · {time}</dd><dd className="mt-1 text-xs text-zinc-400">Pacific Time</dd></div>
        
        {/* Full Amount, Deposit, and Balance Breakdown */}
        <div className="border-t border-white/10 pt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <dt className="text-zinc-400">Full Estimated Amount</dt>
            <dd className="font-mono font-semibold text-white">${estimatedTotal.toFixed(2)} USD</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-zinc-400">Deposit Due Today</dt>
            <dd className="font-mono font-semibold text-[#d3b995]">
              {bookingMode === "deposit" ? `$${depositAmount.toFixed(2)} USD` : "No payment today"}
            </dd>
          </div>
          {bookingMode === "deposit" && (
            <>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <dt className="text-zinc-400">Balance due at session</dt>
                <dd className="font-mono text-emerald-400 font-bold">
                  ${Math.max(0, estimatedTotal - depositAmount).toFixed(2)} USD
                </dd>
              </div>
              <dd className="text-[11px] text-zinc-400 pt-1">
                Cards · Apple Pay · Google Pay · Link
              </dd>
            </>
          )}
        </div>
      </dl>
      {serviceId === "removal" && <p className="mt-6 text-sm leading-relaxed text-zinc-400">Removal requires a qualified provider assessment. Treatment count, suitability, results, and pricing vary. <Link href="/services/tattoo-removal" className="text-[#d3b995] underline underline-offset-4">Learn about removal</Link>.</p>}
    </aside>
  </div>;
}
