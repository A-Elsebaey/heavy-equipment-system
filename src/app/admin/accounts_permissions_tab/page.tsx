import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { users, permissions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import PermissionsManager from "./PermissionsManager";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "create", label: "Create account", href: "/admin/create_account_tab", icon: "➕" },
  { key: "manage", label: "Accounts management", href: "/admin/accounts_management_tab", icon: "🗂️" },
  { key: "permissions", label: "Permissions", href: "/admin/accounts_permissions_tab", icon: "🔐" },
];

export default async function PermissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/post-login");

  const targets = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(inArray(users.role, ["technician", "accountant"]))
    .orderBy(users.role, users.username);

  const permRows = await db.select().from(permissions);
  const permMap: Record<number, Record<string, boolean>> = {};
  for (const r of permRows) {
    permMap[r.userId] = (r.permissions as Record<string, boolean>) ?? {};
  }

  return (
    <DashboardShell
      title="Accounts permissions"
      subtitle="Toggle specific tasks for technicians and accountants"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">🔐 Permission control panel</h2>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          Toggle the on/off switches to grant or revoke access to specific
          tasks for each technician and accountant account. Changes are
          audited in the activity log.
        </p>
        {targets.length === 0 ? (
          <p style={{ color: "#8a96b6" }}>
            No technician or accountant accounts yet. Create one from the
            &ldquo;Create account&rdquo; tab.
          </p>
        ) : (
          <PermissionsManager
            accounts={targets}
            initialPerms={permMap}
          />
        )}
      </section>
    </DashboardShell>
  );
}