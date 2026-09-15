import Link from "next/link";
import { LOCATIONS } from "@/lib/locations";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Locations", href: "/locations" },
      { label: "Our work", href: "/#work" },
      { label: "Tattoo removal", href: "/services/tattoo-removal" },
      { label: "Book now", href: "/book" },
    ],
  },
  {
    title: "Client care",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Aftercare", href: "/aftercare" },
      { label: "Deposit & cancellation policy", href: "/policies" },
      { label: "My bookings", href: "/my-bookings" },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="text-sm font-bold tracking-[0.2em]">MARKED STUDIO</Link>
          <p className="mt-3 text-sm text-zinc-400">New ink. A fresh start. Your next chapter.</p>
          <p className="mt-2 text-xs text-zinc-500">Studios in {LOCATIONS.map((studio) => studio.city).join(" · ")}</p>
          <p className="mt-1 text-xs text-zinc-500">18+ only · valid photo ID required</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{column.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-zinc-500">
        © {new Date().getFullYear()} Marked Studio
      </div>
    </footer>
  );
}
