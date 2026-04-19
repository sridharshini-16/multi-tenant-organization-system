import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations } from "@/db/schema";

export async function GET() {
  try {
    const orgs = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .orderBy(organizations.name);

    return NextResponse.json({ organizations: orgs });
  } catch (error) {
    console.error("Orgs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
