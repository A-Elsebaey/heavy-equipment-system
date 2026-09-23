import { NextResponse } from "next/server";
import { authenticateUser, createSession, logLoginAttempt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Username and password are required" },
      { status: 400 }
    );
  }

  const user = await authenticateUser(username, password);
  await logLoginAttempt(
    username,
    user?.role ?? null,
    Boolean(user),
    ip,
    req.headers.get("user-agent") ?? undefined
  );

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  await createSession(user, ip);
  return NextResponse.json({ ok: true, role: user.role, username: user.username });
}