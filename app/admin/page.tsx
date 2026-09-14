"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth, AdminBooking } from "@/lib/auth-context";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  Users,
  CheckCircle2,
  CalendarCheck,
  Download,
  Mail,
  MoreVertical,
  ChevronRight,
  Sparkles,
  MapPin,
  FileText,
  AlertCircle,
  X,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function AdminPage() {
  const {
    allBookings,
    updateBookingStatus,
    user,
    isAdmin,
    adminEmail,
    openAuthModal,
    login,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  // Revenue & Appointment Metrics
  const metrics = useMemo(() => {
    const totalDeposits = allBookings.reduce(
      (acc, b) => (b.status !== "cancelled" ? acc + b.depositPaid : acc),
      0
    );
    const projectedGross = allBookings.reduce(
      (acc, b) => (b.status !== "cancelled" ? acc + b.estimatedTotal : acc),
      0
    );
    const activeAppointments = allBookings.filter(
      (b) => b.status === "deposit_held" || b.status === "confirmed"
    ).length;
    const completedSessions = allBookings.filter(
      (b) => b.status === "completed"
    ).length;

    return {
      totalDeposits,
      projectedGross,
      activeAppointments,
      completedSessions,
    };
  }, [allBookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const matchesSearch =
        b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tattooTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.clientUsername &&
          b.clientUsername.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedStatusFilter === "all") return true;
      if (selectedStatusFilter === "active")
        return b.status === "deposit_held" || b.status === "confirmed";
      if (selectedStatusFilter === "completed") return b.status === "completed";
      if (selectedStatusFilter === "consultation")
        return b.sessionType === "Design Consultation";
      return true;
    });
  }, [allBookings, searchQuery, selectedStatusFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Reference",
      "Client Name",
      "Client Email",
      "Piece Title",
      "Style",
      "Placement",
      "Size",
      "Date",
      "Time",
      "Session Type",
      "Deposit Paid ($)",
      "Estimated Total ($)",
      "Status",
    ];

    const rows = allBookings.map((b) => [
      b.ref,
      `"${b.clientName}"`,
      b.clientEmail,
      `"${b.tattooTitle}"`,
      `"${b.style}"`,
      `"${b.placement}"`,
      `"${b.size}"`,
      b.date,
      b.time,
      `"${b.sessionType}"`,
      b.depositPaid,
      b.estimatedTotal,
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tattoo_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AdminBooking["status"]) => {
    switch (status) {
      case "deposit_held":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Deposit Held
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-white/10">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Restrict access to authorized administrator
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-white selection:text-black">
        <Navbar />

        <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-32 pb-24">
          <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-white/[0.1] shadow-2xl text-center relative overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-500/10 blur-3xl pointer-events-none rounded-full"
              aria-hidden="true"
            />

            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-amber-400 mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>

            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.08]">
              Restricted Area
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-4">
              Studio Admin Access
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
              This financial ledger and bookings manager is restricted to the authorized studio administrator (
              <span className="text-zinc-200 font-mono font-medium">{adminEmail}</span>).
            </p>

            {user ? (
              <div className="mt-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] text-left">
                <div className="text-[11px] font-mono uppercase text-zinc-400">Currently Signed In:</div>
                <div className="text-sm font-semibold text-white mt-0.5 truncate">{user.name}</div>
                <div className="text-xs font-mono text-zinc-400 truncate">{user.email}</div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-red-950/60 border border-red-500/30 text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Not authorized as studio administrator</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] text-xs text-zinc-400 leading-relaxed">
                Please sign in with <strong className="text-white font-mono">{adminEmail}</strong> to view live client bookings, revenue, and schedule statuses.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => login(adminEmail, "Studio Admin")}
                className="w-full py-3.5 px-5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Instant Sign-In as Studio Owner ({adminEmail})</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-medium text-xs transition-colors text-center"
              >
                <span>Switch or Use Another Email</span>
              </button>

              <Link
                href="/"
                className="w-full py-2.5 px-5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main id="main-content" className="flex-1 pt-28 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-mono text-zinc-400 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">
                  Marked Studio • Management
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin: {user?.email}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                Bookings & Revenue Manager
              </h1>
              <Link href="/admin/consultations" className="mt-3 inline-block text-sm text-[#d3b995] underline underline-offset-4">Open consultation requests</Link>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Real-time ledger of client appointment bookings, deposit holds, and schedule status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>New Booking</span>
              </Link>
            </div>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Deposits Held</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  ${metrics.totalDeposits.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold">$50 hold</span>
                  <span>per active reservation</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Projected Volume</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  ${metrics.projectedGross.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Estimated total across booked designs
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Active Bookings</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {metrics.activeAppointments}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Upcoming ink & design consults
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Completed Sessions</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {metrics.completedSessions}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Archived ink appointments
                </div>
              </div>
            </div>
          </div>

          {/* Search, Status Tabs & Table Container */}
          <div className="bg-zinc-950/70 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
            {/* Filter Toolbar */}
            <div className="p-4 sm:p-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, email, tattoo piece, #TAT..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: "all", label: "All Bookings", count: allBookings.length },
                  {
                    id: "active",
                    label: "Active Holds",
                    count: metrics.activeAppointments,
                  },
                  {
                    id: "completed",
                    label: "Completed",
                    count: metrics.completedSessions,
                  },
                  {
                    id: "consultation",
                    label: "Consultations",
                    count: allBookings.filter(
                      (b) => b.sessionType === "Design Consultation"
                    ).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedStatusFilter === tab.id
                        ? "bg-white text-black font-bold shadow"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedStatusFilter === tab.id
                          ? "bg-black/10 text-black font-bold"
                          : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-zinc-900/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-4 sm:px-6">Reference & Client</th>
                    <th className="py-3.5 px-4">Tattoo Design</th>
                    <th className="py-3.5 px-4">Date & Slot</th>
                    <th className="py-3.5 px-4">Payment & Breakdown</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-400 mb-3 shadow-inner">
                          {allBookings.length === 0 ? (
                            <CalendarCheck className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Search className="w-6 h-6" />
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {allBookings.length === 0
                            ? "Dynamic Ledger Active — Waiting for Bookings"
                            : "No matching bookings found"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                          {allBookings.length === 0
                            ? "All dummy data has been removed. As clients sign in with Google and submit bookings on /book or through any tattoo piece, their real live appointments and deposits will dynamically appear here."
                            : "Try searching for a different client name, reference code, or reset the active filter tab."}
                        </p>
                        {allBookings.length === 0 && (
                          <div className="mt-4">
                            <Link
                              href="/book"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Place a Real Booking on /book</span>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedBooking(b)}
                      >
                        {/* Reference & Client */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden relative border border-white/15 bg-zinc-900 shrink-0">
                              {b.clientAvatar ? (
                                <Image
                                  src={b.clientAvatar}
                                  alt={b.clientName}
                                  fill
                                  sizes="36px"
                                  unoptimized={b.clientAvatar.includes("googleusercontent.com")}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-300 bg-zinc-800 text-xs">
                                  {b.clientName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-zinc-200">
                                  {b.clientName}
                                </span>
                                {b.clientUsername && (
                                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.06]">
                                    @{b.clientUsername}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {b.clientEmail}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                                #{b.ref}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tattoo Design */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-white/10 bg-zinc-900 shrink-0">
                              <Image
                                src={b.tattooImage}
                                alt={b.tattooTitle}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-200 max-w-[160px] sm:max-w-[200px] truncate">
                                {b.tattooTitle}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                                <span className="font-medium text-zinc-300">{b.placement}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-zinc-500">
                                  {b.size}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date & Slot */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-medium text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{b.date}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{b.time}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-mono">
                              {b.sessionType === "Studio Appointment" ? "In-Studio" : "Virtual"}
                            </span>
                          </div>
                        </td>

                        {/* Payment & Breakdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-xs">
                              ${b.depositPaid} Paid
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                            Est. Total: <strong className="text-zinc-200">${b.estimatedTotal}</strong>
                            <span className="text-zinc-500 text-[10px] ml-1">
                              (${b.estimatedTotal - b.depositPaid} due)
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td
                          className="py-4 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={b.status}
                            onChange={(e) =>
                              updateBookingStatus(
                                b.id,
                                e.target.value as AdminBooking["status"]
                              )
                            }
                            className="bg-zinc-900 border border-white/15 text-xs text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer font-medium"
                          >
                            <option value="deposit_held">Deposit Held</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 px-4 sm:px-6 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`mailto:${b.clientEmail}?subject=Regarding Your Tattoo Booking ${b.ref}`}
                              title="Email Client"
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-zinc-200 hover:text-black font-semibold text-[11px] transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Detail Modal / Inspection Drawer */}
      {selectedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative w-full max-w-lg bg-zinc-950 border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Booking #{selectedBooking.ref}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  Appointment Ticket
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client card */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/20 bg-zinc-800 shrink-0">
                {selectedBooking.clientAvatar ? (
                  <Image
                    src={selectedBooking.clientAvatar}
                    alt={selectedBooking.clientName}
                    fill
                    sizes="48px"
                    unoptimized={selectedBooking.clientAvatar.includes("googleusercontent.com")}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-zinc-300 text-base">
                    {selectedBooking.clientName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate">
                    {selectedBooking.clientName}
                  </h4>
                  {selectedBooking.clientUsername && (
                    <span className="text-xs font-mono text-zinc-400">
                      @{selectedBooking.clientUsername}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                  {selectedBooking.clientEmail}
                </p>
              </div>
            </div>

            {/* Design & Schedule grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Tattoo Design</span>
                <div className="font-semibold text-white truncate">{selectedBooking.tattooTitle}</div>
                <div className="text-[11px] text-zinc-400">{selectedBooking.style}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Placement & Size</span>
                <div className="font-semibold text-white">{selectedBooking.placement}</div>
                <div className="text-[11px] text-zinc-400">{selectedBooking.size}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Schedule</span>
                <div className="font-semibold text-white">{selectedBooking.date}</div>
                <div className="text-[11px] text-zinc-400">{selectedBooking.time}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Format</span>
                <div className="font-semibold text-white">{selectedBooking.sessionType}</div>
                <div className="text-[11px] text-emerald-400 font-mono">Held with $50</div>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Deposit Paid (Card / Google Auth):</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${selectedBooking.depositPaid}.00 (PAID)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Estimated Total Session Cost:</span>
                <span className="font-mono font-semibold text-white">
                  ${selectedBooking.estimatedTotal}.00
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 font-bold">
                <span className="text-zinc-300">Remaining Balance on Session:</span>
                <span className="font-mono text-amber-400">
                  ${selectedBooking.estimatedTotal - selectedBooking.depositPaid}.00
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.06] text-xs">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Client / Studio Notes:
                </span>
                <p className="text-zinc-300 italic">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedBooking.clientEmail}?subject=Tattoo Appointment Confirmation ${selectedBooking.ref}`}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Client</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
