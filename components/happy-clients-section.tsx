"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  Calendar,
  Layers,
  Heart,
  Quote,
} from "lucide-react";

export interface HappyClient {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  date: string;
  title: string;
  category: "coverup" | "fineline" | "color" | "blackwork";
  categoryLabel: string;
  placement: string;
  review: string;
  image: string;
  isCoverUp?: boolean;
  coverUpNote?: string;
  highlightDetails: string[];
}

export const HAPPY_CLIENTS: HappyClient[] = [
  {
    id: "client-1",
    name: "Celine K.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "Verified Client",
    rating: 5,
    date: "Completed Recently",
    title: "Dark Fantasy Dagger with Ethereal Smoke & Custom Script",
    category: "blackwork",
    categoryLabel: "Black & Grey / Script",
    placement: "Forearm",
    review:
      "The precision on the dagger hilt and the dark smoke mist contouring my forearm is phenomenal. Clean lines, zero blowouts, and healed with rich, dark depth.",
    image: "/clients/client-sword-celine.jpg",
    highlightDetails: [
      "Custom blade geometry with dark flame aura",
      "Seamless anatomical forearm contouring",
      "Dynamic script lettering integrated into the steel blade",
    ],
  },
  {
    id: "client-2",
    name: "Jordan M.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Verified Client",
    rating: 5,
    date: "Completed Recently",
    title: "Bold Traditional 'Lover Boy' Rose & Heart Banner",
    category: "color",
    categoryLabel: "American Traditional",
    placement: "Arm / Bicep",
    review:
      "Old-school American Traditional done to absolute perfection. The color saturation on the golden amber rose and blood-red heart is so vivid, and the bold black outlines will hold forever.",
    image: "/clients/client-lover-boy-rose.jpg",
    highlightDetails: [
      "Vibrant high-pigment gradient saturation",
      "Classic American Traditional needle grouping",
      "Crisp scroll banner typography",
    ],
  },
  {
    id: "client-3",
    name: "Marcus V.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Verified Client",
    rating: 5,
    date: "Completed Recently",
    title: "Humpback Ocean Whale Chest Cover-Up with Ink Splash",
    category: "coverup",
    categoryLabel: "Transformation & Realism",
    placement: "Left Chest & Pectoral",
    review:
      "I had an old, stubborn dark mark on my shoulder that other artists said couldn't be hidden without laser. He mapped this soaring whale right across the splash flow. 100% invisible now!",
    image: "/clients/client-whale-chest.jpg",
    isCoverUp: true,
    coverUpNote: "Flawlessly concealed stubborn legacy shoulder ink into an ink-splash marine composition.",
    highlightDetails: [
      "100% full opacity concealment of legacy tattoo",
      "Fluid water & ink splash negative space balancing",
      "Textured baleen and fin depth with skin break highlights",
    ],
  },
  {
    id: "client-4",
    name: "Elena R.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Verified Client",
    rating: 5,
    date: "Completed Recently",
    title: "Botanical Fine-Line Wildflower Blossom Vine",
    category: "fineline",
    categoryLabel: "Micro Fine Line",
    placement: "Forearm to Wrist",
    review:
      "The hand control is unmatched. Look at the petal stippling and delicate leaf stem curving all the way down to my wrist. It feels like fine botanical botanical watercolor turned into skin art.",
    image: "/clients/client-botanical-fine-line.jpg",
    highlightDetails: [
      "Ultra-fine single-needle floral anatomy",
      "Soft pepper-shading gradient on petals",
      "Contoured organic drape around the wrist tendon",
    ],
  },
  {
    id: "client-5",
    name: "Kaylie & Donna S.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "Verified Client",
    rating: 5,
    date: "Completed Recently",
    title: "Texas Turquoise Medallion & Wild Rose Memorial Cover-Up",
    category: "coverup",
    categoryLabel: "Master Cover-Up",
    placement: "Upper Arm / Shoulder Cap",
    review:
      "My 2007 script tattoo had faded and blurred over 17 years. This transformation honored the original meaning while creating an incredible turquoise gemstone, Texas cattle tag, and floral filigree.",
    image: "/clients/client-turquoise-coverup.jpg",
    isCoverUp: true,
    coverUpNote: "Before: Faded 2007 blue script • After: Stunning hyper-detailed turquoise medallion and floral sleeve.",
    highlightDetails: [
      "Full transformation of faded blue legacy lettering",
      "Luminous turquoise stone marbling effect",
      "Hand-carved acanthus scrollwork and personalized tags",
    ],
  },
];

export function HappyClientsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeClient, setActiveClient] = useState<HappyClient | null>(null);

  const filteredClients = HAPPY_CLIENTS.filter((client) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "coverup") return client.isCoverUp;
    return client.category === selectedCategory;
  });

  return (
    <section id="clients" className="py-24 sm:py-32 bg-zinc-950/80 relative overflow-hidden border-t border-b border-white/[0.06]">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/3 left-10 w-96 h-96 bg-zinc-800/15 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-800/15 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Work • Happy Clients</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Real Tattoos on Real People.
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-zinc-400 leading-relaxed">
              Simple, clear, and authentic. Browse actual healed and fresh client pieces—including incredible cover-up transformations and fine-line works.
            </p>
          </div>

          {/* Social Proof Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] backdrop-blur-md shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="text-sm font-bold text-white leading-tight">5.0 Star Feedback</div>
              <div className="text-xs text-zinc-400">Verified Client Results</div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar mb-10">
          {[
            { id: "all", label: "All Client Work", count: HAPPY_CLIENTS.length },
            { id: "coverup", label: "Cover-Ups & Transformations", count: HAPPY_CLIENTS.filter((c) => c.isCoverUp).length },
            { id: "blackwork", label: "Black & Grey / Script", count: HAPPY_CLIENTS.filter((c) => c.category === "blackwork").length },
            { id: "color", label: "Color Traditional", count: HAPPY_CLIENTS.filter((c) => c.category === "color").length },
            { id: "fineline", label: "Fine Line Floral", count: HAPPY_CLIENTS.filter((c) => c.category === "fineline").length },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-white text-black shadow-lg shadow-white/10 font-bold scale-[1.02]"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-white/[0.06]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-black/15 text-black font-extrabold" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Client Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="group flex flex-col rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.07] hover:border-white/[0.18] transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-black/60"
            >
              {/* Image Container with Cover-Up Pill & Click for Details */}
              <div
                onClick={() => setActiveClient(client)}
                className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950 cursor-pointer"
              >
                <Image
                  src={client.image}
                  alt={client.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/75 backdrop-blur-md text-white border border-white/15">
                    {client.categoryLabel}
                  </span>

                  {client.isCoverUp && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                      <Layers className="w-3 h-3 text-amber-400" />
                      Cover-Up
                    </span>
                  )}
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Client Story & Photo</span>
                  </div>
                </div>

                {/* Bottom title on photo */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    {client.placement}
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug drop-shadow-md">
                    {client.title}
                  </h3>
                </div>
              </div>

              {/* Client Content & Review Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Quote block */}
                <div className="relative">
                  <Quote className="w-6 h-6 text-zinc-700/60 mb-2 -rotate-6" />
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    &ldquo;{client.review}&rdquo;
                  </p>
                </div>

                {/* Key transformation points */}
                {client.coverUpNote && (
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-normal flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{client.coverUpNote}</span>
                  </div>
                )}

                {/* Client Profile Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-zinc-800">
                      <Image
                        src={client.avatar}
                        alt={client.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1">
                        <span>{client.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium">
                        {client.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveClient(client)}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Booking Callout */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border border-white/[0.1] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Accepting Custom Inquiries & Consultations
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to create your own healed masterpiece?
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              From delicate single-needle florals to intricate cover-ups and bold traditional, we turn your ideas into clean, timeless ink.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 active:scale-95"
            >
              <span>Book a Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tattoos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm border border-white/10 transition-all active:scale-95"
            >
              <span>Browse All Designs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-Resolution Client Detail Lightbox / Modal */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setActiveClient(null)}
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-3xl border border-white/15 shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setActiveClient(null)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left/Top: Image */}
            <div className="relative w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:min-h-[460px] bg-black">
              <Image
                src={activeClient.image}
                alt={activeClient.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
                  {activeClient.placement}
                </span>
              </div>
            </div>

            {/* Right/Bottom: Full Details */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-zinc-300">
                    {activeClient.categoryLabel}
                  </span>
                  {activeClient.isCoverUp && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cover-Up Transformation
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {activeClient.title}
                </h3>

                <div className="flex items-center gap-2 mt-3 text-amber-400">
                  {[...Array(activeClient.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-zinc-300 ml-1">5.0 Verified Review</span>
                </div>

                {/* Review */}
                <div className="mt-4 p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08]">
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    &ldquo;{activeClient.review}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <span className="font-semibold text-white">{activeClient.name}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Client
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Artistic Highlights
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {activeClient.highlightDetails.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <Link
                  href="/book"
                  onClick={() => setActiveClient(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Similar Tattoo</span>
                </Link>
                <button
                  onClick={() => setActiveClient(null)}
                  className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
