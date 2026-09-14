"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  ChevronRight,
  Sparkles,
  Check,
  UserPlus,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  Maximize2,
  X,
  Calendar,
} from "lucide-react";
import { Tattoo } from "@/lib/sample-tattoos";
import { TattooCard } from "@/components/tattoo-card";
import { BookingModal } from "@/components/booking-modal";

interface TattooDetailViewProps {
  tattoo: Tattoo;
  relatedTattoos: Tattoo[];
}

export function TattooDetailView({
  tattoo,
  relatedTattoos,
}: TattooDetailViewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tattoo.likesCount);
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(tattoo.savesCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [ideaRequested, setIdeaRequested] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      setIsSaved(false);
      setSavesCount((prev) => prev - 1);
    } else {
      setIsSaved(true);
      setSavesCount((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/tattoos" className="hover:text-zinc-300 transition-colors">
          Tattoos
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link
          href={`/tattoos?style=${encodeURIComponent(tattoo.style)}`}
          className="hover:text-zinc-300 transition-colors"
        >
          {tattoo.style}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-zinc-300 font-medium truncate max-w-[200px]">
          {tattoo.title}
        </span>
      </nav>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Big Image Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.1] shadow-2xl group">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full">
              <Image
                src={tattoo.imageUrl}
                alt={tattoo.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>

            {/* Lightbox Trigger Button */}
            <button
              onClick={() => setLightboxOpen(true)}
              aria-label="View Fullscreen"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Placement & Style Badges on Image */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs uppercase font-semibold tracking-wider text-white border border-white/10">
                {tattoo.style}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/65 backdrop-blur-md text-xs text-zinc-300 border border-white/10">
                <MapPin className="w-3 h-3 text-zinc-400" />
                {tattoo.placement}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-5 flex flex-col space-y-8">
          {/* Header & Title */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-semibold tracking-[0.2em] text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              Tattoo Showcase
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              {tattoo.title}
            </h1>
          </div>

          {/* Creator Profile Box */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-zinc-800 shrink-0">
                <Image
                  src={tattoo.author.avatarUrl}
                  alt={tattoo.author.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate">
                    {tattoo.author.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  @{tattoo.author.username}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                isFollowing
                  ? "bg-zinc-800 text-zinc-300 border-white/10"
                  : "bg-white text-black border-transparent hover:bg-zinc-200"
              }`}
            >
              {isFollowing ? (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Following
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Follow
                </span>
              )}
            </button>
          </div>

          {/* Pricing & Deposit Indicator Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Estimated Full Service Price</span>
              <span className="font-mono font-bold text-white">
                {tattoo.placement.toLowerCase().includes("back") || tattoo.placement.toLowerCase().includes("sleeve")
                  ? "$600 – $1,200 USD"
                  : "$280 – $450 USD"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Required Deposit Today</span>
              <span className="font-mono font-bold text-[#d3b995]">$50.00 USD (or $0.50 test hold)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.06] text-zinc-400">
              <span>Studio Balance Due at Session</span>
              <span className="font-mono text-emerald-400">Full Price minus Deposit</span>
            </div>
          </div>

          {/* Primary Book CTA */}
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-white/10 active:scale-98 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book This Tattoo / Reserve Session</span>
          </button>

          {/* Action Bar (Like, Save, Share) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all ${
                isLiked
                  ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                  : "bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 border-white/[0.08]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`}
              />
              <span>{likesCount.toLocaleString()}</span>
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all ${
                isSaved
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 border-white/[0.08]"
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-black text-black" : ""}`}
              />
              <span>{savesCount.toLocaleString()}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 border border-white/[0.08] flex items-center justify-center gap-2 text-xs font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Story & Description */}
          {tattoo.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Inspiration & Concept
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {tattoo.description}
              </p>
            </div>
          )}

          {/* Specifications Table */}
          <div className="rounded-xl bg-zinc-950/60 border border-white/[0.08] divide-y divide-white/[0.06] text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-500">Style Category</span>
              <span className="text-zinc-200 font-medium">{tattoo.style}</span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-500">Placement</span>
              <span className="text-zinc-200 font-medium">
                {tattoo.placement}
              </span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-500">Community Role</span>
              <span className="text-zinc-200 font-medium">User Creator</span>
            </div>
          </div>

          {/* Tags */}
          {tattoo.tags && tattoo.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Keywords & Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tattoo.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tattoos?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-white/[0.06] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Request Similar Work / Idea Prompt */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.1] space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <MessageSquare className="w-4 h-4 text-zinc-300" />
              <span>Inspired by this piece?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect with @{tattoo.author.username} or share your spin on this
              concept with the Marked Studio community.
            </p>
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Discuss Concept or Request Similar Work
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close Lightbox"
            className="absolute top-6 right-6 p-3 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] aspect-[3/4] sm:aspect-auto sm:w-[700px] sm:h-[800px] rounded-2xl overflow-hidden">
            <Image
              src={tattoo.imageUrl}
              alt={tattoo.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Bottom Section: Related Tattoos ("More Like This") */}
      <section className="mt-24 pt-16 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-[0.2em] text-zinc-400 mb-1">
              Curated Recommendations
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              More Like This
            </h2>
          </div>
          <Link
            href="/tattoos"
            className="text-xs font-semibold text-zinc-300 hover:text-white underline underline-offset-4"
          >
            View All Tattoos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {relatedTattoos.map((rel) => (
            <TattooCard key={rel.id} tattoo={rel} />
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialTattoo={tattoo}
      />
    </div>
  );
}
