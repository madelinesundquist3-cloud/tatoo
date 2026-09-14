import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TattooDetailView } from "@/components/tattoo-detail-view";
import {
  SAMPLE_TATTOOS,
  getTattooById,
  getRelatedTattoos,
} from "@/lib/sample-tattoos";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return SAMPLE_TATTOOS.map((tattoo) => ({
    id: tattoo.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tattoo = getTattooById(id);

  if (!tattoo) {
    return {
      title: "Tattoo Not Found — Marked Studio",
      description: "The requested tattoo piece could not be found on Marked Studio.",
    };
  }

  return {
    title: `${tattoo.title} — ${tattoo.style} Tattoo | Marked Studio`,
    description:
      tattoo.description ||
      `Discover ${tattoo.title} in ${tattoo.style} on ${tattoo.placement} by @${tattoo.author.username}.`,
    openGraph: {
      title: `${tattoo.title} | Marked Studio`,
      description:
        tattoo.description ||
        `Explore this ${tattoo.style} tattoo on ${tattoo.placement}.`,
      images: [
        {
          url: tattoo.imageUrl,
          width: 900,
          height: 1200,
          alt: tattoo.title,
        },
      ],
    },
  };
}

export default async function TattooDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tattoo = getTattooById(id);

  if (!tattoo) {
    notFound();
  }

  const relatedTattoos = getRelatedTattoos(id, 4);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main id="main-content" className="flex-1 pt-28 pb-20 md:pt-36 md:pb-28">
        <TattooDetailView tattoo={tattoo} relatedTattoos={relatedTattoos} />
      </main>

      <Footer />
    </div>
  );
}
