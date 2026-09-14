"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw, ArrowUpDown } from "lucide-react";
import { CATEGORIES, PLACEMENTS } from "@/lib/sample-tattoos";

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedPlacement: string | null;
  sortBy: "popular" | "saves" | "newest";
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  totalResults,
}: FilterBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeFiltersCount =
    (filters.selectedCategory ? 1 : 0) +
    (filters.selectedPlacement ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  const handleReset = () => {
    onFilterChange({
      searchQuery: "",
      selectedCategory: null,
      selectedPlacement: null,
      sortBy: "popular",
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Search by keyword, style, placement, or @username..."
            className="w-full pl-11 pr-10 py-3 bg-zinc-900/90 text-white placeholder-zinc-500 text-sm rounded-xl border border-white/[0.08] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Placement Dropdown on Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <select
            value={filters.selectedPlacement || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                selectedPlacement: e.target.value ? e.target.value : null,
              })
            }
            className="py-3 px-4 bg-zinc-900 text-zinc-300 text-sm rounded-xl border border-white/[0.08] focus:border-white/30 focus:outline-none cursor-pointer"
          >
            <option value="">All Placements</option>
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              className="py-3 pl-9 pr-8 bg-zinc-900 text-zinc-300 text-sm rounded-xl border border-white/[0.08] focus:border-white/30 focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="saves">Most Saved</option>
              <option value="newest">Featured First</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="sm:hidden flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm font-medium text-zinc-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, selectedCategory: null })}
          className={`px-4 py-1.5 text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all whitespace-nowrap ${
            filters.selectedCategory === null
              ? "bg-white text-black font-semibold shadow-md shadow-white/10"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.08]"
          }`}
        >
          All Styles
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                selectedCategory: filters.selectedCategory === cat ? null : cat,
              })
            }
            className={`px-4 py-1.5 text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all whitespace-nowrap ${
              filters.selectedCategory === cat
                ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Filter Chips & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Showing <strong className="text-white">{totalResults}</strong> tattoos
          </span>

          {filters.selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 border border-white/10">
              Style: {filters.selectedCategory}
              <button
                onClick={() => onFilterChange({ ...filters, selectedCategory: null })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.selectedPlacement && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 border border-white/10">
              Placement: {filters.selectedPlacement}
              <button
                onClick={() => onFilterChange({ ...filters, selectedPlacement: null })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 border border-white/10">
              Query: &quot;{filters.searchQuery}&quot;
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white underline underline-offset-4 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full bg-zinc-950 border-t border-white/10 p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Filter & Sort</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sort options */}
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2 block">
                Sort By
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Popular", val: "popular" },
                  { label: "Most Saved", val: "saves" },
                  { label: "Newest", val: "newest" },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        sortBy: s.val as FilterState["sortBy"],
                      })
                    }
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      filters.sortBy === s.val
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-zinc-900 text-zinc-300 border-white/[0.08]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement options */}
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2 block">
                Placement
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({ ...filters, selectedPlacement: null })
                  }
                  className={`px-3 py-1.5 text-xs rounded-lg border ${
                    filters.selectedPlacement === null
                      ? "bg-white text-black font-semibold"
                      : "bg-zinc-900 text-zinc-300 border-white/[0.08]"
                  }`}
                >
                  All
                </button>
                {PLACEMENTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        selectedPlacement:
                          filters.selectedPlacement === p ? null : p,
                      })
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg border ${
                      filters.selectedPlacement === p
                        ? "bg-white text-black font-semibold"
                        : "bg-zinc-900 text-zinc-300 border-white/[0.08]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 text-xs font-semibold text-zinc-300 bg-zinc-900 rounded-xl border border-white/[0.08]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 text-xs font-semibold text-black bg-white rounded-xl"
              >
                Apply ({totalResults})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
