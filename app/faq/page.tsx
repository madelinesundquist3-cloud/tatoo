import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RESCHEDULE_NOTICE_HOURS, SIZE_TIERS, formatUsd } from "@/lib/services";
import { LOCATIONS, locationName } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Tattoo FAQ | Marked Studio",
  description: "Answers about booking, deposits, pricing, age and ID requirements, preparing for your session, cover-ups, and tattoo removal at Marked Studio.",
};

const lowestDeposit = formatUsd(SIZE_TIERS[0].deposit);
const highestDeposit = formatUsd(SIZE_TIERS[SIZE_TIERS.length - 1].deposit);

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: `Choose your nearest studio, service, size, and placement on the booking page, then pay a deposit (${lowestDeposit}–${highestDeposit} depending on size) with secure Stripe checkout. Your booking is created once the payment succeeds, and the studio contacts you to confirm your artist and exact time.`,
  },
  {
    question: "Why do I need a deposit, and is it refundable?",
    answer: "The deposit reserves your artist’s time and covers design work. It’s non-refundable, but it’s credited in full toward the final price of your tattoo.",
  },
  {
    question: "Can I reschedule?",
    answer: `Yes, once, with at least ${RESCHEDULE_NOTICE_HOURS} hours’ notice; your deposit moves to the new date. Later changes, a second reschedule, or a no-show forfeit the deposit.`,
  },
  {
    question: "How much will my tattoo cost?",
    answer: "Price depends on size, detail, color, placement, and session length. The booking page shows starting estimates; your artist gives you a final quote after reviewing your idea.",
  },
  {
    question: "Do you offer couples or matching tattoo packages?",
    answer: "Yes! We offer dedicated Couples & Duo packages for matching or complementary tattoos in a shared session. These packages are priced significantly lower per person than booking two separate individual sessions ($110/person for mini/flash vs $150 individual, $240/person for medium vs $350 individual), and require only one shared deposit.",
  },
  {
    question: "Where are your studios?",
    answer: `We have studios in ${LOCATIONS.map(locationName).join(", ")}. You book in your studio’s local time, and every location offers tattoos, cover-ups, touch-ups, and removal consultations.`,
  },
  {
    question: "How old do I have to be?",
    answer: "You must be 18 or older with a valid, unexpired government-issued photo ID at every location, even in states that allow tattoos for minors with parental consent.",
  },
  {
    question: "How should I prepare for my session?",
    answer: "Get a good night’s sleep, eat a full meal, drink plenty of water, and avoid alcohol for 24 hours beforehand. Wear comfortable clothing that gives easy access to the placement area.",
  },
  {
    question: "Can I bring my own design or reference images?",
    answer: "Yes. Describe your idea and include reference links when you book. Your artist will create a custom design based on your references rather than copying another artist’s work.",
  },
  {
    question: "Can you cover up an old tattoo?",
    answer: "Often, yes. Book a cover-up so your artist can assess the size, darkness, and color of your existing tattoo. Very dark pieces may need a few laser fading sessions first.",
  },
  {
    question: "Do you offer tattoo removal?",
    answer: "Yes. Our tattoo removal and fading appointments begin with a consultation with a qualified provider to assess your tattoo, explain realistic expectations, number of sessions, and pricing. Your online deposit holds your spot and is credited in full toward your treatment.",
  },
  {
    question: "How do I take care of my new tattoo?",
    answer: "Follow your artist’s instructions and our aftercare guide: keep it clean, moisturize lightly, don’t pick at it, and avoid soaking and direct sun while it heals.",
  },
];

// Structured data so search engines can show these answers directly.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section max-w-3xl pt-32 md:pt-36">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
        <p className="studio-eyebrow">Questions</p>
        <h1 className="studio-heading mt-4">Frequently asked questions</h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Can’t find your answer? Read our <Link href="/policies" className="text-[#d3b995] underline underline-offset-4">deposit policy</Link> and{" "}
          <Link href="/aftercare" className="text-[#d3b995] underline underline-offset-4">aftercare guide</Link>, or book your appointment online.
        </p>

        <div className="mt-10">
          {faqs.map((faq) => (
            <details key={faq.question} className="border-b border-white/10 py-5">
              <summary className="cursor-pointer text-base font-medium marker:text-[#d3b995]">{faq.question}</summary>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/book" className="studio-button">Book now</Link>
          <Link href="/aftercare" className="studio-button-secondary">Aftercare guide</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
