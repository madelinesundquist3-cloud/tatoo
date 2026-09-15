"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithPopup, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { bookingLocation, locationName } from "@/lib/locations";

type Consultation = { ref: string; clientName: string; clientEmail: string; tattooTitle: string; location: string | null; date: string; time: string; notes: string | null; status: string; createdAt: string };

function requestDetails(notes: string | null): { phone?: string; message?: string } {
  try { return JSON.parse(notes || "{}"); } catch { return {}; }
}

export default function ConsultationInbox() {
  const [bookings, setBookings] = useState<Consultation[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load(signIn: boolean) {
    setBusy(true); setError(""); setBookings(null);
    try {
      const { auth, googleProvider } = getClientAuth();
      if (!auth || !googleProvider) throw new Error("Administrator sign-in is not available yet.");
      if (signIn || !auth.currentUser) await signInWithPopup(auth, googleProvider);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Please sign in with your administrator Google account.");
      const response = await fetch("/api/consultations", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Requests could not be loaded.");
      setBookings(data.bookings);
    } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed. Please try again."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBookings(null); setError("");
    const { auth } = getClientAuth();
    if (auth) { try { await signOut(auth); } catch { setError("Sign-out could not be completed. Please try again."); } }
  }
  return <><Navbar /><main id="main-content" className="studio-section min-h-[75vh] pt-32 md:pt-36"><p className="studio-eyebrow">Studio administration</p><h1 className="studio-heading mt-3">Consultation requests</h1><p className="mt-4 text-zinc-400">Review the latest 100 requests. Dates are customer preferences, not confirmed appointments.</p>
    <div className="my-7 flex flex-wrap gap-3"><button disabled={busy} onClick={() => load(true)} className="studio-button disabled:opacity-50">{busy ? "Loading…" : "Sign in with Google"}</button><button disabled={busy} onClick={() => load(false)} className="studio-button-secondary disabled:opacity-50">Refresh requests</button>{bookings !== null && <button disabled={busy} onClick={logout} className="studio-button-secondary">Sign out</button>}</div>
    {error && <p role="alert" className="mb-6 rounded-xl border border-red-400/30 p-4 text-red-200">{error}</p>}
    {bookings?.length === 0 && <p className="rounded-2xl border border-white/10 p-8 text-zinc-400">No consultation requests yet.</p>}
    <div className="grid gap-5 md:grid-cols-2">{bookings?.map((booking) => { const details = requestDetails(booking.notes); return <article key={booking.ref} className="min-w-0 rounded-2xl border border-white/10 p-6"><p className="text-xs uppercase tracking-wider text-[#d3b995]">{booking.status}</p><h2 className="mt-3 text-xl">{booking.tattooTitle}</h2><p className="mt-4 font-medium">{booking.clientName}</p><p className="break-all text-sm text-zinc-300">{booking.clientEmail}</p>{details.phone && <p className="text-sm text-zinc-300">{details.phone}</p>}<p className="mt-4 text-sm text-[#d3b995]">Marked Studio {locationName(bookingLocation(booking.location))}</p><p className="mt-1 text-sm text-zinc-400">{booking.date} · {booking.time}</p>{details.message && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-zinc-300">{details.message}</p>}<p className="mt-5 break-all border-t border-white/10 pt-4 font-mono text-xs text-zinc-500">{booking.ref}</p></article>; })}</div>
    <Link href="/admin" className="mt-8 inline-block text-sm text-zinc-400 underline">Back to booking manager</Link>
  </main><Footer /></>;
}
