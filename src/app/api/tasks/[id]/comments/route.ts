import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = commentSchema.safeParse({ content: body.content, taskId: params.id });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        content: validation.data.content,
        taskId: params.id,
        authorId: session.sub,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "comment_added",
        details: `New comment on: ${task.title}`,
        userId: session.sub,
        taskId: params.id,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
