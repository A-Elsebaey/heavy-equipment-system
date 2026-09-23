import { db } from "@/db";
import { installation } from "@/db/schema";
import { ensureDefaultUsers } from "@/lib/auth";
import LandingInstaller from "./LandingInstaller";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDefaultUsers();

  const rows = await db.select().from(installation).limit(1);
  const installState = rows[0] ?? null;
  const isInstalled = installState?.installed === true;

  return (
    <LandingInstaller
      installed={isInstalled}
      systemName={installState?.systemName ?? "Heavy Equipment Workshop Management System"}
    />
  );
}