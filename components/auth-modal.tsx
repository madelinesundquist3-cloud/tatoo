"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function CloseModalIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LoaderIcon({ className = "w-4 h-4 animate-spin" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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

/** A customer-facing message for a Firebase sign-in error, or null when the user just closed the popup. */
function signInErrorMessage(error: unknown): string | null {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
  if (code === "auth/popup-blocked") {
    return "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.";
  }
  if (code === "auth/unauthorized-domain") {
    console.error(
      `Add ${window.location.hostname} under Firebase Console → Authentication → Settings → Authorized domains.`
    );
    return "Sign-in isn't available on this web address yet.";
  }
  return message || "Google sign-in failed. Please try again.";
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(signInErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border border-white/[0.12] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close sign-in"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <CloseModalIcon className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center">
            <Image src="/marked-studio-emblem.png" alt="" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-white">
            Sign in to Marked Studio
          </h2>
          <p className="text-sm text-zinc-400">
            Use your Google account to book, pay your deposit securely, and see your bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || !isFirebaseConfigured}
          className="w-full py-3.5 px-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 flex items-center justify-center gap-3 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <GoogleLogo className="w-4 h-4" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {!isFirebaseConfigured && (
          <p className="text-xs text-zinc-400 text-center">Sign-in isn’t available yet. Please check back soon.</p>
        )}

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500">
          We use your name and email only to manage your bookings. Read our{" "}
          <Link href="/privacy" onClick={closeAuthModal} className="underline underline-offset-4 hover:text-zinc-300">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
