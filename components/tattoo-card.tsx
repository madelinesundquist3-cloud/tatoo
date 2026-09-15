"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Bookmark, MapPin, ArrowUpRight } from "lucide-react";
import { Tattoo } from "@/lib/sample-tattoos";

interface TattooCardProps {
  tattoo: Tattoo;
  onSelect?: (tattoo: Tattoo) => void;
  href?: string;
}

export function TattooCard({
  tattoo,
  onSelect,
  href = `/tattoos/${tattoo.id}`,
}: TattooCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tattoo.likesCount);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleCardClick = () => {
    if (onSelect) {
      // If modal onSelect handler is provided, we can trigger it
      onSelect(tattoo);
    }
  };

  // Determine aspect ratio class for Pinterest-style masonry aesthetic
  const aspectClass =
    tattoo.aspectRatio === "tall"
      ? "aspect-[3/4]"
      : tattoo.aspectRatio === "wide"
      ? "aspect-[4/3]"
      : "aspect-square";

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900/70 border border-white/[0.08] hover:border-white/[0.25] transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
    >
      {/* Clickable Image Container linking to detail page */}
      <Link href={href} className={`relative w-full overflow-hidden block ${aspectClass}`}>
        <Image
          src={tattoo.imageUrl}
          alt={tattoo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top badges: Style & Placement */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-200 rounded-md border border-white/10">
            {tattoo.style}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-black/60 backdrop-blur-md text-zinc-300 rounded-md border border-white/10">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span>{tattoo.placement}</span>
          </span>
        </div>

        {/* Quick view hint icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        {/* Action Buttons (Like & Save) floating over the image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? "Unlike tattoo" : "Like tattoo"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold transition-all active:scale-90 ${
              isLiked
                ? "bg-rose-500/90 text-white shadow-lg shadow-rose-950"
                : "bg-black/60 hover:bg-black/80 text-zinc-200 border border-white/10 hover:border-white/20"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                isLiked ? "fill-white scale-110" : ""
              }`}
            />
            <span>{likesCount.toLocaleString()}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Unsave tattoo" : "Save tattoo"}
            className={`p-2 rounded-full backdrop-blur-md text-xs transition-all active:scale-90 ${
              isSaved
                ? "bg-white text-black shadow-lg"
                : "bg-black/60 hover:bg-black/80 text-zinc-200 border border-white/10 hover:border-white/20"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isSaved ? "fill-black text-black" : "text-zinc-200"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Card Content / User details */}
      <Link
        href={href}
        className="p-4 flex items-center justify-between gap-3 bg-zinc-950/60 border-t border-white/[0.05] hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/15 bg-zinc-800">
            <Image
              src={tattoo.author.avatarUrl}
              alt={tattoo.author.name}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
              {tattoo.title}
            </p>
            <p className="text-[11px] text-zinc-400 font-mono truncate">
              @{tattoo.author.username}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
