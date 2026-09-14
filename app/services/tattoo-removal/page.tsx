import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ScanLine } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Tattoo Removal Consultations | Marked Studio", description: "Explore tattoo removal and fading consultations for our initial Los Angeles service area. Understand the process before requesting an appointment." };
const questions = [
  { question: "Can my tattoo be completely removed?", answer: "Complete removal is not guaranteed. Ink colors, tattoo depth, your skin, and other factors affect the outcome. A qualified provider should assess your tattoo and explain realistic expectations." },
  { question: "How many sessions will I need?", answer: "Laser removal usually requires multiple treatments with healing time between them. Your provider will discuss a treatment plan after assessing your tattoo; an online form cannot determine the number of sessions." },
  { question: "What will it cost?", answer: "Pricing depends on the tattoo and treatment plan. Ask for a written quote in USD, including whether it is per session or for a package. No payment is collected when you submit a consultation request here." },
  { question: "Can I fade a tattoo for a cover-up?", answer: "You can ask about fading instead of full removal. Discuss your intended new design with both the removal provider and tattoo artist before making a plan." },
  { question: "What about discomfort and aftercare?", answer: "Treatment can be uncomfortable, and risks include scarring and changes in skin color. Ask your provider about these risks, pain management, and personalized aftercare before treatment." },
];
export default function RemovalPage() {
  return <><Navbar /><main id="main-content">
    <section className="studio-section grid gap-10 pt-32 md:pt-40 lg:grid-cols-[1.5fr_1fr]">
      <div><p className="studio-eyebrow">Tattoo removal · Los Angeles inquiries</p><h1 className="mt-5 text-5xl font-medium leading-tight tracking-tight sm:text-6xl">A fresh start begins<br /><span className="text-[#d3b995]">with a conversation.</span></h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">Whether you’re exploring removal or making room for a cover-up, start by understanding your options.</p><Link href="/book?service=removal" className="studio-button mt-8">Request a removal consultation <ArrowUpRight size={18} /></Link><p className="mt-4 text-sm text-zinc-400">No account or payment needed to send a request.</p></div>
      <aside className="rounded-3xl border border-[#d3b995]/30 bg-[#d3b995]/[0.06] p-8"><ScanLine size={40} className="text-[#d3b995]" /><h2 className="mt-7 text-2xl">Your tattoo. Your options.</h2><p className="mt-4 leading-relaxed text-zinc-400">A consultation should cover your goals, treatment suitability, likely results, and costs. Provider and location details must be confirmed before an appointment.</p><ul className="mt-6 space-y-3 text-sm text-zinc-300"><li>01 / Discuss removal or fading</li><li>02 / Review the treatment approach and risks</li><li>03 / Agree on a plan before committing</li></ul></aside>
    </section>
    <section className="studio-section border-t border-white/10"><div className="grid gap-10 md:grid-cols-[1fr_1.5fr]"><div><p className="studio-eyebrow">Before you book</p><h2 className="studio-heading mt-3">A little clarity<br />goes a long way.</h2><p className="mt-5 text-sm leading-relaxed text-zinc-400">General information, not a personal treatment assessment. Read the <a href="https://www.fda.gov/consumers/consumer-updates/tattoo-removal-options-and-results" className="text-[#d3b995] underline underline-offset-4">FDA’s tattoo removal guidance</a> and discuss your questions with your provider.</p></div><div>{questions.map((item) => <details key={item.question} className="border-b border-white/10 py-5"><summary className="cursor-pointer text-base font-medium marker:text-[#d3b995]">{item.question}</summary><p className="mt-4 text-sm leading-relaxed text-zinc-400">{item.answer}</p></details>)}</div></div></section>
  </main><Footer /></>;
}
