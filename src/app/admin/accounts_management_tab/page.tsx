import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ne } from "drizzle-orm";
import AccountsManager from "./AccountsManager";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "create", label: "Create account", href: "/admin/create_account_tab", icon: "➕" },
  { key: "manage", label: "Accounts management", href: "/admin/accounts_management_tab", icon: "🗂️" },
  { key: "permissions", label: "Permissions", href: "/admin/accounts_permissions_tab", icon: "🔐" },
];

export default async function AccountsManagementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/post-login");

  const accounts = await db
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

  return (
    <DashboardShell
      title="Accounts management"
      subtitle="Disable, reactivate, delete or edit accounts"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">🗂️ All accounts</h2>
          <span className="badge badge-info">{accounts.length} total</span>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          Use the actions to disable, reactivate, delete, or edit an account.
          Note: the super admin and admin accounts cannot be deleted.
        </p>
        <AccountsManager initialAccounts={accounts} />
      </section>
    </DashboardShell>
  );
}