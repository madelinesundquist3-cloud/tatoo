export const SERVICES = [
  { id: "tattoo", name: "Custom & flash tattoos", shortName: "Tattoos", description: "Start with your own idea or find inspiration in the gallery. Talk through style, size, and placement.", detail: "Bring an idea, a reference, or simply a question.", number: "01" },
  { id: "removal", name: "Tattoo removal", shortName: "Tattoo removal", description: "Ready for a change? Start with a consultation about laser removal or fading an existing tattoo.", detail: "A provider assessment comes before any treatment.", number: "02" },
  { id: "cover-up", name: "Cover-ups", shortName: "Cover-ups", description: "Explore a new design for an existing tattoo, with an assessment of what can realistically be covered.", detail: "Plan around your existing ink, size, and color.", number: "03" },
  { id: "touch-up", name: "Touch-ups", shortName: "Touch-ups", description: "Discuss faded lines, color, or small details that you would like refreshed.", detail: "Review the tattoo and its healing before booking.", number: "04" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export function getService(id: unknown) {
  return SERVICES.find((service) => service.id === id);
}

/** Services bookable with an online deposit. Removal starts with a free provider consultation. */
const DEPOSIT_SERVICE_IDS: readonly ServiceId[] = ["tattoo", "cover-up", "touch-up"];
export function acceptsDeposit(id: ServiceId) {
  return DEPOSIT_SERVICE_IDS.includes(id);
}

// Studio pricing. The checkout API charges deposits from this table, never from the browser.
// Review these amounts with the studio owner before launch.
export const SIZE_TIERS = [
  { id: "small", label: "Small / flash", detail: "Up to about 3 in · around 1 hour", estimate: 150, deposit: 50 },
  { id: "medium", label: "Medium", detail: "About 3–6 in · 2–3 hours", estimate: 350, deposit: 100 },
  { id: "large", label: "Large / half sleeve", detail: "Half-day session", estimate: 700, deposit: 150 },
  { id: "full-day", label: "Full sleeve / back piece", detail: "Full-day session; large work may need several", estimate: 1200, deposit: 200 },
] as const;

export type SizeTierId = (typeof SIZE_TIERS)[number]["id"];
export function getSizeTier(id: unknown) {
  return SIZE_TIERS.find((tier) => tier.id === id);
}

/** Suggested starting size for a gallery design, based on where it is placed. */
export function suggestedSizeForPlacement(placement: string): SizeTierId {
  const area = placement.toLowerCase();
  return area.includes("back") || area.includes("sleeve") ? "large" : "medium";
}

export const PLACEMENTS = [
  "Forearm", "Upper arm", "Shoulder", "Chest", "Back", "Ribs / side", "Hip / thigh",
  "Calf / lower leg", "Ankle / foot", "Hand / fingers", "Neck", "Other / not sure",
] as const;
export function isPlacement(value: unknown) {
  return PLACEMENTS.some((placement) => placement === value);
}

export const DEPOSIT_POLICY_VERSION = "2026-09-14";
export const RESCHEDULE_NOTICE_HOURS = 48;

/** Statuses of real bookings: each has a paid deposit, or was entered by the studio. */
export const BOOKING_STATUSES = ["deposit_held", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export function isBookingStatus(value: unknown): value is BookingStatus {
  return BOOKING_STATUSES.some((status) => status === value);
}

/** Checkouts that were never paid. These records are never shown or counted as bookings. */
export const CHECKOUT_STATUSES = ["awaiting_payment", "payment_failed", "payment_expired"] as const;
export function isCheckoutStatus(value: unknown) {
  return CHECKOUT_STATUSES.some((status) => status === value);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export const TIME_PREFERENCES = ["Morning (9 am–12 pm)", "Afternoon (12–5 pm)", "Evening (5–8 pm)", "I'm flexible"] as const;
