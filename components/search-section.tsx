"use client";

import React from "react";
import { SearchBar } from "@/components/search-bar";
import { CategoryPill } from "@/components/category-pill";
import { CATEGORIES } from "@/lib/sample-tattoos";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export function SearchSection({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}: SearchSectionProps) {
  return (
    <section id="search-section" className="py-8 md:py-12 relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Prominent Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search tattoos, styles, people..."
        />

        {/* Popular Categories */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Popular Categories
            </span>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 ${
                selectedCategory === null
                  ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                  : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08]"
              }`}
            >
              All Styles
            </button>

            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category}
                name={category}
                isSelected={selectedCategory === category}
                onClick={() =>
                  onSelectCategory(
                    selectedCategory === category ? null : category
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
