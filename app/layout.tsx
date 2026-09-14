import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "Marked Studio — Tattoos & Removal Consultations",
  description:
    "Explore tattoos, tattoo removal, cover-ups, and touch-ups. Request a consultation with Los Angeles as our initial service area.",
  keywords: [
    "tattoos",
    "marked studio",
    "tattoo ideas",
    "tattoo inspiration",
    "fine line tattoo",
    "realism tattoo",
    "tattoo removal consultation",
    "Los Angeles",
    "tattoo flash",
  ],
  authors: [{ name: "Marked Studio" }],
  openGraph: {
    title: "Marked Studio — Tattoos & Removal Consultations",
    description:
      "New ink or a fresh start. Explore tattoo and removal services, then request a consultation in a few simple steps.",
    type: "website",
  },
};

import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased selection:bg-white selection:text-black flex flex-col`}
      >
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
