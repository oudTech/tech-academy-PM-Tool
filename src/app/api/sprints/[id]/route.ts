import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sprint = await prisma.sprint.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            module: { select: { id: true, name: true, module: true, color: true } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("GET /api/sprints/[id] error:", error);
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

    if (!["ADMIN", "PROJECT_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, ...updates } = body;

    const sprint = await prisma.sprint.update({
      where: { id: params.id },
      data: {
        ...updates,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (updates.status === "ACTIVE") {
      await prisma.activityLog.create({
        data: {
          action: "sprint_started",
          details: `Sprint started: ${sprint.name}`,
          userId: session.sub,
        },
      });
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("PATCH /api/sprints/[id] error:", error);
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

    if (!["ADMIN", "PROJECT_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.updateMany({
      where: { sprintId: params.id },
      data: { sprintId: null },
    });

    await prisma.sprint.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Sprint deleted" });
  } catch (error) {
    console.error("DELETE /api/sprints/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
