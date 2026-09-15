import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
export function Hero() {
  return <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-32 sm:px-8 md:pb-24 md:pt-40 lg:grid-cols-2 lg:items-center lg:gap-16">
    <div>
      <p className="studio-eyebrow flex items-center gap-2"><MapPin size={14} /> Tattoo studios across the USA</p>
      <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Make it yours.<br /><span className="text-[#d3b995]">Or make a<br className="hidden lg:block" /> fresh start.</span></h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-300">Your first tattoo, a new design, or a change of direction. Explore tattoos, cover-ups, touch-ups, and removal consultations.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/book" className="studio-button">Book now <ArrowUpRight size={18} /></Link><Link href="/locations" className="studio-button-secondary">Find a studio</Link></div>
      <p className="mt-5 text-sm text-zinc-400">Book in under 2 minutes.</p>
    </div>
    <div className="relative">
      <div className="relative aspect-[4/5] max-h-[600px] overflow-hidden rounded-[2rem] bg-zinc-900"><Image src="/clients/client-botanical-fine-line.jpg" alt="Fine-line botanical tattoo with flowers and leaves along an arm" fill priority loading="eager" sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" /><div className="absolute bottom-24 left-7 right-7"><p className="text-xs uppercase tracking-[0.2em] text-white/80">The inspiration edit</p><p className="mt-2 text-2xl font-medium text-white">Small details. Personal meaning.</p></div></div>
      <Link href="/services/tattoo-removal" className="absolute -bottom-6 right-4 flex max-w-[85%] items-center gap-5 rounded-2xl border border-white/10 bg-[#20201e] p-5 shadow-xl sm:right-7"><span><span className="block text-xs text-[#d3b995]">THINKING ABOUT REMOVAL?</span><span className="mt-1 block text-sm">Understand your options</span></span><ArrowUpRight size={22} /></Link>
    </div>
  </section>;
}
