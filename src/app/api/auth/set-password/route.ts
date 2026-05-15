import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateInviteToken, consumeInviteToken } from "@/lib/tokens";
import { z } from "zod";

// GET — validate the token and return the user's name/email so the UI can greet them
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const result = await validateInviteToken(token);
  if (!result) {
    return NextResponse.json({ error: "Invalid or expired invitation link." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { name: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== "PENDING") {
    return NextResponse.json({ error: "This invitation is no longer valid." }, { status: 400 });
  }

  return NextResponse.json({ name: user.name, email: user.email, role: user.role });
}

const setPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST — hash password, activate user, consume token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = setPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const result = await validateInviteToken(token);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { status: true },
    });

    if (!user || user.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been used." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: result.userId },
      data: {
        password: hashed,
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    await consumeInviteToken(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/set-password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
