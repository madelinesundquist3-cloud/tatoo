export const SERVICES = [
  { id: "tattoo", name: "Custom & flash tattoos", shortName: "Tattoos", description: "Start with your own idea or find inspiration in the gallery. Talk through style, size, and placement.", detail: "Bring an idea, a reference, or simply a question.", number: "01" },
  { id: "couples", name: "Couples & duo packages", shortName: "Couples / Duo", description: "Matching or complementary tattoos for two in a shared session. Special package pricing significantly lower per person than individual bookings.", detail: "Two tattoos, one shared session, discounted couples pricing.", number: "02" },
  { id: "removal", name: "Tattoo removal", shortName: "Tattoo removal", description: "Laser removal and fading assessment with a qualified provider. Deposit is credited in full toward your treatment.", detail: "Provider assessment and treatment planning, credited toward your session.", number: "03" },
  { id: "cover-up", name: "Cover-ups", shortName: "Cover-ups", description: "Explore a new design for an existing tattoo, with an assessment of what can realistically be covered.", detail: "Plan around your existing ink, size, and color.", number: "04" },
  { id: "touch-up", name: "Touch-ups", shortName: "Touch-ups", description: "Discuss faded lines, color, or small details that you would like refreshed.", detail: "Review the tattoo and its healing before booking.", number: "05" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export function getService(id: unknown) {
  return SERVICES.find((service) => service.id === id);
}

/** All studio services are bookable with an online deposit that credits toward the final price. */
const DEPOSIT_SERVICE_IDS: readonly ServiceId[] = ["tattoo", "couples", "removal", "cover-up", "touch-up"];
export function acceptsDeposit(id: ServiceId) {
  return DEPOSIT_SERVICE_IDS.includes(id);
}

// Studio pricing. The checkout API charges deposits from this table, never from the browser.
// Review these amounts with the studio owner before launch.
export const SIZE_TIERS = [
  { id: "small", label: "Small / flash", detail: "Up to about 3 in · around 1 hour · 1 person", estimate: 150, deposit: 50, category: "individual" },
  { id: "medium", label: "Medium", detail: "About 3–6 in · 2–3 hours · 1 person", estimate: 350, deposit: 100, category: "individual" },
  { id: "large", label: "Large / half sleeve", detail: "Half-day session · 1 person", estimate: 700, deposit: 150, category: "individual" },
  { id: "full-day", label: "Full sleeve / back piece", detail: "Full-day session; large work may need several · 1 person", estimate: 1200, deposit: 200, category: "individual" },
  { id: "couple-mini", label: "Couples Mini / Flash (2 people)", detail: "Two matching pieces up to 3 in each · $110/person ($220 total vs $300 individual)", estimate: 220, deposit: 70, category: "couple" },
  { id: "couple-medium", label: "Couples Medium Matching (2 people)", detail: "Two matching pieces 3–5 in each · $240/person ($480 total vs $700 individual)", estimate: 480, deposit: 140, category: "couple" },
  { id: "couple-custom", label: "Couples Half-Day Duo Session (2 people)", detail: "Shared half-day session for pair work · $450/person ($900 total vs $1,400 individual)", estimate: 900, deposit: 200, category: "couple" },
] as const;

export type SizeTier = (typeof SIZE_TIERS)[number];
export type SizeTierId = SizeTier["id"];
export function getSizeTier(id: unknown) {
  return SIZE_TIERS.find((tier) => tier.id === id);
}

export function isCoupleTier(tier: SizeTier) {
  return tier.category === "couple";
}

export function getTiersForService(serviceId: ServiceId) {
  if (serviceId === "couples") {
    return SIZE_TIERS.filter((tier) => tier.category === "couple");
  }
  return SIZE_TIERS.filter((tier) => tier.category === "individual");
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
