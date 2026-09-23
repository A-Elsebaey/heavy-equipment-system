import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, permissions } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("userId"));
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(permissions)
    .where(eq(permissions.userId, userId))
    .limit(1);
  return NextResponse.json({
    ok: true,
    permissions: rows[0]?.permissions ?? {},
  });
}

export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = Number(body.userId);
  const permMap = (body.permissions ?? {}) as Record<string, boolean>;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }

  // Verify target user exists and is technician or accountant
  const targetRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }
  if (!["technician", "accountant"].includes(target.role)) {
    return NextResponse.json(
      { ok: false, error: "Permissions can only be set for technician or accountant accounts" },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(permissions)
    .where(eq(permissions.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(permissions)
      .set({
        permissions: permMap,
        updatedAt: new Date(),
        updatedBy: admin.id,
      })
      .where(eq(permissions.userId, userId));
  } else {
    await db.insert(permissions).values({
      userId,
      permissions: permMap,
      updatedBy: admin.id,
    });
  }

  await logActivity(
    admin,
    "update_permissions",
    `Updated permissions for ${target.username} (${target.role})`,
    "accounts_permissions_tab",
    { userId, permissions: permMap }
  );

  return NextResponse.json({ ok: true });
}