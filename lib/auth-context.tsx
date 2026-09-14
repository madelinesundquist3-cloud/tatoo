"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginWithFirebaseGoogle, isFirebaseConfigured, getClientDb } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

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
  date: string;
  time: string;
  sessionType: "Studio Appointment" | "Design Consultation";
  depositPaid: number;
  estimatedTotal: number;
  status: "deposit_held" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface UserBooking {
  ref: string;
  pieceTitle: string;
  date: string;
  time: string;
  placement: string;
  deposit: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  favoriteStyle?: string;
  bookings: UserBooking[];
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, username?: string) => void;
  loginWithGoogle: () => Promise<UserProfile>;
  register: (
    name: string,
    username: string,
    email: string,
    favoriteStyle?: string
  ) => UserProfile;
  logout: () => void;
  addBooking: (booking: Omit<UserBooking, "createdAt">) => void;
  allBookings: AdminBooking[];
  recordAdminBooking: (
    booking: Omit<AdminBooking, "id" | "createdAt" | "status"> & {
      status?: AdminBooking["status"];
    }
  ) => AdminBooking;
  updateBookingStatus: (
    id: string,
    status: AdminBooking["status"]
  ) => void;
  refreshBookings: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  isFirebaseConfigured: boolean;
  isAdmin: boolean;
  adminEmail: string;
}

export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "ccosmas001@gmail.com"
).toLowerCase().trim();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tattoo_current_user";
const GLOBAL_BOOKINGS_KEY = "tattoo_all_bookings";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allBookings, setAllBookings] = useState<AdminBooking[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");

  const fetchBookingsFromServer = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data.bookings)) {
        setAllBookings((prev) => {
          const map = new Map<string, AdminBooking>();
          [...data.bookings, ...prev].forEach((b: AdminBooking) => {
            if (b && b.ref && !map.has(b.ref)) {
              map.set(b.ref, b);
            }
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(GLOBAL_BOOKINGS_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (e) {
      console.warn("Could not fetch bookings from server API", e);
    }
  };

  // Load user and clean dynamic bookings from localStorage and Firestore on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }

    try {
      const storedBookings = localStorage.getItem(GLOBAL_BOOKINGS_KEY);
      if (storedBookings) {
        const parsed: AdminBooking[] = JSON.parse(storedBookings);
        // Strip out any previous dummy/mock seed records
        const realOnly = parsed.filter(
          (b) => !b.id.startsWith("book-") && b.ref !== "TAT-90214"
        );
        setAllBookings(realOnly);
        localStorage.setItem(GLOBAL_BOOKINGS_KEY, JSON.stringify(realOnly));
      } else {
        setAllBookings([]);
      }
    } catch (e) {
      console.error("Failed to load studio bookings", e);
    }

    // Connect real-time Cloud Firestore synchronization if database exists
    const firestoreDb = getClientDb();
    if (firestoreDb) {
      try {
        const q = query(
          collection(firestoreDb, "bookings"),
          orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const liveData: AdminBooking[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id,
                  ref: data.ref || `TAT-${docSnap.id.slice(0, 5)}`,
                  clientName: data.clientName || "Client",
                  clientEmail: data.clientEmail || "",
                  clientAvatar: data.clientAvatar || "",
                  clientUsername: data.clientUsername || "",
                  tattooTitle: data.tattooTitle || "Custom Design",
                  tattooImage:
                    data.tattooImage ||
                    "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=400&q=80",
                  style: data.style || "Custom",
                  placement: data.placement || "Forearm",
                  size: data.size || "Medium",
                  date: data.date || "Pending",
                  time: data.time || "12:00 PM",
                  sessionType: data.sessionType || "Studio Appointment",
                  depositPaid: data.depositPaid ?? 50,
                  estimatedTotal: data.estimatedTotal ?? 280,
                  status: data.status || "deposit_held",
                  notes: data.notes || "",
                  createdAt: data.createdAt || new Date().toISOString(),
                };
              });
              setAllBookings(liveData);
              localStorage.setItem(
                GLOBAL_BOOKINGS_KEY,
                JSON.stringify(liveData)
              );
            }
          },
          (err) => {
            console.info("Firestore live sync active via local ledger:", err.message);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore snapshot listener error:", err);
      }
    }

    // Always fetch latest bookings from centralized server API
    fetchBookingsFromServer();
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user session", e);
    }
  };

  const login = (email: string, username?: string) => {
    const cleanUsername =
      username ||
      email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      name: username ? username : "Tattoo Collector",
      username: cleanUsername,
      email,
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bookings: [],
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
  };

  const register = (
    name: string,
    username: string,
    email: string,
    favoriteStyle?: string
  ): UserProfile => {
    const cleanUsername = username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "");
    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      name,
      username: cleanUsername || "collector",
      email,
      favoriteStyle: favoriteStyle || "All Styles",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bookings: [],
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const googleUser = await loginWithFirebaseGoogle();
    const existingBookings = user?.bookings || [];
    const profile: UserProfile = {
      id: googleUser.id,
      name: googleUser.name,
      username: googleUser.username,
      email: googleUser.email,
      avatarUrl: googleUser.avatarUrl,
      bookings: existingBookings,
    };
    saveUser(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const logout = () => {
    saveUser(null);
  };

  const addBooking = (booking: Omit<UserBooking, "createdAt">) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        bookings: [
          { ...booking, createdAt: new Date().toISOString() },
          ...prev.bookings,
        ],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const recordAdminBooking = (
    booking: Omit<AdminBooking, "id" | "createdAt" | "status"> & {
      status?: AdminBooking["status"];
    }
  ) => {
    const newEntry: AdminBooking = {
      ...booking,
      id: "admin-bk-" + Date.now(),
      status: booking.status || "deposit_held",
      createdAt: new Date().toISOString(),
    };
    setAllBookings((prev) => {
      const updated = [newEntry, ...prev.filter((b) => b.ref !== newEntry.ref)];
      try {
        localStorage.setItem(GLOBAL_BOOKINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Write to central server API so all devices see the booking
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    }).catch((err) => {
      console.warn("Server booking record fallback:", err);
    });

    // Write to Firestore in background
    const firestoreDb = getClientDb();
    if (firestoreDb) {
      addDoc(collection(firestoreDb, "bookings"), {
        ...newEntry,
        timestamp: new Date(),
      }).catch((err) => {
        console.info("Firestore remote record fallback:", err.message);
      });
    }

    return newEntry;
  };

  const updateBookingStatus = (id: string, status: AdminBooking["status"]) => {
    setAllBookings((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, status } : b));
      try {
        localStorage.setItem(GLOBAL_BOOKINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Update on server API
    fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch((err) => {
      console.warn("Server status update fallback:", err);
    });

    const firestoreDb = getClientDb();
    if (firestoreDb && !id.startsWith("admin-bk-")) {
      updateDoc(doc(firestoreDb, "bookings", id), { status }).catch((err) => {
        console.info("Firestore status update fallback:", err.message);
      });
    }
  };

  const openAuthModal = (mode: "login" | "register" = "register") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = Boolean(
    user?.email && user.email.toLowerCase().trim() === ADMIN_EMAIL
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        addBooking,
        allBookings,
        recordAdminBooking,
        updateBookingStatus,
        refreshBookings: fetchBookingsFromServer,
        isAuthModalOpen,
        authModalMode,
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
