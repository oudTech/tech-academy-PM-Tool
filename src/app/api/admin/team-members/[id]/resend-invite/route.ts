import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInviteToken } from "@/lib/tokens";
import { sendInviteEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only resend invites to pending users." },
        { status: 400 },
      );
    }

    const inviterName = request.headers.get("x-user-name") ?? "Your Admin";
    const token = await createInviteToken(user.id);
    await sendInviteEmail(user.email, token, user.name, inviterName, user.role);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST resend-invite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
