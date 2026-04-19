import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      organizationName,
      organizationId,
      phone,
      address,
      department,
      position,
      bio,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    if (!["organization", "admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    let orgId = null;

    if (role === "organization") {
      // Creating org account — must provide org name
      if (!organizationName) {
        return NextResponse.json(
          { error: "Organization name is required" },
          { status: 400 }
        );
      }

      // Check org name uniqueness
      const existingOrg = await db
        .select()
        .from(organizations)
        .where(eq(organizations.name, organizationName))
        .limit(1);

      if (existingOrg.length > 0) {
        return NextResponse.json(
          { error: "Organization name already taken" },
          { status: 409 }
        );
      }

      const [org] = await db
        .insert(organizations)
        .values({ name: organizationName })
        .returning();

      orgId = org.id;
    } else {
      // admin or member — org is optional
      if (organizationId) {
        const org = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1);

        if (org.length === 0) {
          return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 }
          );
        }
        orgId = organizationId;
      } else if (organizationName) {
        // Try to find org by name
        const org = await db
          .select()
          .from(organizations)
          .where(eq(organizations.name, organizationName))
          .limit(1);

        if (org.length > 0) {
          orgId = org[0].id;
        }
      }
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role,
        organizationId: orgId,
        phone: phone || null,
        address: address || null,
        department: department || null,
        position: position || null,
        bio: bio || null,
      })
      .returning();

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
