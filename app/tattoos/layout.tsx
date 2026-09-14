import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Tattoos — Styles, Flash & Creators | Marked Studio",
  description:
    "Explore thousands of curated tattoo designs, categorized by style, placement, and technique. Discover the piece that tells your story.",
};

export default function TattoosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
