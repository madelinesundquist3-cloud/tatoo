import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Consultation | Marked Studio",
  description:
    "Request a tattoo, removal, cover-up, or touch-up consultation in our initial Los Angeles service area. No account or upfront payment needed.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
