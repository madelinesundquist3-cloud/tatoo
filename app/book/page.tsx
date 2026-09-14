import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConsultationForm } from "@/components/consultation-form";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { getService, pacificDate } from "@/lib/services";
import { SAMPLE_TATTOOS } from "@/lib/sample-tattoos";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;
  const bookingRef = typeof params.ref === "string" ? params.ref : undefined;
  const isCancelled = params.cancelled === "true";

  const service = getService(params.service)?.id ?? "tattoo";
  const tattoo = SAMPLE_TATTOOS.find((item) => item.id === params.design);

  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section min-h-[75vh] pt-32 md:pt-36">
        {sessionId ? (
          <BookingConfirmation sessionId={sessionId} bookingRef={bookingRef} />
        ) : (
          <>
            <p className="studio-eyebrow">Los Angeles · Pacific Time</p>
            <h1 className="studio-heading mt-3">Reserve your studio appointment.</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
              Lock in your date with a reservation deposit ($0.50 test or $50 standard hold), 100% credited toward your full session quote. The remaining balance is paid at the studio upon appointment completion.
            </p>

            {isCancelled && (
              <div className="mt-6 rounded-2xl border border-zinc-700/80 bg-zinc-900/60 p-4 text-sm text-zinc-300">
                <span className="font-semibold text-white">Payment cancelled:</span> No charge was made to your card. You can complete your deposit or send a consultation request below.
              </div>
            )}

            <ConsultationForm
              key={service + (tattoo?.id ?? "") + (params.price ?? "")}
              initialService={service}
              initialDesign={tattoo?.title ?? ""}
              initialEstimatedTotal={typeof params.price === "string" ? Number(params.price) : undefined}
              initialDeposit={typeof params.deposit === "string" ? Number(params.deposit) : undefined}
              today={pacificDate()}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
