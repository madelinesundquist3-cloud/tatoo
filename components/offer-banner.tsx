"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { OFFER, OFFER_ENDS_AT } from "@/lib/offers";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
}
const currentMinute = () => Math.floor(Date.now() / MINUTE);
// Pages are prerendered, so the server can't know how many days are left; the browser fills it in.
const serverMinute = () => null;

export function OfferBanner() {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute);
  const remaining = minute === null ? null : OFFER_ENDS_AT - minute * MINUTE;
  if (remaining !== null && remaining <= 0) return null;

  const days = remaining === null ? null : Math.ceil(remaining / DAY);
  const countdown = days === null ? `Ends ${OFFER.endsLabel}` : days <= 1 ? "Last day" : `${days} days left`;

  return (
    <div className="flex h-8 items-center justify-center gap-2 whitespace-nowrap bg-[#d3b995] px-4 text-xs text-[#171612] sm:gap-3 sm:text-[13px]">
      <p className="truncate">
        <strong className="font-semibold">{OFFER.percentOff}% off</strong>
        <span className="hidden sm:inline"> tattoos, cover-ups &amp; touch-ups booked by {OFFER.endsLabel}</span>
        <span className="sm:hidden"> until {OFFER.endsLabel}</span>
      </p>
      <span aria-hidden="true">·</span>
      <span className="font-mono">{countdown}</span>
      <Link href="/book" className="font-semibold underline underline-offset-2 hover:no-underline">
        Book now
      </Link>
    </div>
  );
}
