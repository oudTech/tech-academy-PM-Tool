import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { sprintSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projectId = new URL(request.url).searchParams.get("projectId") || "clproject001";

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            storyPoints: true,
            assigneeId: true,
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error("GET /api/sprints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["ADMIN", "PROJECT_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = sprintSchema.safeParse({
      ...body,
      projectId: body.projectId || "clproject001",
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { startDate, endDate, ...data } = validation.data;

    const sprint = await prisma.sprint.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById: session.sub,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "sprint_created",
        details: `Created sprint: ${sprint.name}`,
        userId: session.sub,
      },
    });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sprints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
