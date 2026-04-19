import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Members can only update their own profile
    if (currentUser.role === "member" && currentUser.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Org account can update anyone in their org
    const [existingUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, id),
          eq(users.organizationId, currentUser.organizationId)
        )
      )
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, address, department, position, bio, isActive } = body;

    const updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (department !== undefined) updates.department = department;
    if (position !== undefined) updates.position = position;
    if (bio !== undefined) updates.bio = bio;
    if (isActive !== undefined && currentUser.role === "organization") {
      updates.isActive = isActive;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        department: users.department,
        position: users.position,
        bio: users.bio,
        isActive: users.isActive,
      });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Member PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
