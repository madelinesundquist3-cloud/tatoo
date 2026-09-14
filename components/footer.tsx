import Link from "next/link";
export function Footer() {
  return <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row">
      <div><Link href="/" className="text-sm font-bold tracking-[0.2em]">MARKED STUDIO</Link><p className="mt-3 text-sm text-zinc-400">New ink. A fresh start. Your next chapter.</p><p className="mt-2 text-xs text-zinc-500">Los Angeles is our initial service area.</p></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap content-start gap-x-6 gap-y-4 text-sm text-zinc-300"><Link href="/#services">Services</Link><Link href="/services/tattoo-removal">Tattoo removal</Link><Link href="/book">Consultations</Link><Link href="/privacy">Privacy</Link></nav>
    </div><div className="mx-auto mt-8 max-w-7xl text-xs text-zinc-500">© {new Date().getFullYear()} Marked Studio</div>
  </footer>;
}
