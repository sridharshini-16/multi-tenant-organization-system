import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({ complaints: [] });
    }

    const allComplaints = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        description: complaints.description,
        status: complaints.status,
        isAnonymous: complaints.isAnonymous,
        response: complaints.response,
        respondedAt: complaints.respondedAt,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        submittedById: complaints.submittedById,
        organizationId: complaints.organizationId,
        submitterName: users.name,
      })
      .from(complaints)
      .leftJoin(users, eq(complaints.submittedById, users.id))
      .where(eq(complaints.organizationId, currentUser.organizationId))
      .orderBy(desc(complaints.createdAt));

    // Members can only see their own complaints
    if (currentUser.role === "member") {
      const filtered = allComplaints.filter(
        (c) => c.submittedById === currentUser.userId
      );
      return NextResponse.json({ complaints: filtered });
    }

    // Hide anonymous submitter names for org/admin viewing
    const sanitized = allComplaints.map((c) => ({
      ...c,
      submitterName: c.isAnonymous ? "Anonymous" : c.submitterName,
      submittedById: c.isAnonymous ? null : c.submittedById,
    }));

    return NextResponse.json({ complaints: sanitized });
  } catch (error) {
    console.error("Complaints GET error:", error);
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

    if (!currentUser.organizationId) {
      return NextResponse.json(
        { error: "No organization associated" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, isAnonymous } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const [complaint] = await db
      .insert(complaints)
      .values({
        title,
        description,
        organizationId: currentUser.organizationId,
        submittedById: currentUser.userId,
        isAnonymous: isAnonymous || false,
      })
      .returning();

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    console.error("Complaints POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
