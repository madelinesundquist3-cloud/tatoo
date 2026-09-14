"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface VideoTestimonial {
  id: string;
  name: string;
  username: string;
  avatar: string;
  videoThumb: string;
  service: string;
  serviceId: string;
  placement: string;
  duration: string;
  rating: number;
  highlight: string;
  fullQuote: string;
  transcript: string[];
  city: string;
}

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: "video-maya",
    name: "Maya Lin",
    username: "mayalin_la",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    videoThumb: "/clients/video-maya-recommendation.jpg",
    service: "Micro Fine Line Consultation",
    serviceId: "custom",
    placement: "Forearm & Wrist",
    duration: "0:14",
    rating: 5,
    highlight: "“Felt zero pain and healed flawlessly in 5 days!”",
    fullQuote:
      "I was honestly terrified for my first tattoo, but the Marked Studio consultation changed everything. The artist tested needle grouping on paper first and sized the botanical leaf to match my arm muscle drape. Zero blowouts, completely pain-free, and I get compliments everywhere I go!",
    transcript: [
      "Hey everyone! Just stepped out of Marked Studio in Los Angeles...",
      "Look at this fine-line botanical branch on my forearm!",
      "The lines are so razor sharp, it literally looks like watercolor on paper.",
      "The consultation was so calm, no rush. 100% recommend Marked Studio!",
    ],
    city: "Los Angeles, CA",
  },
  {
    id: "video-marcus",
    name: "Marcus Vance",
    username: "marcus_v",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    videoThumb: "/clients/video-marcus-recommendation.jpg",
    service: "Master Cover-Up Consultation",
    serviceId: "coverup",
    placement: "Chest & Shoulder",
    duration: "1:28",
    rating: 5,
    highlight: "“Other studios said only laser could fix it. Marked Studio made it disappear!”",
    fullQuote:
      "Three different shops in SoCal told me my 10-year-old black tattoo had to be lasered for $2,000 before they could touch it. I booked a consultation here with the $0.50 Stripe deposit, met the artist, and he mapped this soaring humpback whale right over the dark zones. You can't see a trace of the old ink. Total mastery.",
    transcript: [
      "Yo! If you have an old tattoo you regret, listen to this.",
      "Three studios told me this dark piece was impossible to cover.",
      "Look at my chest right now — it's a full ocean whale splash!",
      "Not a single trace of the old ink. Truly the best cover-up artists in the game.",
    ],
    city: "Venice Beach, CA",
  },
  {
    id: "video-elena",
    name: "Elena Rostova",
    username: "elena_r",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    videoThumb: "/clients/video-elena-recommendation.jpg",
    service: "Ornamental Spine Piece",
    serviceId: "custom",
    placement: "Full Spine & Lotus",
    duration: "0:24",
    rating: 5,
    highlight: "“A true museum-grade masterwork. Best studio bedside manner ever.”",
    fullQuote:
      "Spine tattoos have a reputation for being intense, but the artist took breaks whenever needed, used sterile hospital-grade prep, and created this breathtaking ornamental lotus chandelier down my entire back. Booking with Stripe online was effortless and secure.",
    transcript: [
      "Here is the healed reveal of my ornamental spine piece!",
      "From the nape of my neck all the way down to the lotus.",
      "The symmetry is absolutely pristine.",
      "If you're thinking about booking, do it. Marked Studio is next level.",
    ],
    city: "Santa Monica, CA",
  },
];

export function ClientVideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-progress transcript and bar when modal is active
  useEffect(() => {
    if (!activeVideo || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1.5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [activeVideo, isPlaying]);

  // Update caption index based on progress
  useEffect(() => {
    if (!activeVideo) return;
    const totalLines = activeVideo.transcript.length;
    const lineIndex = Math.min(
      Math.floor((progress / 100) * totalLines),
      totalLines - 1
    );
    setCurrentLineIndex(lineIndex);
  }, [progress, activeVideo]);

  const openVideo = (video: VideoTestimonial) => {
    setActiveVideo(video);
    setProgress(0);
    setIsPlaying(true);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setProgress(0);
  };

  return (
    <section id="video-reviews" className="studio-section border-t border-white/10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3b995]/30 bg-[#d3b995]/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#d3b995] mb-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Verified Video Recommendations
          </div>
          <h2 className="studio-heading">Hear from our clients.</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg">
            Watch real collectors share their consultations, painless ink sessions, and healed results at Marked Studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {VIDEO_TESTIMONIALS.map((t) => (
              <div key={t.id} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-[#09090b]">
                <Image src={t.avatar} alt={t.name} fill sizes="32px" className="rounded-full object-cover" />
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-400">
            <strong className="text-white font-semibold">100% 5-Star Feedback</strong> from verified consultations
          </div>
        </div>
      </div>

      {/* Video Story Cards Grid (9:16 Portrait Reels) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEO_TESTIMONIALS.map((v) => (
          <div
            key={v.id}
            onClick={() => openVideo(v)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 p-2 transition-all duration-300 hover:border-[#d3b995]/50 hover:shadow-2xl hover:shadow-[#d3b995]/10"
          >
            {/* 9:16 Portrait Thumbnail Frame */}
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
              <Image
                src={v.videoThumb}
                alt={`${v.name} recommending Marked Studio`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

              {/* Top Bar on Video Reel */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-white border border-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {v.duration}
                </span>

                <span className="rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                  LIVE STORY
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/40 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d3b995] group-hover:text-black">
                  <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Video Card Content */}
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/40">
                    <Image src={v.avatar} alt={v.name} fill sizes="28px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{v.name}</p>
                    <p className="text-[10px] text-zinc-400">{v.city}</p>
                  </div>
                </div>

                <p className="text-xs font-medium text-white/95 line-clamp-2 drop-shadow-md">
                  {v.highlight}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-zinc-300">
                  <span className="text-[#d3b995] font-mono">{v.service}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white group-hover:text-[#d3b995]">
                    Play Video →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Video Modal Experience */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-zinc-950 overflow-hidden shadow-2xl shadow-black animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Progress Bar */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1">
              <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Video Header Profile */}
            <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/40 shadow-md">
                  <Image src={activeVideo.avatar} alt={activeVideo.name} fill sizes="36px" className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white drop-shadow-md">{activeVideo.name}</span>
                    <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
                      Verified Client
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-300 drop-shadow-md">{activeVideo.service} · {activeVideo.city}</p>
                </div>
              </div>

              {/* Close & Sound Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeVideo}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
                  aria-label="Close story"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Frame */}
            <div
              className="relative aspect-[9/16] w-full cursor-pointer bg-black"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Image
                src={activeVideo.videoThumb}
                alt={activeVideo.name}
                fill
                priority
                sizes="384px"
                className="object-cover"
              />

              {/* Ambient gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />

              {/* Animated Equalizer Wave Bars indicating audio speech */}
              {isPlaying && !isMuted && (
                <div className="absolute top-20 right-4 z-20 flex items-end gap-1 h-6 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                  <span className="w-1 bg-[#d3b995] rounded-full h-3 animate-pulse" />
                  <span className="w-1 bg-[#d3b995] rounded-full h-5 animate-pulse delay-75" />
                  <span className="w-1 bg-[#d3b995] rounded-full h-2 animate-pulse delay-150" />
                  <span className="w-1 bg-[#d3b995] rounded-full h-4 animate-pulse delay-100" />
                  <span className="text-[10px] text-zinc-300 ml-1 font-mono">Audio On</span>
                </div>
              )}

              {/* Pause icon overlay if paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                  <div className="rounded-full bg-white/20 backdrop-blur-md p-4 text-white border border-white/30">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Dynamic Live Subtitle Captions */}
              <div className="absolute bottom-28 left-4 right-4 z-20">
                <div className="rounded-2xl bg-black/80 backdrop-blur-md p-3.5 border border-white/15 shadow-xl text-center">
                  <p className="text-xs text-zinc-400 font-mono mb-1 uppercase tracking-wider">
                    Speaking • {activeVideo.name}
                  </p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    &ldquo;{activeVideo.transcript[currentLineIndex]}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 bg-zinc-950 border-t border-white/10 space-y-2.5 z-30">
              <Link
                href={`/book?service=${activeVideo.serviceId}`}
                onClick={closeVideo}
                className="studio-button w-full text-center text-xs py-3 block font-semibold"
              >
                Book {activeVideo.service} ($0.50 Deposit) →
              </Link>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>⭐ 5.0 Star Verified Experience</span>
                <span className="text-[#d3b995]">Los Angeles Studio</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
