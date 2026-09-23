import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, permissions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const userRows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const u = userRows[0];

  const permRows = await db
    .select()
    .from(permissions)
    .where(eq(permissions.userId, user.id))
    .limit(1);
  const permMap = (permRows[0]?.permissions as Record<string, boolean>) ?? {};

  return NextResponse.json({
    ok: true,
    userId: u?.id,
    username: u?.username,
    role: u?.role,
    displayName: u?.displayName,
    permissions: permMap,
  });
}