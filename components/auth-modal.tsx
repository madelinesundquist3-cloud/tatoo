"use client";

import React, { useState } from "react";
import Image from "next/image";
function CloseModalIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function UserCheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM19 11l2 2 4-4" />
    </svg>
  );
}

function LoaderIcon({ className = "w-4 h-4 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/sample-tattoos";

export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
    isFirebaseConfigured,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favoriteStyle, setFavoriteStyle] = useState<string>("Fine Line");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Keep internal mode in sync with context
  React.useEffect(() => {
    setMode(authModalMode);
    setAuthError(null);
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (mode === "register") {
        register(fullName, username, email, favoriteStyle);
      } else {
        login(email, username);
      }
    } catch (err: unknown) {
      setAuthError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === "auth/popup-closed-by-user") {
        // User closed the popup intentionally, no scary error needed
        return;
      }
      if (errorObj?.code === "auth/unauthorized-domain") {
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        setAuthError(
          `Domain "${host}" is not in your Firebase Authorized Domains list. Please add "${host}" under Firebase Console > Authentication > Settings > Authorized domains.`
        );
        return;
      }
      setAuthError(
        errorObj?.message || "Google authentication failed. Please try again."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDemoLogin = () => {
    register("Kai Vance", "kai_collector", "kai@tattoo.community", "Fine Line");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border border-white/[0.12] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <CloseModalIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center shadow-lg shadow-black/50">
            <Image
              src="/marked-studio-emblem.png"
              alt="Marked Studio Emblem"
              width={40}
              height={40}
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-zinc-300 mb-1">
            <SparklesIcon className="w-3.5 h-3.5 text-zinc-300" />
            <span>Marked Studio Access</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === "register" ? "Join Marked Studio" : "Welcome Back"}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === "register"
              ? "Sign in with Google or create an account to book sessions & connect."
              : "Sign in to manage your appointments and saved pieces."}
          </p>
        </div>

        {/* Primary Google Sign-In Action */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm border border-white/15 hover:border-white/30 flex items-center justify-center gap-3 transition-all active:scale-98 shadow-lg shadow-black/40 disabled:opacity-70 cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <LoaderIcon className="w-4 h-4 animate-spin text-zinc-400" />
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                <GoogleLogo className="w-4 h-4" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {!isFirebaseConfigured && (
            <p className="text-[10px] text-zinc-500 text-center font-mono">
              Firebase credentials pending • Demo Google login active
            </p>
          )}
        </div>

        {/* Error notification banner */}
        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-zinc-950 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
            or with email
          </span>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setAuthError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setAuthError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === "register" && (
            <>
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-zinc-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maya Lin"
                  className="w-full px-4 py-2.5 bg-zinc-900 rounded-xl text-sm text-white border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-zinc-400">
                  Username Handle *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-zinc-500 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mayalin_ink"
                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-900 rounded-xl text-sm text-white border border-white/10 focus:border-white/30 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-zinc-400">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maya@example.com"
              className="w-full px-4 py-2.5 bg-zinc-900 rounded-xl text-sm text-white border border-white/10 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-zinc-400">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-zinc-900 rounded-xl text-sm text-white border border-white/10 focus:border-white/30 focus:outline-none"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-400">
                Primary Aesthetic Interest
              </label>
              <select
                value={favoriteStyle}
                onChange={(e) => setFavoriteStyle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 rounded-xl text-sm text-zinc-300 border border-white/10 focus:border-white/30 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 active:scale-98 transition-all shadow-md shadow-white/10 flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === "register" ? "Create Free Account" : "Sign In"}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-2 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            <UserCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Demo Sign-in (@kai_collector)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
