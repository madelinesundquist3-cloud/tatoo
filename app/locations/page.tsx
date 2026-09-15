import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LOCATIONS, locationName } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Studio Locations | Marked Studio",
  description: `Marked Studio tattoo studios in ${LOCATIONS.map(locationName).join(", ")}. Choose your nearest studio and book online with a secure deposit.`,
};

export default function LocationsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="studio-section pt-32 md:pt-36">
        <p className="studio-eyebrow">Studios across the USA</p>
        <h1 className="studio-heading mt-4">Find a studio near you</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
          Every Marked Studio location offers custom and flash tattoos, cover-ups, touch-ups, and removal consultations.
          Book online in your studio’s local time; the studio then contacts you with your artist, address, and exact appointment time.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {LOCATIONS.map((studio) => (
            <article key={studio.id} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#d3b995]">
                <MapPin size={14} aria-hidden="true" /> {studio.state}
              </p>
              <h2 className="mt-5 text-3xl font-medium">{studio.city}</h2>
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-zinc-400">Time zone</dt><dd>{studio.timeZoneLabel}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-400">Age requirement</dt><dd>18+ with photo ID</dd></div>
              </dl>
              <Link href={`/book?location=${studio.id}`} className="studio-button mt-8 self-start">
                Book in {studio.city} <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
