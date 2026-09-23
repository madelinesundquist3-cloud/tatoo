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
  metadataBase: new URL("https://www.marktattoo.com"),
  title: {
    default: "Marked Studio — Tattoo Studios Across the USA",
    template: "%s | Marked Studio",
  },
  description:
    "Book tattoos, cover-ups, touch-ups, and removal consultations at Marked Studio locations across the USA, with secure online deposits.",
  keywords: [
    "tattoos",
    "marked studio",
    "marktattoo",
    "tattoo shop",
    "tattoo ideas",
    "tattoo inspiration",
    "fine line tattoo",
    "realism tattoo",
    "tattoo removal consultation",
    "tattoo studios USA",
    "tattoo flash",
  ],
  authors: [{ name: "Marked Studio", url: "https://www.marktattoo.com" }],
  creator: "Marked Studio",
  publisher: "Marked Studio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Marked Studio — Tattoo Studios Across the USA",
    description:
      "New ink or a fresh start. Explore tattoo and removal services, then request a consultation in a few simple steps.",
    url: "https://www.marktattoo.com",
    siteName: "Marked Studio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/marked-studio-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Marked Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marked Studio — Tattoo Studios Across the USA",
    description:
      "Book tattoos, cover-ups, touch-ups, and removal consultations at Marked Studio locations across the USA.",
    images: ["/marked-studio-logo-dark.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  name: "Marked Studio",
  url: "https://www.marktattoo.com",
  logo: "https://www.marktattoo.com/marked-studio-logo-dark.png",
  image: "https://www.marktattoo.com/marked-studio-logo-dark.png",
  description:
    "Custom tattoo designs, fine line, realism, cover-ups, and tattoo removal consultations at Marked Studio locations across the USA.",
  priceRange: "$$",
  hasMap: "https://www.marktattoo.com/locations",
  sameAs: [
    "https://www.marktattoo.com",
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
