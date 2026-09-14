import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory fallback for local environments without database connection
let globalBookings: any[] = [];

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const dbBookings = await prisma.booking.findMany({
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
        date: b.date,
        time: b.time,
        sessionType: b.sessionType,
        depositPaid: b.depositPaid,
        estimatedTotal: b.estimatedTotal,
        status: b.status,
        notes: b.notes || "",
        createdAt: b.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        bookings: formatted,
      });
    }

    return NextResponse.json({
      success: true,
      bookings: globalBookings,
    });
  } catch (error: any) {
    console.error("Failed to load bookings from database:", error);
    return NextResponse.json({
      success: true,
      bookings: globalBookings,
      warning: "Loaded from memory fallback",
    });
  }
}

export async function POST(req: Request) {
  try {
    const booking = await req.json();

    if (!booking || !booking.ref) {
      return NextResponse.json(
        { success: false, error: "Invalid booking data" },
        { status: 400 }
      );
    }

    const newEntry = {
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
      date: booking.date || "Pending",
      time: booking.time || "12:00 PM",
      sessionType: booking.sessionType || "Studio Appointment",
      depositPaid: Number(booking.depositPaid) || 50,
      estimatedTotal: Number(booking.estimatedTotal) || 280,
      status: booking.status || "deposit_held",
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
        console.warn("Could not upsert booking to database:", dbErr);
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (process.env.DATABASE_URL && id) {
      try {
        await prisma.booking.updateMany({
          where: { OR: [{ id }, { ref: id }] },
          data: { status },
        });
      } catch (dbErr) {
        console.warn("Could not update booking in database:", dbErr);
      }
    }

    globalBookings = globalBookings.map((b) =>
      b.id === id || b.ref === id ? { ...b, status } : b
    );

    return NextResponse.json({
      success: true,
      bookings: globalBookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
