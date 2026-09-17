// Marked Studio locations. Bookings, preferred dates, and time windows use each studio's
// local time zone. Confirm these cities and add street addresses, phone numbers, and hours
// before launch.
export const LOCATIONS = [
  { id: "austin", city: "Austin", state: "Texas", stateCode: "TX", timeZone: "America/Chicago", timeZoneLabel: "Central Time" },
  { id: "boston", city: "Boston", state: "Massachusetts", stateCode: "MA", timeZone: "America/New_York", timeZoneLabel: "Eastern Time" },
  { id: "fargo", city: "Fargo", state: "North Dakota", stateCode: "ND", timeZone: "America/Chicago", timeZoneLabel: "Central Time" },
  { id: "las-vegas", city: "Las Vegas", state: "Nevada", stateCode: "NV", timeZone: "America/Los_Angeles", timeZoneLabel: "Pacific Time" },
  { id: "portland", city: "Portland", state: "Oregon", stateCode: "OR", timeZone: "America/Los_Angeles", timeZoneLabel: "Pacific Time" },
  { id: "providence", city: "Providence", state: "Rhode Island", stateCode: "RI", timeZone: "America/New_York", timeZoneLabel: "Eastern Time" },
  { id: "seattle", city: "Seattle", state: "Washington", stateCode: "WA", timeZone: "America/Los_Angeles", timeZoneLabel: "Pacific Time" },
] as const;

export type StudioLocation = (typeof LOCATIONS)[number];
export type LocationId = StudioLocation["id"];

export function getLocation(id: unknown) {
  return LOCATIONS.find((location) => location.id === id);
}

/** "Austin, TX" */
export function locationName(location: { city: string; stateCode: string }) {
  return `${location.city}, ${location.stateCode}`;
}

/** The studio for a stored booking. Defaults to the primary studio if unset. */
export function bookingLocation(id: string | null | undefined): StudioLocation {
  return getLocation(id) ?? LOCATIONS[0];
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function dateInTimeZone(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)!.value).join("-");
}

/** A real calendar date strictly after today in the studio's time zone. */
export function validPreferredDate(value: string, timeZone: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  return value > dateInTimeZone(timeZone, now);
}
