"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Tattoo } from "@/lib/sample-tattoos";

// All design entry points use the same accessible, full-page consultation flow.
export function BookingModal({ isOpen, onClose, initialTattoo }: { isOpen: boolean; onClose: () => void; initialTattoo?: Tattoo | null }) {
  const router = useRouter();
  useEffect(() => {
    if (!isOpen) return;
    const query = new URLSearchParams({ service: "tattoo" });
    if (initialTattoo) {
      query.set("design", initialTattoo.id);
      // Estimate full amount based on piece scale
      const estimatedPrice = initialTattoo.placement.toLowerCase().includes("back") || initialTattoo.placement.toLowerCase().includes("sleeve")
        ? "600"
        : "280";
      query.set("price", estimatedPrice);
      query.set("deposit", "50");
    }
    router.push("/book?" + query.toString());
    onClose();
  }, [isOpen, initialTattoo, onClose, router]);
  return null;
}
