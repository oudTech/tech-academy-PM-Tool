import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInviteToken } from "@/lib/tokens";
import { sendInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER", "DESIGNER", "QA_TESTER"]),
});

export async function GET(request: NextRequest) {
  // Role guard enforced by middleware — only ADMIN reaches here
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      image: true,
      isOnline: true,
      createdAt: true,
      inviteTokens: { select: { expiresAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, role } = parsed.data;
    const inviterName = request.headers.get("x-user-name") ?? "Your Admin";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        status: "PENDING",
        // No password — user sets it via invite link
      },
    });

    const token = await createInviteToken(user.id);
    await sendInviteEmail(email, token, name, inviterName, role);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/team-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
