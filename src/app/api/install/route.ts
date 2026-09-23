import { NextResponse } from "next/server";
import { db } from "@/db";
import { installation } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ensureDefaultUsers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await ensureDefaultUsers();
  const rows = await db.select().from(installation).limit(1);
  const existing = rows[0];

  const manifest = {
    version: "1.0.0",
    installedAt: new Date().toISOString(),
    modules: [
      "auth",
      "permissions",
      "tracker",
      "dashboard",
      "security",
      "shortcut-generator",
    ],
  };

  if (existing) {
    await db
      .update(installation)
      .set({
        installed: true,
        installedAt: new Date(),
        installedBy: "installer",
        fileManifest: manifest,
      })
      .where(sql`id = ${existing.id}`);
  } else {
    await db.insert(installation).values({
      installed: true,
      installedAt: new Date(),
      installedBy: "installer",
      fileManifest: manifest,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const rows = await db.select().from(installation).limit(1);
  const state = rows[0] ?? null;
  return NextResponse.json({
    installed: state?.installed === true,
    installedAt: state?.installedAt ?? null,
    systemName: state?.systemName ?? null,
  });
}