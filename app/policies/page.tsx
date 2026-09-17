import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DEPOSIT_POLICY_VERSION, RESCHEDULE_NOTICE_HOURS, SIZE_TIERS, formatUsd } from "@/lib/services";

export const metadata: Metadata = {
  title: "Deposit & Cancellation Policy | Marked Studio",
  description: "How deposits, rescheduling, cancellations, late arrivals, and age and ID requirements work at every Marked Studio location in the USA.",
};

const sections = [
  {
    title: "Deposits",
    points: [
      "A deposit is required to hold a tattoo appointment. Your booking is only confirmed after the deposit payment succeeds.",
      "Deposits are non-refundable and non-transferable.",
      "Your deposit is credited in full toward the final price of your tattoo. For multi-session work, it is applied to your last session.",
      "Estimates are starting prices. Your artist confirms the final quote after reviewing your design, size, and placement.",
    ],
  },
  {
    title: "Rescheduling and cancellations",
    points: [
      `You can reschedule once with at least ${RESCHEDULE_NOTICE_HOURS} hours’ notice, and your deposit moves to the new date.`,
      `Rescheduling with less than ${RESCHEDULE_NOTICE_HOURS} hours’ notice, a second reschedule, or cancelling your appointment forfeits your deposit.`,
      "If the studio needs to cancel, your deposit moves to a new date of your choice or is refunded in full.",
    ],
  },
  {
    title: "Late arrivals and no-shows",
    points: [
      "Arriving more than 15 minutes late may shorten your session or require rescheduling, which counts as a late reschedule.",
      "Missing your appointment without notice forfeits your deposit.",
    ],
  },
  {
    title: "Age and ID",
    points: [
      "You must be 18 or older and bring a valid, unexpired government-issued photo ID to every appointment.",
      "Our 18+ policy applies at every location, even in states that allow tattoos for minors with parental consent.",
      "Each studio follows its state and local health department requirements.",
    ],
  },
  {
    title: "Your health and safety",
    points: [
      "Tell your artist about skin conditions, allergies, medications, pregnancy, or anything that could affect healing.",
      "Please don’t arrive under the influence of alcohol or drugs. Your artist may reschedule an unsafe session.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section max-w-3xl pt-32 md:pt-36">
        <p className="studio-eyebrow">Client policies</p>
        <h1 className="studio-heading mt-4">Deposit &amp; cancellation policy</h1>
        <p className="mt-4 text-sm text-zinc-400">Policy version: {DEPOSIT_POLICY_VERSION}. You agree to this policy when you pay a deposit.</p>

        <section className="mt-10">
          <h2 className="text-xl text-white">Deposit amounts</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Size</th>
                  <th scope="col" className="px-4 py-3">Typical session</th>
                  <th scope="col" className="px-4 py-3">Deposit</th>
                  <th scope="col" className="px-4 py-3">Starting price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-zinc-300">
                {SIZE_TIERS.map((tier) => (
                  <tr key={tier.id}>
                    <th scope="row" className="px-4 py-3 font-medium text-white">{tier.label}</th>
                    <td className="px-4 py-3">{tier.detail}</td>
                    <td className="px-4 py-3 font-mono">{formatUsd(tier.deposit)}</td>
                    <td className="px-4 py-3 font-mono">{formatUsd(tier.estimate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#d3b995]">Couples packages cover two matching or complementary tattoos in a shared session, discounted lower per person than individual sessions with a single shared deposit.</p>
          <p className="mt-1.5 text-xs text-zinc-500">Tattoo removal starts with a free consultation, so no deposit is taken online.</p>
        </section>

        <div className="mt-10 space-y-10 leading-relaxed text-zinc-300">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl text-white">{section.title}</h2>
              <ul className="list-disc space-y-2 pl-5">
                {section.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/book" className="studio-button">Book now</Link>
          <Link href="/faq" className="studio-button-secondary">Read the FAQ</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
