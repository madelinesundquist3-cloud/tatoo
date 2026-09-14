"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "Search tattoos, styles, people...",
  className = "",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (onChange) onChange("");
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-white transition-colors">
        <Search className="w-5 h-5 sm:w-5 sm:h-5" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 sm:pl-13 pr-12 sm:pr-14 py-4 sm:py-4.5 bg-zinc-900/90 text-white placeholder-zinc-400 text-sm sm:text-base rounded-2xl border border-white/[0.1] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all shadow-xl shadow-black/40"
      />

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search text"
          className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <div className="hidden sm:flex absolute inset-y-0 right-0 pr-4 sm:pr-5 items-center pointer-events-none">
          <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-white/[0.06] text-zinc-400 rounded border border-white/[0.08]">
            Search
          </span>
        </div>
      )}
    </div>
  );
}
