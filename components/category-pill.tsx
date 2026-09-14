"use client";

import React from "react";

interface CategoryPillProps {
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CategoryPill({
  name,
  isSelected = false,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 ${
        isSelected
          ? "bg-white text-black font-semibold shadow-md shadow-white/10"
          : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.18]"
      }`}
    >
      {name}
    </button>
  );
}
