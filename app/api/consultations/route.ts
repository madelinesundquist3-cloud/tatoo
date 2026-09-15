import { getService, TIME_PREFERENCES } from "@/lib/services";
import { getLocation, validPreferredDate } from "@/lib/locations";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const bookings = await prisma.booking.findMany({
      where: { sessionType: "Consultation Request" },
      orderBy: { createdAt: "desc" }, take: 100,
      select: { ref: true, clientName: true, clientEmail: true, tattooTitle: true, location: true, date: true, time: true, notes: true, status: true, createdAt: true },
    });
    return Response.json({ bookings }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Requests could not be loaded. Please try again." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Please submit your request from this website." }, { status: 403 });
  }
  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 6000) return Response.json({ error: "Your request is too long." }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    data = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Please check your request and try again." }, { status: 400 });
  }
  const service = getService(data.service);
  const location = getLocation(data.location);
  const fields = ["name", "email", "phone", "notes", "date", "time", "requestId"] as const;
  if (fields.some((key) => typeof data[key] !== "string") || !service || !location || data.consent !== true) {
    return Response.json({ error: "Choose a studio and a service, enter your contact details, and accept the privacy notice." }, { status: 400 });
  }
  const values = Object.fromEntries(fields.map((key) => [key, (data[key] as string).trim()])) as Record<(typeof fields)[number], string>;
  if (!values.name || values.name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254 || values.phone.length > 30 || values.notes.length > 1000 || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(values.requestId)) {
    return Response.json({ error: "Please check your name, email, and request details." }, { status: 400 });
  }
  if ((values.date && !validPreferredDate(values.date, location.timeZone)) || !TIME_PREFERENCES.some((slot) => slot === values.time)) {
    return Response.json({ error: "Please choose a future date and a valid time preference." }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) return Response.json({ error: "Consultation requests are temporarily unavailable. Please try again later." }, { status: 503 });
  try {
    // The unique reference makes a network retry safe without creating another request.
    const ref = "MS-" + values.requestId;
    const booking = await prisma.booking.upsert({
      where: { ref },
      update: {},
      create: {
        ref, clientName: values.name, clientEmail: values.email,
        tattooTitle: service.name, tattooImage: "", style: service.id,
        placement: "Discuss at consultation", size: "Discuss at consultation",
        location: location.id,
        date: values.date || "Flexible", time: `${values.time} · ${location.timeZoneLabel}`,
        sessionType: "Consultation Request", depositPaid: 0, estimatedTotal: 0,
        status: "pending",
        notes: JSON.stringify({ phone: values.phone, message: values.notes, service: service.id, city: location.city, consent: true, privacyNoticeVersion: "2026-09-14" }),
      },
      select: { ref: true },
    });
    return Response.json({ ref: booking.ref, status: "pending" }, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn’t save your request. Please try again shortly. No payment has been taken." }, { status: 503 });
  }
}
