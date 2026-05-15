import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projectId = new URL(request.url).searchParams.get("projectId") || "clproject001";

    const modules = await prisma.projectModule.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("GET /api/modules error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
