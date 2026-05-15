import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projectId = new URL(request.url).searchParams.get("projectId") || "clproject001";

    const [
      tasksByStatus,
      tasksByPriority,
      activeSprint,
      recentActivity,
      upcomingDeadlines,
      teamStats,
      moduleStats,
    ] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { projectId },
        _count: { id: true },
      }),
      prisma.sprint.findFirst({
        where: { projectId, status: "ACTIVE" },
        include: {
          tasks: { select: { id: true, status: true, storyPoints: true } },
        },
      }),
      prisma.activityLog.findMany({
        where: {
          OR: [
            { task: { projectId } },
            { taskId: null },
          ],
        },
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          projectId,
          dueDate: { not: null, gte: new Date() },
          status: { notIn: ["DONE"] },
        },
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          module: { select: { id: true, name: true, color: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          isOnline: true,
          skills: true,
          _count: {
            select: {
              assignedTasks: { where: { projectId } },
            },
          },
        },
      }),
      prisma.task.groupBy({
        by: ["moduleId"],
        where: { projectId, moduleId: { not: null } },
        _count: { id: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      tasksByStatus.map((s) => [s.status, s._count.id])
    );
    const priorityMap = Object.fromEntries(
      tasksByPriority.map((p) => [p.priority, p._count.id])
    );

    const totalTasks = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const completedTasks = statusMap["DONE"] || 0;
    const inProgressTasks = statusMap["IN_PROGRESS"] || 0;
    const pendingTasks = (statusMap["TODO"] || 0) + (statusMap["BACKLOG"] || 0);

    let sprintProgress = 0;
    if (activeSprint) {
      const sprintTotal = activeSprint.tasks.length;
      const sprintDone = activeSprint.tasks.filter((t) => t.status === "DONE").length;
      sprintProgress = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0;
    }

    const moduleIds = moduleStats
      .filter((m) => m.moduleId)
      .map((m) => m.moduleId as string);

    const modules = moduleIds.length > 0
      ? await prisma.projectModule.findMany({
          where: { id: { in: moduleIds } },
          select: { id: true, name: true, module: true, color: true },
        })
      : [];

    const tasksByModule = moduleStats.map((m) => {
      const mod = modules.find((mod) => mod.id === m.moduleId);
      return {
        module: mod?.name || "Unknown",
        count: m._count.id,
        color: mod?.color || "#6366f1",
      };
    });

    const teamStatsFormatted = teamStats.map((user) => ({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isOnline: user.isOnline,
        skills: user.skills,
      },
      taskCount: user._count.assignedTasks,
      completedCount: 0,
    }));

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      sprintProgress,
      activeSprint,
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
      tasksByModule,
      recentActivity,
      upcomingDeadlines,
      teamStats: teamStatsFormatted,
    });
  } catch (error) {
    console.error("GET /api/analytics/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
