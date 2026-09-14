"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, Users, Palette, ArrowUpRight } from "lucide-react";
import { DISCOVER_ITEMS } from "@/lib/sample-tattoos";

export function DiscoverSection() {
  const router = useRouter();

  const iconMap: Record<string, React.ReactNode> = {
    Compass: <Compass className="w-5 h-5 text-white" />,
    Sparkles: <Sparkles className="w-5 h-5 text-white" />,
    Users: <Users className="w-5 h-5 text-white" />,
    Palette: <Palette className="w-5 h-5 text-white" />,
  };

  const handleCardClick = (id: string) => {
    if (id === "disc-1") {
      router.push("/tattoos");
    } else if (id === "disc-4") {
      router.push("/book");
    } else if (id === "disc-2" || id === "disc-3") {
      const el = document.getElementById("community");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/#community");
      }
    }
  };

  return (
    <section id="discover" className="py-16 md:py-24 border-t border-white/[0.06] bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-semibold tracking-[0.2em] text-zinc-400 mb-2">
            Explore The Platform
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            What are you looking for?
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Whether you are curating your next piece, sharing conceptual drafts,
            or looking for like-minded creators.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISCOVER_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="group cursor-pointer relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 overflow-hidden"
            >
              {/* Background ambient image layer with heavy overlay for editorial look */}
              <div className="absolute inset-0 -z-10 overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div>
                {/* Header Icon + Arrow */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    <span className="group-hover:[&_svg]:text-black transition-colors">
                      {iconMap[item.iconName] || <Compass className="w-5 h-5 text-white" />}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  {item.tagline}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-zinc-100 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center text-xs font-semibold text-zinc-300 group-hover:text-white">
                <span>Explore category</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
