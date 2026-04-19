import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existingComplaint] = await db
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.id, id),
          eq(complaints.organizationId, currentUser.organizationId)
        )
      )
      .limit(1);

    if (!existingComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Only org can respond and change status
    if (currentUser.role === "organization") {
      const { status, response } = body;
      const [updated] = await db
        .update(complaints)
        .set({
          status: status || existingComplaint.status,
          response: response !== undefined ? response : existingComplaint.response,
          respondedById: currentUser.userId,
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(complaints.id, id))
        .returning();
      return NextResponse.json({ complaint: updated });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Complaint PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
