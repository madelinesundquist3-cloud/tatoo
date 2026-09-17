import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/locations";
import { SAMPLE_TATTOOS } from "@/lib/sample-tattoos";

// Real pieces from the studio (photos in public/clients).
const work = SAMPLE_TATTOOS.filter((tattoo) => tattoo.id.startsWith("client-tat-")).map((tattoo) => ({
  image: tattoo.imageUrl,
  title: tattoo.title,
  style: `${tattoo.style} · ${tattoo.placement}`,
  href: `/tattoos/${tattoo.id}`,
}));
export default function HomePage() {
  return <><Navbar /><main id="main-content"><Hero />
    <section id="services" className="studio-section">
      <p className="studio-eyebrow">One place to start</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><h2 className="studio-heading">What’s your next chapter?</h2><p className="max-w-sm text-sm leading-relaxed text-zinc-400">Choose what feels right. We’ll start with your questions, preferences, and goals.</p></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map((service) => (
        <article
          key={service.id}
          className={`flex flex-col rounded-2xl border p-6 ${
            service.id === "couples"
              ? "border-[#d3b995]/40 bg-[#d3b995]/[0.05]"
              : service.id === "removal"
              ? "border-[#d3b995]/40 bg-[#d3b995]/[0.08]"
              : "border-white/10 bg-white/[0.025]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#d3b995]">{service.number} /</span>
            {service.id === "couples" && (
              <span className="rounded-full bg-[#d3b995]/20 border border-[#d3b995]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#d3b995]">
                Save 25–35% / person
              </span>
            )}
          </div>
          <h3 className="mb-3 mt-7 text-xl font-medium">{service.name}</h3>
          <p className="flex-1 text-sm leading-relaxed text-zinc-400">{service.description}</p>
          <Link
            className="mt-7 flex min-h-11 items-center justify-between gap-2 border-t border-white/10 pt-4 text-sm hover:text-[#d3b995] transition-colors"
            href={service.id === "removal" ? "/services/tattoo-removal" : `/book?service=${service.id}`}
          >
            {service.id === "removal" ? "Explore removal" : service.id === "couples" ? "Book couples package" : "Book now"}
            <ArrowUpRight size={17} />
          </Link>
        </article>
      ))}</div>
    </section>
    <section id="work" className="studio-section border-t border-white/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="studio-eyebrow">Our work</p>
          <h2 className="studio-heading mt-3">Real tattoos from our studio.</h2>
        </div>
        <Link href="/tattoos" className="inline-flex items-center gap-2 text-sm text-[#d3b995] hover:underline">
          Browse the gallery <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {work.map((item) => (
          <Link key={item.image} href={item.href} className="group block">
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition-all duration-300 hover:border-[#d3b995]/50 hover:bg-white/[0.04]">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-900">
                <Image
                  src={item.image}
                  alt={item.title}
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
    <section id="about" className="studio-section border-t border-white/10"><div className="grid gap-10 md:grid-cols-2"><div><p className="studio-eyebrow">Less guesswork. More clarity.</p><h2 className="studio-heading mt-3">Your idea.<br />A thoughtful next step.</h2><p className="mt-5 max-w-md leading-relaxed text-zinc-400">Marked Studio brings tattoo and removal inquiries into one simple starting point. With studios in cities across the USA, you can hold your appointment with a secure deposit credited in full toward your piece.</p></div><ol className="space-y-7">{[{ title: "Tell us what you have in mind", text: "Choose your nearest studio and a service. You don’t need a finished design." }, { title: "Suggest a time that works", text: "Pick a preferred date and time in your studio’s local time, then hold your spot with a secure deposit." }, { title: "Confirm the details together", text: "Your artist confirms the design, final quote, and exact appointment time with you." }].map((step, index) => <li key={step.title} className="flex gap-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d3b995]/30 text-sm text-[#d3b995]">{index + 1}</span><div><h3 className="text-lg">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p></div></li>)}</ol></div></section>
    <section id="locations" className="studio-section border-t border-white/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="studio-eyebrow">Studios across the USA</p>
          <h2 className="studio-heading mt-3">Find a studio near you.</h2>
        </div>
        <Link href="/locations" className="inline-flex items-center gap-2 text-sm text-[#d3b995] hover:underline">
          All locations <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LOCATIONS.map((studio) => (
          <Link
            key={studio.id}
            href={`/book?location=${studio.id}`}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-[#d3b995]/50"
          >
            <span className="text-xs text-[#d3b995]">{studio.stateCode} · {studio.timeZoneLabel}</span>
            <span className="mt-6 text-xl font-medium">{studio.city}</span>
            <span className="mt-1 text-sm text-zinc-400">{studio.state}</span>
            <span className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm group-hover:text-[#d3b995]">
              Book here <ArrowUpRight size={17} />
            </span>
          </Link>
        ))}
      </div>
    </section>
    <section className="studio-section pt-0"><div className="rounded-3xl bg-[#d3b995] px-6 py-12 text-center text-[#171612] sm:px-12"><p className="text-xs uppercase tracking-[0.2em]">Start where you are</p><h2 className="studio-heading mt-3">An idea. A question. A fresh start.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed">You don’t need to have it all figured out. Choose a service and take the first step.</p><Link href="/book" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#171612] px-7 py-4 text-sm font-medium text-white">Book now <ArrowUpRight size={17} /></Link></div></section>
  </main><Footer /></>;
}
