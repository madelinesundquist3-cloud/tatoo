"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FilterBar, FilterState } from "@/components/filter-sidebar";
import { TattooCard } from "@/components/tattoo-card";
import { SAMPLE_TATTOOS } from "@/lib/sample-tattoos";
import { ChevronRight, Sparkles, FilterX } from "lucide-react";

export default function ExploreTattoosPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedCategory: null,
    selectedPlacement: null,
    sortBy: "popular",
  });

  const filteredTattoos = useMemo(() => {
    const list = SAMPLE_TATTOOS.filter((tattoo) => {
      // Category match
      if (
        filters.selectedCategory &&
        tattoo.style.toLowerCase() !== filters.selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Placement match
      if (
        filters.selectedPlacement &&
        tattoo.placement.toLowerCase() !==
          filters.selectedPlacement.toLowerCase()
      ) {
        return false;
      }

      // Search match
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = tattoo.title.toLowerCase().includes(q);
        const matchesStyle = tattoo.style.toLowerCase().includes(q);
        const matchesPlacement = tattoo.placement.toLowerCase().includes(q);
        const matchesAuthor =
          tattoo.author.name.toLowerCase().includes(q) ||
          tattoo.author.username.toLowerCase().includes(q);
        const matchesTags = tattoo.tags.some((tag) =>
          tag.toLowerCase().includes(q)
        );

        if (
          !matchesTitle &&
          !matchesStyle &&
          !matchesPlacement &&
          !matchesAuthor &&
          !matchesTags
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === "saves") {
      list.sort((a, b) => b.savesCount - a.savesCount);
    } else if (filters.sortBy === "newest") {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      // popular
      list.sort((a, b) => b.likesCount - a.likesCount);
    }

    return list;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedCategory: null,
      selectedPlacement: null,
      sortBy: "popular",
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main id="main-content" className="flex-1 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-300 font-medium">Explore Tattoos</span>
          </nav>

          {/* Directory Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase font-semibold tracking-[0.2em] text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              Tattoo Directory & Flash
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Explore Tattoos
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
              Browse custom pieces, fine-line ink, and community concepts. Filter
              by style, body placement, or artist tags.
            </p>
          </div>

          {/* Filter Controls Bar */}
          <div className="mb-10">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalResults={filteredTattoos.length}
            />
          </div>

          {/* Tattoo Grid */}
          {filteredTattoos.length === 0 ? (
            <div className="text-center py-20 px-6 rounded-2xl border border-white/[0.08] bg-zinc-950/40 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <FilterX className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                No tattoos matched your filters
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Try loosening your search keywords, switching body placement, or
                resetting filters to see all pieces.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredTattoos.map((tattoo) => (
                <TattooCard key={tattoo.id} tattoo={tattoo} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
