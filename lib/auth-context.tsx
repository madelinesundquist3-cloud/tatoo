"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  getClientAuth,
  getIdToken,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutFirebase,
} from "@/lib/firebase";
import type { BookingStatus } from "@/lib/services";

export interface AdminBooking {
  id: string;
  ref: string;
  clientName: string;
  clientEmail: string;
  clientAvatar?: string;
  clientUsername?: string;
  tattooTitle: string;
  tattooImage: string;
  style: string;
  placement: string;
  size: string;
  location?: string | null;
  date: string;
  time: string;
  sessionType: string;
  depositPaid: number;
  estimatedTotal: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  /** False until Firebase has restored (or ruled out) a saved session. */
  authReady: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  allBookings: AdminBooking[];
  /** Why the admin booking list couldn't be loaded or changed, or "" when it's in sync. */
  bookingsError: string;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  refreshBookings: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isFirebaseConfigured: boolean;
  isAdmin: boolean;
  adminEmail: string;
}

// A display hint only: every admin API call is verified server-side from the Firebase ID token.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();

// Earlier versions kept an unverified profile and every client's bookings in localStorage.
const LEGACY_STORAGE_KEYS = ["tattoo_current_user", "tattoo_all_bookings"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toProfile(fbUser: FirebaseUser): UserProfile {
  const email = fbUser.email ?? "";
  const username =
    (fbUser.displayName ?? email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "") ||
    `user_${fbUser.uid.slice(0, 6)}`;
  return {
    id: fbUser.uid,
    name: fbUser.displayName || email,
    username,
    email,
    avatarUrl: fbUser.photoURL ?? "",
    emailVerified: fbUser.emailVerified,
  };
}

async function authorizedFetch(input: string, init: RequestInit = {}) {
  const token = await getIdToken();
  if (!token) throw new Error("Please sign in again.");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

async function fetchBookings(): Promise<AdminBooking[]> {
  const response = await authorizedFetch("/api/bookings");
  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data?.bookings)) {
    throw new Error(data?.error || "Bookings could not be loaded.");
  }
  return data.bookings;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [allBookings, setAllBookings] = useState<AdminBooking[]>([]);
  const [bookingsError, setBookingsError] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage can be unavailable (private mode); nothing to clean up then.
    }

    const { auth } = getClientAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? toProfile(fbUser) : null);
      if (!fbUser) setAllBookings([]);
      setAuthReady(true);
    });
  }, []);

  const isAdmin = Boolean(
    ADMIN_EMAIL && user?.emailVerified && user.email.toLowerCase() === ADMIN_EMAIL
  );

  const refreshBookings = useCallback(async () => {
    try {
      setAllBookings(await fetchBookings());
      setBookingsError("");
    } catch (error) {
      setBookingsError(error instanceof Error ? error.message : "Bookings could not be loaded.");
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    fetchBookings()
      .then((bookings) => {
        if (cancelled) return;
        setAllBookings(bookings);
        setBookingsError("");
      })
      .catch((error) => {
        console.warn("Could not load bookings:", error);
        if (!cancelled) setBookingsError(error instanceof Error ? error.message : "Bookings could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      setAllBookings((current) =>
        current.map((b) => (b.id === id || b.ref === id ? { ...b, status } : b))
      );
      try {
        const response = await authorizedFetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "The status change couldn’t be saved.");
        }
      } catch (error) {
        console.error("Could not update booking status:", error);
        // Put the list back in line with the server, then explain what failed.
        await refreshBookings().catch(() => undefined);
        setBookingsError(error instanceof Error ? error.message : "The status change couldn’t be saved.");
      }
    },
    [refreshBookings]
  );

  const loginWithGoogle = useCallback(async () => {
    await signInWithGoogle();
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    setAllBookings([]);
    setBookingsError("");
    await signOutFirebase();
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        loginWithGoogle,
        logout,
        allBookings,
        bookingsError,
        updateBookingStatus,
        refreshBookings,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isFirebaseConfigured,
        isAdmin,
        adminEmail: ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
