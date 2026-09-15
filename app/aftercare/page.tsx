import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Tattoo Aftercare Guide | Marked Studio",
  description: "Step-by-step tattoo aftercare: bandage removal, washing, moisturizing, what to avoid while healing, and when to see a doctor.",
};

const steps = [
  {
    title: "First few hours",
    body: "Leave the wrap on for as long as your artist told you: usually 2–4 hours for plastic wrap, or several days for an adhesive second-skin bandage. Remove it with clean hands.",
  },
  {
    title: "Wash gently",
    body: "Wash with lukewarm water and a mild, fragrance-free soap using your fingertips. Don’t use a washcloth or loofah. Pat dry with a clean paper towel and let it air dry for a few minutes.",
  },
  {
    title: "Moisturize lightly",
    body: "Apply a thin layer of fragrance-free lotion or the aftercare product your artist recommends, 2–3 times a day. Too much product can trap moisture and slow healing.",
  },
  {
    title: "Let it peel",
    body: "Flaking, mild itching, and a shiny or cloudy look are normal in the first two weeks. Don’t pick, scratch, or peel. Let the flakes fall off on their own.",
  },
];

const avoid = [
  "Soaking: pools, hot tubs, baths, lakes, and the ocean until the skin has fully healed (usually 2–4 weeks).",
  "Direct sun and tanning beds while healing. Once healed, use sunscreen to keep lines and color crisp.",
  "Tight clothing and gym equipment rubbing against the tattoo for the first week or two.",
  "Re-wrapping it in plastic, or using petroleum-heavy or scented products unless your artist recommends them.",
];

const warningSigns = [
  "Redness, heat, or swelling that spreads or gets worse after the first few days",
  "Pus, a bad smell, or red streaks spreading from the tattoo",
  "Fever or chills",
  "A rash, raised bumps, or severe itching that could be an allergic reaction to the ink",
];

export default function AftercarePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section max-w-3xl pt-32 md:pt-36">
        <p className="studio-eyebrow">Client care</p>
        <h1 className="studio-heading mt-4">Tattoo aftercare</h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Good aftercare keeps your tattoo looking its best. Always follow your artist’s specific instructions; they know the techniques and products used on your piece.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="flex items-center gap-3 text-lg text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d3b995]/15 font-mono text-xs text-[#d3b995]">{index + 1}</span>
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-12">
          <h2 className="text-xl text-white">Avoid while healing</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-300">
            {avoid.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl text-white">Healing timeline</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            The surface usually heals in 2–3 weeks. Deeper layers of skin can take a month or more to settle. If an area looks patchy once fully healed, contact us about a touch-up.
          </p>
        </section>

        <section className="mt-12 rounded-2xl border border-red-400/30 bg-red-400/[0.06] p-6">
          <h2 className="text-xl text-white">When to see a doctor</h2>
          <p className="mt-3 text-sm text-zinc-300">This guide isn’t medical advice. Contact a healthcare provider promptly if you notice:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            {warningSigns.map((sign) => <li key={sign}>{sign}</li>)}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/faq" className="studio-button-secondary">Read the FAQ</Link>
          <Link href="/book" className="studio-button">Book now</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
