"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Tattoo } from "@/lib/sample-tattoos";
import { suggestedSizeForPlacement } from "@/lib/services";

// All design entry points use the same accessible, full-page booking flow.
export function BookingModal({ isOpen, onClose, initialTattoo }: { isOpen: boolean; onClose: () => void; initialTattoo?: Tattoo | null }) {
  const router = useRouter();
  useEffect(() => {
    if (!isOpen) return;
    const query = new URLSearchParams({ service: "tattoo" });
    if (initialTattoo) {
      query.set("design", initialTattoo.id);
      // Pre-select a size from the piece's placement; the server prices the deposit.
      query.set("size", suggestedSizeForPlacement(initialTattoo.placement));
    }
    router.push("/book?" + query.toString());
    onClose();
  }, [isOpen, initialTattoo, onClose, router]);
  return null;
}
