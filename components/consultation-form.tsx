"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  PLACEMENTS,
  SERVICES,
  SIZE_TIERS,
  TIME_PREFERENCES,
  acceptsDeposit,
  formatUsd,
  getService,
  getSizeTier,
  type ServiceId,
  type SizeTierId,
} from "@/lib/services";
import { LOCATIONS, getLocation, locationName, validPreferredDate, type LocationId } from "@/lib/locations";
import { OFFER, offerOpenOn, offerPrice } from "@/lib/offers";
import { useAuth } from "@/lib/auth-context";
import { getIdToken } from "@/lib/firebase";
import { GoogleLogo } from "@/components/auth-modal";

function LockIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LoaderIcon({ className = "w-4 h-4 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CheckIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-right text-zinc-100">{value}</dd>
    </div>
  );
}

type BookingMode = "deposit" | "consultation";

// Typed details kept across a Stripe redirect so a cancelled checkout doesn't lose them.
const DRAFT_KEY = "marked-studio:booking-draft";

// Safe to read during the first render: phone and notes only appear once Firebase has restored
// the signed-in user, which never happens before hydration, so server and client markup match.
function readDraft(resumeCheckout: boolean): { phone?: string; notes?: string } {
  if (!resumeCheckout || typeof window === "undefined") return {};
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    return {
      phone: typeof draft?.phone === "string" ? draft.phone : undefined,
      notes: typeof draft?.notes === "string" ? draft.notes : undefined,
    };
  } catch {
    return {};
  }
}

export function ConsultationForm({
  initialService,
  initialLocation = "",
  initialDesign = "",
  initialSize = "medium",
  initialPlacement = "",
  initialDate = "",
  initialTime = TIME_PREFERENCES[3],
  resumeCheckout = false,
  todayByLocation,
}: {
  initialService: ServiceId;
  initialLocation?: LocationId | "";
  initialDesign?: string;
  initialSize?: SizeTierId;
  initialPlacement?: string;
  initialDate?: string;
  initialTime?: string;
  /** Returning from a cancelled checkout: reopen the last step with the saved details. */
  resumeCheckout?: boolean;
  /** Today's date in each studio's time zone, computed on the server. */
  todayByLocation: Record<string, string>;
}) {
  const { user, authReady, loginWithGoogle, logout } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [locationId, setLocationId] = useState<LocationId | "">(initialLocation);
  const [serviceId, setServiceId] = useState<ServiceId>(initialService);
  const [preferredMode, setPreferredMode] = useState<BookingMode>("deposit");
  const [step, setStep] = useState(resumeCheckout && initialLocation && initialPlacement ? 3 : 1);
  const [sizeId, setSizeId] = useState<SizeTierId>(initialSize);
  const [placement, setPlacement] = useState(initialPlacement);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState<string>(initialTime);
  const [name, setName] = useState<string | null>(null);
  const [draft] = useState(() => readDraft(resumeCheckout));
  const [phone, setPhone] = useState(draft.phone ?? "");
  const [notes, setNotes] = useState(draft.notes ?? (initialDesign ? "Design inspiration: " + initialDesign : ""));
  const [consent, setConsent] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  // Idempotency key for the current request; cleared whenever the request changes.
  const requestId = useRef("");
  const titleRef = useRef<HTMLHeadingElement>(null);

  const location = getLocation(locationId);
  const service = getService(serviceId)!;
  const size = getSizeTier(sizeId)!;
  const bookingMode: BookingMode = acceptsDeposit(serviceId) ? preferredMode : "consultation";
  const contactName = name ?? user?.name ?? "";
  const email = user?.email ?? "";
  const today = todayByLocation[location?.id ?? LOCATIONS[0].id] ?? new Date().toISOString().slice(0, 10);
  // Mirrors the checkout API, which applies the offer from the studio's local date.
  const offerOpen = offerOpenOn(today);
  const offerOn = offerOpen && acceptsDeposit(serviceId);
  const estimate = offerOn ? offerPrice(size.estimate) : size.estimate;
  const estimatedBalance = Math.max(0, estimate - size.deposit);
  const minDate = new Date(today + "T12:00:00Z");
  minDate.setUTCDate(minDate.getUTCDate() + 1);

  function resetRequest() {
    requestId.current = "";
  }

  async function signIn() {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user") {
        setError(err instanceof Error ? err.message : "Google sign-in could not be completed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  function move(next: number) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!location) {
      if (step !== 1) move(1);
      return setError("Choose the studio you’d like to visit.");
    }
    if (step === 1) return move(2);
    if (step === 2) {
      if (!placement) return setError("Choose where the tattoo will go, or pick “Other / not sure”.");
      if (date && !validPreferredDate(date, location.timeZone)) {
        return setError("Please choose a future date, or leave the date blank if you’re flexible.");
      }
      return move(3);
    }
    if (!user) return setError("Sign in with Google to finish your booking. Your details are kept.");

    setBusy(true);
    setError("");
    if (!requestId.current) requestId.current = crypto.randomUUID();
    let redirecting = false;

    try {
      if (bookingMode === "deposit") {
        const token = await getIdToken();
        if (!token) throw new Error("Your sign-in has expired. Please sign in with Google again.");
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            requestId: requestId.current,
            location: location.id,
            service: serviceId,
            size: sizeId,
            placement,
            date,
            time,
            name: contactName,
            phone,
            notes,
            design: initialDesign,
            consent,
            policyAccepted,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || typeof data.url !== "string") {
          throw new Error(data.error || "We couldn’t open secure checkout. No payment has been taken.");
        }
        // The booking is created only after Stripe confirms the payment.
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ phone, notes }));
        } catch {
          // Without storage, a cancelled checkout just asks for phone and notes again.
        }
        redirecting = true;
        window.location.assign(data.url);
        return;
      }

      const message = [`Size: ${size.label}`, `Placement: ${placement}`, notes.trim()]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1000);
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          location: location.id,
          service: serviceId,
          date,
          time,
          name: contactName,
          email,
          phone,
          notes: message,
          consent,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ref) throw new Error(data.error || "We couldn’t save your request. Please try again.");
      setReference(data.ref);
      requestAnimationFrame(() => titleRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t process your request. Please try again.");
    } finally {
      if (!redirecting) setBusy(false);
    }
  }

  if (reference) {
    return (
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#d3b995]/30 bg-white/[0.025] p-7 sm:p-10">
        <CheckIcon className="mb-5 text-[#d3b995] w-8 h-8" />
        <h2 ref={titleRef} tabIndex={-1} className="text-2xl font-medium">Your consultation request is saved.</h2>
        <p className="mt-4 leading-relaxed text-zinc-300">
          The studio will contact you to talk through your idea. A consultation doesn’t reserve an appointment, and no payment has been taken.
        </p>
        <dl className="mt-6 space-y-4 rounded-2xl bg-black/20 p-5 text-sm">
          <div><dt className="text-zinc-400">Reference</dt><dd className="mt-1 break-all font-mono">{reference}</dd></div>
          {location && <div><dt className="text-zinc-400">Studio</dt><dd>Marked Studio {locationName(location)}</dd></div>}
          <div><dt className="text-zinc-400">Service</dt><dd>{service.name}</dd></div>
          <div><dt className="text-zinc-400">Preferred time · {location?.timeZoneLabel}</dt><dd>{date || "Flexible date"} · {time}</dd></div>
          <div><dt className="text-zinc-400">Contact email</dt><dd className="break-all">{email}</dd></div>
        </dl>
        <Link href="/" className="studio-button mt-7">Back to home</Link>
      </section>
    );
  }

  const steps = ["Studio & service", "Your tattoo", bookingMode === "deposit" ? "Details & deposit" : "Your details"];
  const headings = ["Where and what?", "Tell us about your tattoo", bookingMode === "deposit" ? "Your details & deposit" : "Your details"];

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
        {user && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#d3b995]/20 bg-[#d3b995]/5 px-4 py-2.5 text-xs text-zinc-300">
            <span className="truncate">Signed in as <strong className="text-white">{user.email}</strong></span>
            <button type="button" onClick={() => void logout()} className="shrink-0 text-zinc-400 hover:text-white underline text-[11px]">
              Switch account
            </button>
          </div>
        )}

        <ol aria-label="Booking steps" className="mb-8 flex justify-between gap-3 border-b border-white/10 pb-6 text-xs sm:text-sm">
          {steps.map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={step === i + 1 ? "text-[#d3b995]" : "text-zinc-400"}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>
        <h2 ref={titleRef} tabIndex={-1} className="mb-5 text-2xl font-medium">{headings[step - 1]}</h2>

        {step === 1 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-sm font-medium">Choose your studio</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {LOCATIONS.map((studio) => (
                  <label
                    key={studio.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                      studio.id === locationId ? "border-[#d3b995] bg-[#d3b995]/10" : "border-white/15 hover:border-white/25"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="location"
                        value={studio.id}
                        checked={studio.id === locationId}
                        onChange={() => { setLocationId(studio.id); setDate(""); resetRequest(); }}
                        className="accent-[#d3b995]"
                      />
                      <span className="font-medium">{locationName(studio)}</span>
                    </span>
                    <span className="mt-2 block text-xs text-zinc-400">{studio.state} · {studio.timeZoneLabel}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Not sure which is closest? See all <Link href="/locations" target="_blank" className="underline underline-offset-4">studio locations</Link>.
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">What can we help with?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SERVICES.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
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
                          if (item.id === "couples") {
                            setSizeId("couple-mini");
                          } else if (sizeId.startsWith("couple-")) {
                            setSizeId("medium");
                          }
                          resetRequest();
                        }}
                        className="accent-[#d3b995]"
                      />
                      <span className="text-base font-medium">{item.name}</span>
                      {item.id === "couples" && (
                        <span className="rounded-full bg-[#d3b995]/20 border border-[#d3b995]/40 px-2 py-0.5 text-[10px] font-semibold text-[#d3b995]">
                          Save 25–35% / person
                        </span>
                      )}
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed text-zinc-400">{item.detail}</span>
                    <span className="mt-3 inline-block rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                      {acceptsDeposit(item.id) ? `Book with a deposit from ${formatUsd(item.id === "couples" ? 70 : SIZE_TIERS[0].deposit)}` : "Free consultation first"}
                    </span>
                    {acceptsDeposit(item.id) && offerOpen && (
                      <span className="ml-2 mt-3 inline-block rounded-md bg-[#d3b995] px-2.5 py-1 text-xs font-semibold text-[#171612]">
                        {OFFER.percentOff}% off until {OFFER.endsLabel}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <fieldset>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <legend className="text-sm font-medium">
                  {serviceId === "couples" ? "Choose your couples package (covers both people)" : "Approximate size"}
                </legend>
                {serviceId === "couples" ? (
                  <span className="text-xs font-semibold text-[#d3b995]">
                    Lower rates per person than individual sessions
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setServiceId("couples");
                      setSizeId("couple-mini");
                      resetRequest();
                    }}
                    className="text-xs text-[#d3b995] hover:underline"
                  >
                    Booking for two? View Couples Packages →
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {serviceId === "couples"
                  ? "Packages include two matching or complementary tattoos in a shared appointment. Each person pays significantly less than individual rates, with one shared deposit."
                  : "Estimates are starting prices in USD. Your artist confirms the final quote after reviewing your idea."}
                {offerOn && ` Prices include ${OFFER.percentOff}% off for deposit bookings made by ${OFFER.endsLabel}.`}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(serviceId === "couples"
                  ? SIZE_TIERS.filter((t) => t.category === "couple")
                  : SIZE_TIERS.filter((t) => t.category === "individual")
                ).map((tier) => (
                  <label
                    key={tier.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                      tier.id === sizeId ? "border-[#d3b995] bg-[#d3b995]/10" : "border-white/15 hover:border-white/25"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        value={tier.id}
                        checked={tier.id === sizeId}
                        onChange={() => { setSizeId(tier.id); resetRequest(); }}
                        className="accent-[#d3b995]"
                      />
                      <span className="font-medium">{tier.label}</span>
                    </span>
                    <span className="mt-2 block text-xs text-zinc-400">{tier.detail}</span>
                    <span className="mt-3 block font-mono text-xs text-zinc-300">
                      Total:{" "}
                      {offerOn ? (
                        <>
                          <s className="text-zinc-500">{formatUsd(tier.estimate)}</s>{" "}
                          <span className="text-[#d3b995]">{formatUsd(offerPrice(tier.estimate))}</span>
                        </>
                      ) : (
                        formatUsd(tier.estimate)
                      )}
                      {acceptsDeposit(serviceId) ? ` · ${formatUsd(tier.deposit)} deposit` : ""}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm">
              Placement
              <select
                required
                value={placement}
                onChange={(event) => { setPlacement(event.target.value); resetRequest(); }}
                className="studio-input"
              >
                <option value="" disabled>Choose a body area</option>
                {PLACEMENTS.map((area) => <option key={area}>{area}</option>)}
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                Preferred date <span className="text-zinc-400">(optional)</span>
                <input
                  type="date"
                  value={date}
                  min={minDate.toISOString().slice(0, 10)}
                  onChange={(event) => { setDate(event.target.value); resetRequest(); }}
                  className="studio-input [color-scheme:dark]"
                />
              </label>
              <label className="block text-sm">
                Time of day
                <select value={time} onChange={(event) => { setTime(event.target.value); resetRequest(); }} className="studio-input">
                  {TIME_PREFERENCES.map((slot) => <option key={slot}>{slot}</option>)}
                </select>
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {location
                ? `Times are ${location.timeZoneLabel}, local to our ${location.city} studio.`
                : "Times are local to your studio."}{" "}
              The studio confirms your exact appointment time.
            </p>
          </div>
        )}

        {step === 3 && !user && (
          <div className="rounded-2xl border border-[#d3b995]/30 bg-[#d3b995]/5 p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d3b995]/40 bg-[#d3b995]/15 text-[#d3b995]">
              <LockIcon className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium text-white">Sign in to finish your booking</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-300">
              Your choices are saved. Sign in with Google so we can link your booking, deposit receipt, and appointment details to your account.
            </p>
            {authReady ? (
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => void signIn()}
                className="mx-auto mt-6 flex w-full max-w-sm cursor-pointer items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {googleLoading ? (
                  <><LoaderIcon className="w-4 h-4 animate-spin" /> Connecting to Google…</>
                ) : (
                  <><GoogleLogo className="w-4 h-4" /> Continue with Google</>
                )}
              </button>
            ) : (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400">
                <LoaderIcon className="w-4 h-4 animate-spin" /> Checking your sign-in…
              </p>
            )}
          </div>
        )}

        {step === 3 && user && (
          <div className="space-y-6">
            {acceptsDeposit(serviceId) ? (
              <fieldset className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <legend className="px-1 text-xs uppercase tracking-wider font-semibold text-zinc-400">How would you like to book?</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {([
                    ["deposit", "Book with a deposit", `Pay ${formatUsd(size.deposit)} today to hold your spot. It’s credited toward your final price.${offerOn ? ` Locks in ${OFFER.percentOff}% off.` : ""}`],
                    ["consultation", "Free consultation", "No payment. Talk through your idea first; this doesn’t reserve a spot."],
                  ] as const).map(([mode, title, description]) => (
                    <label
                      key={mode}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                        bookingMode === mode ? "border-[#d3b995] bg-[#d3b995]/10" : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="bookingMode"
                          value={mode}
                          checked={bookingMode === mode}
                          onChange={() => { setPreferredMode(mode); resetRequest(); }}
                          className="accent-[#d3b995]"
                        />
                        <span className="text-sm font-semibold text-white">{title}</span>
                      </span>
                      <span className="mt-1.5 block text-xs text-zinc-400">{description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <p className="rounded-2xl border border-[#d3b995]/30 bg-[#d3b995]/5 p-4 text-sm leading-relaxed text-zinc-300">
                Tattoo removal starts with a free consultation so a qualified provider can assess your tattoo first. No payment is taken today.
              </p>
            )}

            <label className="block text-sm">
              Full name
              <input
                autoComplete="name"
                required
                maxLength={100}
                value={contactName}
                onChange={(event) => { setName(event.target.value); resetRequest(); }}
                className="studio-input"
              />
            </label>
            <div className="text-sm">
              <span>Email</span>
              <p className="mt-2 break-all rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-zinc-200">{email}</p>
              <p className="mt-1.5 text-xs text-zinc-500">Your confirmation and receipt go to your Google account email.</p>
            </div>
            <label className="block text-sm">
              Phone <span className="text-zinc-400">(optional)</span>
              <input
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(event) => { setPhone(event.target.value); resetRequest(); }}
                className="studio-input"
              />
            </label>
            <label className="block text-sm">
              {serviceId === "couples" ? "Describe both designs & partner’s name" : "Describe your idea"} <span className="text-zinc-400">(optional)</span>
              <textarea
                rows={4}
                maxLength={1000}
                value={notes}
                onChange={(event) => { setNotes(event.target.value); resetRequest(); }}
                placeholder={
                  serviceId === "couples"
                    ? "Partner’s name, both matching or individual design ideas, placements, or reference links."
                    : "Style, subject, colors, reference links, or anything your artist should know."
                }
                className="studio-input"
              />
              <span className="mt-2 block text-xs text-zinc-400">Please keep medical details for your in-person consultation.</span>
            </label>

            {bookingMode === "deposit" && (
              <div className="rounded-2xl border border-[#d3b995]/30 bg-black/50 p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-zinc-300">Deposit due today</span><span className="font-mono font-semibold text-[#d3b995]">{formatUsd(size.deposit)}</span></div>
                <div className="flex justify-between gap-3">
                  <span className="text-zinc-400">Estimated starting price{offerOn && ` (${OFFER.percentOff}% off)`}</span>
                  <span className="font-mono text-zinc-200">
                    {offerOn && <s className="mr-2 text-zinc-500">{formatUsd(size.estimate)}</s>}
                    {formatUsd(estimate)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-zinc-400">Estimated balance at your session</span><span className="font-mono text-zinc-200">from {formatUsd(estimatedBalance)}</span></div>
              </div>
            )}

            <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
              <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1.5 accent-[#d3b995]" />
              <span>
                I agree to be contacted about this booking and have read the{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-4">privacy notice</Link>.
              </span>
            </label>

            {bookingMode === "deposit" && (
              <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
                <input type="checkbox" required checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} className="mt-1.5 accent-[#d3b995]" />
                <span>
                  I’ve read the{" "}
                  <Link href="/policies" target="_blank" className="underline underline-offset-4">deposit &amp; cancellation policy</Link>: my{" "}
                  {formatUsd(size.deposit)} deposit is non-refundable, is credited toward my final price, and can be moved once with at least 48 hours’ notice.
                  I’m 18 or older and will bring a valid photo ID.
                </span>
              </label>
            )}
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
          {(step < 3 || user) && (
            <button type="submit" disabled={busy} className="studio-button disabled:opacity-50">
              {busy ? (
                <><LoaderIcon className="w-4 h-4 animate-spin" /> {bookingMode === "deposit" ? "Opening secure checkout…" : "Saving request…"}</>
              ) : (
                <>
                  {step < 3 ? "Continue" : bookingMode === "deposit" ? `Pay ${formatUsd(size.deposit)} deposit` : "Request free consultation"}
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <aside className="rounded-2xl border border-white/10 p-6 lg:sticky lg:top-28">
        <p className="studio-eyebrow">Your booking</p>
        <h2 className="mt-4 text-xl">{service.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{service.description}</p>
        <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
          <SummaryRow label="Studio" value={location ? locationName(location) : "Not chosen yet"} />
          <SummaryRow label="Size" value={size.label} />
          <SummaryRow label="Placement" value={placement || "Not chosen yet"} />
          <SummaryRow
            label="Preferred time"
            value={`${date || "Flexible date"} · ${time}${location ? ` (${location.timeZoneLabel})` : ""}`}
          />
          <SummaryRow
            label="Estimated starting price"
            value={offerOn ? `${formatUsd(estimate)} (${OFFER.percentOff}% off)` : formatUsd(estimate)}
          />
          <SummaryRow label="Due today" value={bookingMode === "deposit" ? `${formatUsd(size.deposit)} deposit` : "Nothing"} />
        </dl>
        {bookingMode === "deposit" && (
          <p className="mt-5 text-xs leading-relaxed text-zinc-400">
            Secure checkout by Stripe. Your booking is only created after your payment succeeds.
          </p>
        )}
        {serviceId === "removal" && (
          <p className="mt-6 text-sm leading-relaxed text-zinc-400">
            Removal requires a qualified provider assessment. Treatment count, suitability, results, and pricing vary.{" "}
            <Link href="/services/tattoo-removal" className="text-[#d3b995] underline underline-offset-4">Learn about removal</Link>.
          </p>
        )}
      </aside>
    </div>
  );
}
