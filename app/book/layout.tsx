import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Tattoo | Marked Studio",
  description:
    "Book a tattoo, cover-up, touch-up, or removal consultation at a Marked Studio location near you with a secure deposit credited toward your final price.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
