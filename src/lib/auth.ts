import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users, activityLogs, loginLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SESSION_COOKIE = "hwms_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Role =
  | "super_admin"
  | "admin"
  | "technician"
  | "accountant"
  | "fst_owner"
  | "scd_owner"
  | "trd_owner";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  technician: "Technician",
  accountant: "Accountant",
  fst_owner: "Owner 1",
  scd_owner: "Owner 2",
  trd_owner: "Owner 3",
};

export const CREATABLE_ROLES: Array<{
  value: Exclude<Role, "super_admin" | "admin">;
  label: string;
}> = [
  { value: "technician", label: "Technician Account" },
  { value: "accountant", label: "Accountant Account" },
  { value: "fst_owner", label: "Owner 1 Account" },
  { value: "scd_owner", label: "Owner 2 Account" },
  { value: "trd_owner", label: "Owner 3 Account" },
];

export interface SessionUser {
  id: number;
  username: string;
  role: Role;
  displayName: string | null;
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(
  user: SessionUser,
  ipAddress?: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    userId: user.id,
    username: user.username,
    role: user.role,
    token,
    expiresAt,
    ipAddress: ipAddress ?? null,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = userRows[0];
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role as Role,
    displayName: user.displayName,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function logActivity(
  user: SessionUser | null,
  action: string,
  description?: string,
  page?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
) {
  if (!user) return;
  await db.insert(activityLogs).values({
    userId: user.id,
    username: user.username,
    role: user.role,
    action,
    description: description ?? null,
    page: page ?? null,
    metadata: metadata ?? null,
    ipAddress: ipAddress ?? null,
  });
}

export async function logLoginAttempt(
  username: string,
  role: string | null,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  await db.insert(loginLogs).values({
    username,
    role,
    success,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = rows[0];
  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role as Role,
    displayName: user.displayName,
  };
}

export async function ensureDefaultUsers() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) return;

  const superAdminHash = await hashPassword("A@a161984");
  const adminHash = await hashPassword("@$123");

  await db.insert(users).values([
    {
      username: "sebaey_super",
      passwordHash: superAdminHash,
      role: "super_admin",
      displayName: "Sebaey Super",
      isActive: true,
    },
    {
      username: "admin",
      passwordHash: adminHash,
      role: "admin",
      displayName: "Workshop Administrator",
      isActive: true,
    },
  ]);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;