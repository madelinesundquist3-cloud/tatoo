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
export const TIME_PREFERENCES = ["Morning (9 am–12 pm)", "Afternoon (12–5 pm)", "Evening (5–8 pm)", "I'm flexible"] as const;
export function pacificDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)!.value).join("-");
}
export function validPreferredDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  return value > pacificDate(now);
}
