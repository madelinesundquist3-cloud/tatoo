"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function CommunitySection() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setJoined(true);
    }
  };

  const communityAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  ];

  return (
    <section id="community" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="p-8 sm:p-14 md:p-16 rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          {/* Subtle atmospheric glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-white/[0.04] blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Avatar stack */}
          <div className="flex items-center justify-center -space-x-2.5 mb-6">
            {communityAvatars.map((url, i) => (
              <div
                key={i}
                className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-zinc-900 bg-zinc-800"
              >
                <Image
                  src={url}
                  alt={`Community member ${i + 1}`}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="w-11 h-11 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[11px] font-bold text-white">
              +10k
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-zinc-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            Join creators & enthusiasts
          </div>

          {/* Section Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Your tattoo journey starts here.
          </h2>

          {/* Supporting text */}
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Share your idea, discover inspiration, and connect with people who
            understand tattoo culture.
          </p>

          {/* Interactive Form or confirmation */}
          <div className="mt-8 max-w-md mx-auto">
            {joined ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center gap-2.5 text-emerald-300 text-sm font-medium animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Welcome to Marked Studio! Your early invitation is reserved.</span>
              </div>
            ) : (
              <form
                onSubmit={handleJoin}
                className="flex flex-col sm:flex-row items-center gap-2.5 p-1.5 rounded-2xl bg-zinc-900 border border-white/[0.12] focus-within:border-white/30 transition-colors shadow-xl"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-md shadow-white/10 cursor-pointer"
                >
                  <span>Join Marked Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <p className="mt-3 text-xs text-zinc-500">
              Free to join • No spam • Discover daily inspiration
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
