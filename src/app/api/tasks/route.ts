import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";
import { emitTaskCreated } from "@/lib/socket/emitters";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "clproject001";
    const sprintId = searchParams.get("sprintId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const moduleId = searchParams.get("moduleId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: Record<string, unknown> = { projectId, parentId: null };
    if (sprintId) where.sprintId = sprintId;
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (assigneeId && assigneeId !== "ALL") where.assigneeId = assigneeId;
    if (moduleId && moduleId !== "ALL") where.moduleId = moduleId;
    if (type && type !== "ALL") where.type = type;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
          creator: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
          module: { select: { id: true, name: true, module: true, color: true, projectId: true } },
          sprint: { select: { id: true, name: true, status: true, startDate: true, endDate: true, velocity: true, capacity: true, projectId: true, createdById: true, createdAt: true, updatedAt: true } },
          labels: { include: { label: true } },
          _count: { select: { comments: true, subtasks: true } },
        },
        orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = taskSchema.safeParse({ ...body, projectId: body.projectId || "clproject001" });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { linkedPRs, dueDate, ...data } = validation.data;

    const lastTask = await prisma.task.findFirst({
      where: { projectId: data.projectId, status: data.status },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        creatorId: session.sub,
        linkedPRs: linkedPRs || [],
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (lastTask?.order ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
        creator: { select: { id: true, name: true, avatar: true, role: true, email: true, isOnline: true, skills: true, bio: true, createdAt: true } },
        module: { select: { id: true, name: true, module: true, color: true, projectId: true } },
        sprint: { select: { id: true, name: true, status: true, startDate: true, endDate: true, velocity: true, capacity: true, projectId: true, createdById: true, createdAt: true, updatedAt: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "task_created",
        details: `Created task: ${task.title}`,
        userId: session.sub,
        taskId: task.id,
      },
    });

    emitTaskCreated(task.projectId, task, { id: session.sub, name: session.name });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
