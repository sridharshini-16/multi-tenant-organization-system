import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, taskAuditLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({ tasks: [] });
    }

    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        organizationId: tasks.organizationId,
        createdByName: users.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdById, users.id))
      .where(eq(tasks.organizationId, currentUser.organizationId))
      .orderBy(desc(tasks.createdAt));

    // For members — they can only see their own tasks or assigned tasks
    if (currentUser.role === "member") {
      const filtered = allTasks.filter(
        (t) =>
          t.createdById === currentUser.userId ||
          t.assignedToId === currentUser.userId
      );
      return NextResponse.json({ tasks: filtered });
    }

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error("Tasks GET error:", error);
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
    const { title, description, status, priority, assignedToId, dueDate } =
      body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description: description || null,
        status: status || "todo",
        priority: priority || "medium",
        organizationId: currentUser.organizationId,
        createdById: currentUser.userId,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    // Create audit log
    await db.insert(taskAuditLogs).values({
      taskId: task.id,
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: "created",
      newValue: title,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
