import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({ events: [] });
    }

    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        status: events.status,
        startDate: events.startDate,
        endDate: events.endDate,
        maxAttendees: events.maxAttendees,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        createdById: events.createdById,
        organizationId: events.organizationId,
        createdByName: users.name,
      })
      .from(events)
      .leftJoin(users, eq(events.createdById, users.id))
      .where(eq(events.organizationId, currentUser.organizationId))
      .orderBy(desc(events.startDate));

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role === "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json(
        { error: "No organization associated" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, location, startDate, endDate, maxAttendees } =
      body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Title and start date are required" },
        { status: 400 }
      );
    }

    const [event] = await db
      .insert(events)
      .values({
        title,
        description: description || null,
        location: location || null,
        organizationId: currentUser.organizationId,
        createdById: currentUser.userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxAttendees: maxAttendees || null,
      })
      .returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
