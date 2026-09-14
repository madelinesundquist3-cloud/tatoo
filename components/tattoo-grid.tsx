"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tattoo } from "@/lib/sample-tattoos";
import { TattooCard } from "@/components/tattoo-card";
import { X, Heart, Bookmark, MapPin, Share2, Sparkles } from "lucide-react";

interface TattooGridProps {
  tattoos: Tattoo[];
  title?: string;
  subtitle?: string;
}

export function TattooGrid({
  tattoos,
  title = "Trending Tattoos",
  subtitle = "Discover the most saved and inspiring pieces created across our global community.",
}: TattooGridProps) {
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = (tattoo: Tattoo) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        window.location.origin + "#tattoo-" + tattoo.id
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="trending-tattoos" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-semibold tracking-[0.2em] text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              Curated Community Feed
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            Showing <span className="text-zinc-300 font-semibold">{tattoos.length}</span> curated works
          </div>
        </div>

        {/* Empty state */}
        {tattoos.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-2xl border border-white/[0.08] bg-zinc-950/40">
            <p className="text-lg text-zinc-300 font-medium">
              No tattoos found matching your criteria.
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Try selecting another style category or clearing the search bar.
            </p>
          </div>
        ) : (
          /* Masonry/Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {tattoos.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                onSelect={(t) => setSelectedTattoo(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modal for detailed preview */}
      {selectedTattoo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedTattoo(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 rounded-2xl border border-white/[0.15] shadow-2xl p-4 sm:p-6 text-white grid grid-cols-1 md:grid-cols-12 gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedTattoo(null)}
              aria-label="Close details modal"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left preview image */}
            <div className="md:col-span-7 relative aspect-[3/4] sm:aspect-auto sm:min-h-[420px] rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08]">
              <Image
                src={selectedTattoo.imageUrl}
                alt={selectedTattoo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right metadata & story */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Style and placement */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 text-xs uppercase font-semibold tracking-wider bg-white/10 rounded-full border border-white/10">
                    {selectedTattoo.style}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-zinc-900 rounded-full border border-white/10 text-zinc-300">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {selectedTattoo.placement}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  {selectedTattoo.title}
                </h3>

                {selectedTattoo.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {selectedTattoo.description}
                  </p>
                )}

                {/* Author card */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/15">
                      <Image
                        src={selectedTattoo.author.avatarUrl}
                        alt={selectedTattoo.author.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {selectedTattoo.author.name}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        @{selectedTattoo.author.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium px-2 py-1 bg-white/[0.05] rounded border border-white/10">
                    User
                  </span>
                </div>

                {/* Tags */}
                {selectedTattoo.tags && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTattoo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 text-xs text-zinc-300 bg-zinc-900 rounded-md border border-white/[0.06]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons inside modal */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShare(selectedTattoo)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-200 border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? "Link Copied!" : "Share Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTattoo(null)}
                  className="py-2.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
