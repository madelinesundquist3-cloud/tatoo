"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { OfferBanner } from "@/components/offer-banner";

function UserIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ShieldIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LogOutIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

function MenuIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CalendarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const links = [
  { label: "Services", href: "/#services" },
  { label: "Our Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Locations", href: "/locations" },
  { label: "FAQ", href: "/faq" },
];

export function Navbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { user, openAuthModal, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = user?.name
    ? user.name.trim().split(" ")[0]
    : user?.username || "Collector";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#09090b]/95 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-4 focus:text-black"
      >
        Skip to content
      </a>
      <OfferBanner />
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" aria-label="Marked Studio home" className="flex items-center gap-3">
          <Image
            src="/marked-studio-emblem.png"
            alt=""
            width={36}
            height={36}
            style={{ width: "auto", height: "auto" }}
            className="hidden min-[380px]:block"
          />
          <span className="text-sm font-bold tracking-[0.22em]">
            MARKED <span className="block text-[10px] font-normal tracking-[0.35em] text-zinc-400">STUDIO</span>
          </span>
        </Link>

        {/* Center navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm text-zinc-300 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          {onSearchClick && (
            <button onClick={onSearchClick} className="text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer">
              Search designs
            </button>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            /* User profile pill with first name */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] p-1.5 pr-3 hover:border-[#d3b995]/50 transition-all cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user.avatarUrl ? (
                  <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/20">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d3b995] text-xs font-bold text-black">
                    {firstName[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-200">
                  {firstName}
                </span>
                {isAdmin && (
                  <span className="rounded bg-[#d3b995]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#d3b995] border border-[#d3b995]/40">
                    Admin
                  </span>
                )}
                <ChevronDownIcon className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#121215] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/my-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-200 hover:bg-white/5 hover:text-white"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#d3b995]" />
                      <span>My bookings</span>
                    </Link>

                    <Link
                      href="/book"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                      <span>Book an appointment</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#d3b995] hover:bg-[#d3b995]/10"
                        >
                          <ShieldIcon className="w-3.5 h-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/consultations"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#d3b995] hover:bg-[#d3b995]/10"
                        >
                          <ShieldIcon className="w-3.5 h-3.5" />
                          <span>Consultation Requests</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        void logout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 cursor-pointer"
                    >
                      <LogOutIcon className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sign In button when unauthenticated */
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <Link href="/book" className="studio-button px-3.5 py-2 text-xs sm:px-5 sm:text-sm">
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book now</span>
            <ArrowUpRightIcon className="hidden lg:block w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="rounded-lg p-2.5 text-zinc-300 hover:text-white md:hidden"
          >
            {open ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/10 px-5 py-4 md:hidden bg-[#09090b]">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-3 pt-3 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[11px] text-zinc-400">{user.email}</p>
                </div>
                <Link
                  href="/my-bookings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:text-white"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#d3b995]" />
                  <span>My bookings</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-xs text-[#d3b995] font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-300 hover:text-red-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  openAuthModal();
                  setOpen(false);
                }}
                className="w-full studio-button text-xs py-2.5 text-center"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
