import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConsultationForm } from "@/components/consultation-form";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { SIZE_TIERS, TIME_PREFERENCES, formatUsd, getService, getSizeTier, isPlacement } from "@/lib/services";
import { LOCATIONS, dateInTimeZone, getLocation } from "@/lib/locations";
import { SAMPLE_TATTOOS } from "@/lib/sample-tattoos";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;
  const isCancelled = params.cancelled === "true";

  const location = getLocation(params.location)?.id ?? "";
  const service = getService(params.service)?.id ?? "tattoo";
  const size = getSizeTier(params.size)?.id ?? (service === "couples" ? "couple-mini" : "medium");
  // Choices carried back from a cancelled checkout; the form re-validates everything.
  const placement = isPlacement(params.placement) ? (params.placement as string) : "";
  const time = TIME_PREFERENCES.find((slot) => slot === params.time) ?? TIME_PREFERENCES[3];
  const date = typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : "";
  const tattoo = SAMPLE_TATTOOS.find((item) => item.id === params.design);
  const todayByLocation = Object.fromEntries(LOCATIONS.map((studio) => [studio.id, dateInTimeZone(studio.timeZone)]));

  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section min-h-[75vh] pt-32 md:pt-36">
        {sessionId ? (
          <BookingConfirmation sessionId={sessionId} />
        ) : (
          <>
            <p className="studio-eyebrow">Studios across the USA</p>
            <h1 className="studio-heading mt-3">Book your tattoo.</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
              Choose your nearest studio, service, and size, then hold your spot with a deposit from {formatUsd(SIZE_TIERS[0].deposit)},
              credited toward your final price. Not ready yet? Request a free consultation instead.
            </p>

            {isCancelled && (
              <div role="status" className="mt-6 rounded-2xl border border-zinc-700/80 bg-zinc-900/60 p-4 text-sm text-zinc-300">
                <span className="font-semibold text-white">Checkout cancelled.</span> No payment was taken and no booking was made.
                Your details are still below, so you can pay whenever you’re ready.
              </div>
            )}

            <ConsultationForm
              key={[location, service, size, tattoo?.id, placement, date, time, isCancelled].join("|")}
              initialLocation={location}
              initialService={service}
              initialDesign={tattoo?.title ?? ""}
              initialSize={size}
              initialPlacement={placement}
              initialDate={date}
              initialTime={time}
              resumeCheckout={isCancelled}
              todayByLocation={todayByLocation}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
