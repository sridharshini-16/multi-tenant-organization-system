import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, events, complaints, users, taskAuditLogs } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({
        stats: { tasks: 0, events: 0, complaints: 0, members: 0 },
        recentActivity: [],
      });
    }

    const orgId = currentUser.organizationId;

    // Task counts
    const [taskCount] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.organizationId, orgId));

    // Event counts
    const [eventCount] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.organizationId, orgId));

    // Complaint counts
    const [complaintCount] = await db
      .select({ count: count() })
      .from(complaints)
      .where(eq(complaints.organizationId, orgId));

    // Member counts
    const [memberCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(eq(users.organizationId, orgId), eq(users.isActive, true))
      );

    // Recent activity
    const recentActivity = await db
      .select({
        id: taskAuditLogs.id,
        action: taskAuditLogs.action,
        fieldChanged: taskAuditLogs.fieldChanged,
        oldValue: taskAuditLogs.oldValue,
        newValue: taskAuditLogs.newValue,
        createdAt: taskAuditLogs.createdAt,
        taskId: taskAuditLogs.taskId,
        userId: taskAuditLogs.userId,
        userName: users.name,
      })
      .from(taskAuditLogs)
      .leftJoin(users, eq(taskAuditLogs.userId, users.id))
      .where(eq(taskAuditLogs.organizationId, orgId))
      .orderBy(desc(taskAuditLogs.createdAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        tasks: taskCount.count,
        events: eventCount.count,
        complaints: complaintCount.count,
        members: memberCount.count,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
