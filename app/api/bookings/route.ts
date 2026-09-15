import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, verifyUser } from "@/lib/require-admin";
import { BOOKING_STATUSES, isBookingStatus } from "@/lib/services";
import { getLocation } from "@/lib/locations";

interface BookingEntry {
  id: string;
  ref: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  clientUsername: string;
  tattooTitle: string;
  tattooImage: string;
  style: string;
  placement: string;
  size: string;
  location: string | null;
  date: string;
  time: string;
  sessionType: string;
  depositPaid: number;
  estimatedTotal: number;
  status: string;
  notes: string;
  createdAt: string;
}

// In-memory fallback for local environments without database connection
let globalBookings: BookingEntry[] = [];

const NO_STORE = { "Cache-Control": "private, no-store" };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

// Lists paid bookings only. Unpaid checkouts and free consultation requests are not bookings.
export async function GET(req: Request) {
  const viewer = await verifyUser(req);
  if (viewer instanceof Response) return viewer;

  const { searchParams } = new URL(req.url);
  // Only the studio admin may look up other clients or filter by studio; everyone else sees their own bookings.
  const email = viewer.isAdmin ? searchParams.get("email") : viewer.email;
  const location = viewer.isAdmin ? getLocation(searchParams.get("location"))?.id ?? null : null;
  const ref = searchParams.get("ref");
  const visibleMemoryBookings = () =>
    globalBookings.filter(
      (b) =>
        isBookingStatus(b.status) &&
        (!email || b.clientEmail.toLowerCase() === email.toLowerCase()) &&
        (!location || b.location === location) &&
        (!ref || b.ref === ref)
    );

  try {
    if (process.env.DATABASE_URL) {
      const whereClause: Record<string, unknown> = { status: { in: [...BOOKING_STATUSES] } };
      if (email) {
        whereClause.clientEmail = { equals: email, mode: "insensitive" };
      }
      if (location) {
        whereClause.location = location;
      }
      if (ref) {
        whereClause.ref = ref;
      }

      const dbBookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      // Format to ensure all admin UI properties are present
      const formatted = dbBookings.map((b) => ({
        id: b.id,
        ref: b.ref,
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        clientAvatar: b.clientAvatar || "",
        clientUsername: b.clientUsername || "",
        tattooTitle: b.tattooTitle,
        tattooImage: b.tattooImage || "https://images.unsplash.com/photo-1590246814883-5783515f4835?auto=format&fit=crop&w=400&q=80",
        style: b.style,
        placement: b.placement,
        size: b.size,
        location: b.location ?? null,
        date: b.date,
        time: b.time,
        sessionType: b.sessionType,
        depositPaid: b.depositPaid,
        estimatedTotal: b.estimatedTotal,
        status: b.status,
        notes: b.notes || "",
        createdAt: b.createdAt.toISOString(),
      }));

      return NextResponse.json({ success: true, bookings: formatted }, { headers: NO_STORE });
    }

    return NextResponse.json({ success: true, bookings: visibleMemoryBookings() }, { headers: NO_STORE });
  } catch (error) {
    // Never present a database outage as an empty list of bookings.
    console.error("Failed to load bookings from database:", error);
    return NextResponse.json(
      { success: false, error: "Bookings couldn’t be loaded because the database is unavailable. Please try again shortly." },
      { status: 503, headers: NO_STORE }
    );
  }
}

// Studio-entered booking (e.g. a deposit taken in person). Admin only.
export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const booking = await req.json();

    if (!booking || !booking.ref) {
      return NextResponse.json(
        { success: false, error: "Invalid booking data" },
        { status: 400 }
      );
    }

    const newEntry: BookingEntry = {
      id: booking.id || `bk-${Date.now()}`,
      ref: booking.ref,
      clientName: booking.clientName || "Client",
      clientEmail: booking.clientEmail || "",
      clientAvatar: booking.clientAvatar || "",
      clientUsername: booking.clientUsername || "",
      tattooTitle: booking.tattooTitle || "Custom Tattoo",
      tattooImage:
        booking.tattooImage ||
        "https://images.unsplash.com/photo-1590246814883-5783515f4835?auto=format&fit=crop&w=400&q=80",
      style: booking.style || "Custom",
      placement: booking.placement || "Forearm",
      size: booking.size || "Medium",
      location: getLocation(booking.location)?.id ?? null,
      date: booking.date || "Pending",
      time: booking.time || "12:00 PM",
      sessionType: booking.sessionType || "Studio Appointment",
      depositPaid: Number(booking.depositPaid) || 0,
      estimatedTotal: Number(booking.estimatedTotal) || 0,
      status: isBookingStatus(booking.status) ? booking.status : "deposit_held",
      notes: typeof booking.notes === "string" ? booking.notes : JSON.stringify(booking.notes || {}),
      createdAt: booking.createdAt || new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      try {
        await prisma.booking.upsert({
          where: { ref: newEntry.ref },
          update: {
            status: newEntry.status,
            depositPaid: newEntry.depositPaid,
            estimatedTotal: newEntry.estimatedTotal,
            location: newEntry.location,
            date: newEntry.date,
            time: newEntry.time,
            notes: newEntry.notes,
          },
          create: {
            ref: newEntry.ref,
            clientName: newEntry.clientName,
            clientEmail: newEntry.clientEmail,
            clientAvatar: newEntry.clientAvatar,
            clientUsername: newEntry.clientUsername,
            tattooTitle: newEntry.tattooTitle,
            tattooImage: newEntry.tattooImage,
            style: newEntry.style,
            placement: newEntry.placement,
            size: newEntry.size,
            location: newEntry.location,
            date: newEntry.date,
            time: newEntry.time,
            sessionType: newEntry.sessionType,
            depositPaid: newEntry.depositPaid,
            estimatedTotal: newEntry.estimatedTotal,
            status: newEntry.status,
            notes: newEntry.notes,
          },
        });
      } catch (dbErr) {
        console.error("Could not upsert booking to database:", dbErr);
        return NextResponse.json(
          { success: false, error: "The booking couldn’t be saved because the database is unavailable." },
          { status: 503 }
        );
      }
    }

    // Prepend to server memory store, replacing any with same ref
    globalBookings = [
      newEntry,
      ...globalBookings.filter((b) => b.ref !== newEntry.ref),
    ];

    return NextResponse.json({
      success: true,
      booking: newEntry,
      total: globalBookings.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id, status } = await req.json();

    if (typeof id !== "string" || !id || !isBookingStatus(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking id or status" },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      try {
        // Unpaid checkouts can't be promoted to bookings from here.
        await prisma.booking.updateMany({
          where: { OR: [{ id }, { ref: id }], status: { in: [...BOOKING_STATUSES] } },
          data: { status },
        });
      } catch (dbErr) {
        console.error("Could not update booking in database:", dbErr);
        return NextResponse.json(
          { success: false, error: "The status change couldn’t be saved because the database is unavailable." },
          { status: 503 }
        );
      }
    }

    globalBookings = globalBookings.map((b) =>
      b.id === id || b.ref === id ? { ...b, status } : b
    );

    return NextResponse.json({
      success: true,
      bookings: globalBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}
