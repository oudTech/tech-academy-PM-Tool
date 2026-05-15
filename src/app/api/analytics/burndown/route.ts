import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { eachDayOfInterval, format, isBefore, isAfter } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sprintId = new URL(request.url).searchParams.get("sprintId");
    if (!sprintId) return NextResponse.json({ error: "sprintId required" }, { status: 400 });

    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        tasks: {
          select: { id: true, storyPoints: true, status: true, updatedAt: true },
        },
      },
    });

    if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const today = new Date();

    const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);

    const days = eachDayOfInterval({
      start,
      end: isBefore(today, end) ? today : end,
    });

    const dayCount = eachDayOfInterval({ start, end }).length;
    const pointsPerDay = totalPoints / Math.max(dayCount - 1, 1);

    const burndownData = days.map((day, idx) => {
      const ideal = Math.max(0, totalPoints - pointsPerDay * idx);

      const completedPoints = sprint.tasks
        .filter((t) => t.status === "DONE" && !isAfter(new Date(t.updatedAt), day))
        .reduce((sum, t) => sum + (t.storyPoints || 1), 0);

      const actual = Math.max(0, totalPoints - completedPoints);

      return {
        date: format(day, "MMM d"),
        ideal: Math.round(ideal),
        actual: Math.round(actual),
      };
    });

    return NextResponse.json({ burndown: burndownData, totalPoints, sprintName: sprint.name });
  } catch (error) {
    console.error("GET /api/analytics/burndown error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
