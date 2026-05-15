import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { emitTaskUpdated, emitTaskDeleted, emitTaskMoved } from "@/lib/socket/emitters";

const taskInclude = {
  assignee: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
  creator: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
  module: { select: { id: true, name: true, module: true, color: true, projectId: true } },
  sprint: { select: { id: true, name: true, status: true, startDate: true, endDate: true, velocity: true, capacity: true, projectId: true, createdById: true, createdAt: true, updatedAt: true } },
  labels: { include: { label: true } },
  comments: {
    include: { author: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  subtasks: {
    select: { id: true, title: true, status: true, priority: true, assigneeId: true, order: true, type: true, storyPoints: true },
  },
  _count: { select: { comments: true, subtasks: true } },
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: taskInclude,
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { dueDate, ...updates } = body;

    const existingTask = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...updates,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: taskInclude,
    });

    if (updates.status) {
      await prisma.activityLog.create({
        data: {
          action: "task_updated",
          details: `Status changed to ${updates.status}`,
          userId: session.sub,
          taskId: params.id,
        },
      }).catch(() => {});

      emitTaskMoved(task.projectId, {
        taskId: task.id,
        projectId: task.projectId,
        fromStatus: existingTask.status,
        toStatus: updates.status,
        triggeredBy: { id: session.sub, name: session.name },
      });
    } else {
      emitTaskUpdated(task.projectId, task, { id: session.sub, name: session.name });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (task.creatorId !== session.sub && session.role !== "ADMIN" && session.role !== "PROJECT_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: params.id } });

    emitTaskDeleted(task.projectId, params.id, { id: session.sub, name: session.name });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
