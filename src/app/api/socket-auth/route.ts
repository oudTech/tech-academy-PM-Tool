import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSessionFromRequest } from "@/lib/auth";

const secret = new TextEncoder().encode(
  process.env.SOCKET_SECRET ?? "socket-fallback-secret-change-in-production"
);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = await new SignJWT({
      sub: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    return NextResponse.json({ token });
  } catch (err) {
    console.error("socket-auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
