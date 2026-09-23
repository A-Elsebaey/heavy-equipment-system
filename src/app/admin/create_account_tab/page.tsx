import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, CREATABLE_ROLES } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import CreateAccountForm from "./CreateAccountForm";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "create", label: "Create account", href: "/admin/create_account_tab", icon: "➕" },
  { key: "manage", label: "Accounts management", href: "/admin/accounts_management_tab", icon: "🗂️" },
  { key: "permissions", label: "Permissions", href: "/admin/accounts_permissions_tab", icon: "🔐" },
];

export default async function CreateAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/post-login");

  return (
    <DashboardShell
      title="Create account"
      subtitle="Provision new employee accounts"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">➕ New employee account</h2>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          Create a new account with a precise role. Passwords are stored
          using bcrypt (12 rounds) — they cannot be recovered, only reset.
        </p>
        <CreateAccountForm roles={CREATABLE_ROLES} />
      </section>
    </DashboardShell>
  );
}