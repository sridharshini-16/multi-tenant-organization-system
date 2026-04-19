import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, taskAuditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [task] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.organizationId, currentUser.organizationId)
        )
      )
      .limit(1);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Members can only see own tasks
    if (
      currentUser.role === "member" &&
      task.createdById !== currentUser.userId &&
      task.assignedToId !== currentUser.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const auditLogs = await db
      .select()
      .from(taskAuditLogs)
      .where(eq(taskAuditLogs.taskId, id))
      .orderBy(taskAuditLogs.createdAt);

    return NextResponse.json({ task, auditLogs });
  } catch (error) {
    console.error("Task GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.organizationId, currentUser.organizationId)
        )
      )
      .limit(1);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Members cannot edit tasks
    if (currentUser.role === "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admins can only edit tasks they created
    if (
      currentUser.role === "admin" &&
      existingTask.createdById !== currentUser.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, priority, assignedToId, dueDate } =
      body;

    const updates = {
      updatedAt: new Date(),
    };

    const auditEntries = [];

    if (title && title !== existingTask.title) {
      auditEntries.push({
        field: "title",
        oldValue: existingTask.title,
        newValue: title,
      });
      updates.title = title;
    }
    if (description !== undefined && description !== existingTask.description) {
      updates.description = description;
    }
    if (status && status !== existingTask.status) {
      auditEntries.push({
        field: "status",
        oldValue: existingTask.status,
        newValue: status,
      });
      updates.status = status;
      if (status === "done") {
        updates.completedAt = new Date();
      }
    }
    if (priority && priority !== existingTask.priority) {
      auditEntries.push({
        field: "priority",
        oldValue: existingTask.priority,
        newValue: priority,
      });
      updates.priority = priority;
    }
    if (assignedToId !== undefined) {
      if (assignedToId !== existingTask.assignedToId) {
        auditEntries.push({
          field: "assignedTo",
          oldValue: existingTask.assignedToId,
          newValue: assignedToId,
        });
      }
      updates.assignedToId = assignedToId || null;
    }
    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    // Create audit logs
    for (const entry of auditEntries) {
      await db.insert(taskAuditLogs).values({
        taskId: id,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        action: entry.field === "status" ? "status_changed" : "updated",
        fieldChanged: entry.field,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
      });
    }

    if (auditEntries.length === 0) {
      await db.insert(taskAuditLogs).values({
        taskId: id,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        action: "updated",
      });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Task PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role === "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.organizationId, currentUser.organizationId)
        )
      )
      .limit(1);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Admins can only delete tasks they created
    if (
      currentUser.role === "admin" &&
      existingTask.createdById !== currentUser.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
