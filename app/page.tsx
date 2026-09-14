import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { ClientVideoTestimonials } from "@/components/client-video-testimonials";
import { SERVICES } from "@/lib/services";

const work = [
  {
    image: "/tattoos/ornamental-lotus-spine.jpg",
    title: "Ethereal Ornamental Lotus Spine",
    style: "Fine Line · 18.9k saves",
    href: "/tattoos/tat-top-spine",
  },
  {
    image: "/tattoos/japanese-dragon-irezumi.jpg",
    title: "Celestial Ryu Water Dragon Sleeve",
    style: "Japanese Irezumi · 16.3k likes",
    href: "/tattoos/tat-top-dragon",
  },
  {
    image: "/tattoos/medusa-sculpture-realism.jpg",
    title: "Classical Medusa Sculpture",
    style: "Black & Grey Realism · 14.8k likes",
    href: "/tattoos/tat-top-medusa",
  },
  {
    image: "/tattoos/cybersigilism-neo-tribal.jpg",
    title: "Fluid Chrome Cyber-Wing Linework",
    style: "Cybersigilism · 15.6k likes",
    href: "/tattoos/tat-top-cyber",
  },
  {
    image: "/tattoos/geometric-sacred-mandala.jpg",
    title: "Sacred Geometry Mandala & Stippling",
    style: "Geometric · 13.9k likes",
    href: "/tattoos/tat-top-mandala",
  },
  {
    image: "/tattoos/neotraditional-panther-peony.jpg",
    title: "Velvet Panther & Crimson Peony",
    style: "Neo-Traditional · 12.4k likes",
    href: "/tattoos/tat-top-panther",
  },
];
export default function HomePage() {
  return <><Navbar /><main id="main-content"><Hero />
    <section id="services" className="studio-section">
      <p className="studio-eyebrow">One place to start</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><h2 className="studio-heading">What’s your next chapter?</h2><p className="max-w-sm text-sm leading-relaxed text-zinc-400">Choose what feels right. We’ll start with your questions, preferences, and goals.</p></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SERVICES.map((service) => <article key={service.id} className={`flex flex-col rounded-2xl border p-6 ${service.id === "removal" ? "border-[#d3b995]/40 bg-[#d3b995]/[0.08]" : "border-white/10 bg-white/[0.025]"}`}><span className="text-xs text-[#d3b995]">{service.number} /</span><h3 className="mb-3 mt-8 text-xl font-medium">{service.name}</h3><p className="flex-1 text-sm leading-relaxed text-zinc-400">{service.description}</p><Link className="mt-7 flex min-h-11 items-center justify-between gap-2 border-t border-white/10 pt-4 text-sm" href={service.id === "removal" ? "/services/tattoo-removal" : `/book?service=${service.id}`}>{service.id === "removal" ? "Explore removal" : "Start a consultation"}<ArrowUpRight size={17} /></Link></article>)}</div>
    </section>
    <section id="work" className="studio-section border-t border-white/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="studio-eyebrow">Trending & Most-Liked Studio Works</p>
          <h2 className="studio-heading mt-3">Find your starting point.</h2>
        </div>
        <Link href="/tattoos" className="inline-flex items-center gap-2 text-sm text-[#d3b995] hover:underline">
          Explore all trending designs <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {work.map((item) => (
          <Link key={item.image} href={item.href} className="group block">
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition-all duration-300 hover:border-[#d3b995]/50 hover:bg-white/[0.04]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900">
                <Image
                  src={item.image}
                  alt={item.style + " tattoo inspiration"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white border border-white/15">
                  View Piece →
                </span>
              </div>
              <figcaption className="mt-3 px-1">
                <p className="text-xs font-mono text-[#d3b995]">{item.style}</p>
                <h3 className="mt-1 text-base font-medium text-zinc-100 group-hover:text-[#d3b995] transition-colors">{item.title}</h3>
              </figcaption>
            </figure>
          </Link>
        ))}
      </div>
    </section>
    <ClientVideoTestimonials />
    <section id="about" className="studio-section border-t border-white/10"><div className="grid gap-10 md:grid-cols-2"><div><p className="studio-eyebrow">Less guesswork. More clarity.</p><h2 className="studio-heading mt-3">Your idea.<br />A thoughtful next step.</h2><p className="mt-5 max-w-md leading-relaxed text-zinc-400">Marked Studio brings tattoo and removal inquiries into one simple starting point. We’re focusing on Los Angeles, with consultations to clarify your options before you commit.</p></div><ol className="space-y-7">{[{ title: "Tell us what you have in mind", text: "Choose a service. You don’t need a finished design or an account." }, { title: "Suggest a time that works", text: "Pick a preferred date and time of day in Pacific Time. This is a request, not a reserved slot." }, { title: "Confirm the details together", text: "Provider, location, suitability, and any quote in USD must be agreed before an appointment." }].map((step, index) => <li key={step.title} className="flex gap-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d3b995]/30 text-sm text-[#d3b995]">{index + 1}</span><div><h3 className="text-lg">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p></div></li>)}</ol></div></section>
    <section className="studio-section pt-0"><div className="rounded-3xl bg-[#d3b995] px-6 py-12 text-center text-[#171612] sm:px-12"><p className="text-xs uppercase tracking-[0.2em]">Start where you are</p><h2 className="studio-heading mt-3">An idea. A question. A fresh start.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed">You don’t need to have it all figured out. Choose a service and take the first step.</p><Link href="/book" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#171612] px-7 py-4 text-sm font-medium text-white">Book a consultation <ArrowUpRight size={17} /></Link></div></section>
  </main><Footer /></>;
}
