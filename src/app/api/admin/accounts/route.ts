import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, requireRole, logActivity } from "@/lib/auth";
import { CREATABLE_ROLES, type Role } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      displayName: users.displayName,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.id);
  return NextResponse.json({ ok: true, accounts: rows });
}

export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "");
  const displayName = String(body.displayName ?? "").trim() || null;

  if (!username || !password || !role) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (!CREATABLE_ROLES.find((r) => r.value === role)) {
    return NextResponse.json(
      { ok: false, error: "Invalid role. Admin/super admin accounts cannot be created from here." },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing[0]) {
    return NextResponse.json(
      { ok: false, error: "Username already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      role: role as Role,
      displayName,
      isActive: true,
      createdBy: admin.id,
    })
    .returning();

  await logActivity(
    admin,
    "create_account",
    `Created account ${username} (${role})`,
    "create_account_tab",
    { createdUserId: inserted[0]?.id }
  );

  return NextResponse.json({ ok: true, account: inserted[0] });
}

export async function PATCH(req: Request) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  const updates: Partial<{
    isActive: boolean;
    displayName: string;
    passwordHash: string;
    username: string;
  }> = {};

  if (typeof body.isActive === "boolean") {
    updates.isActive = body.isActive;
  }
  if (typeof body.displayName === "string") {
    updates.displayName = body.displayName;
  }
  if (typeof body.username === "string" && body.username.trim()) {
    updates.username = body.username.trim();
  }
  if (typeof body.password === "string" && body.password) {
    updates.passwordHash = await hashPassword(body.password);
  }

  // Don't allow modifying super admin / admin accounts except toggling displayName
  const targetRows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (target.role === "super_admin" || target.role === "admin") {
    return NextResponse.json(
      { ok: false, error: "Cannot modify admin or super admin accounts" },
      { status: 403 }
    );
  }

  await db.update(users).set(updates).where(eq(users.id, id));
  await logActivity(
    admin,
    "update_account",
    `Updated account id=${id} (${JSON.stringify(updates)})`,
    "accounts_management_tab"
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  const targetRows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (target.role === "super_admin" || target.role === "admin") {
    return NextResponse.json(
      { ok: false, error: "Cannot delete admin or super admin accounts" },
      { status: 403 }
    );
  }

  await db.delete(users).where(eq(users.id, id));
  await logActivity(
    admin,
    "delete_account",
    `Deleted account ${target.username} (${target.role})`,
    "accounts_management_tab",
    { deletedId: id }
  );
  return NextResponse.json({ ok: true });
}