import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/post-login");

  const counts = await db
    .select({
      role: users.role,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.role);

  const total = counts.reduce((s, c) => s + c.count, 0);

  const nav = [
    { key: "create", label: "Create account", href: "/admin/create_account_tab", icon: "➕" },
    { key: "manage", label: "Accounts management", href: "/admin/accounts_management_tab", icon: "🗂️" },
    { key: "permissions", label: "Permissions", href: "/admin/accounts_permissions_tab", icon: "🔐" },
  ];

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Account management & permissions"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={nav}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Welcome, {user.username}</h2>
          <span className="badge badge-info">Admin</span>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          Use the side panel to create new employee accounts, manage existing
          accounts, or adjust permissions.
        </p>
        <div className="grid-cards" style={{ marginTop: 14 }}>
          <div className="stat-card">
            <div className="stat-label">Total accounts</div>
            <div className="stat-value">{total}</div>
          </div>
          {counts.map((c) => (
            <div className="stat-card" key={c.role}>
              <div className="stat-label">
                {c.role.replace("_", " ")}
              </div>
              <div className="stat-value">{c.count}</div>
            </div>
          ))}
        </div>
        <div
          className="grid-cards"
          style={{ marginTop: 18, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          {nav.map((n) => (
            <a
              key={n.key}
              href={n.href}
              className="stat-card"
              style={{ display: "block" }}
            >
              <div style={{ fontSize: 24 }}>{n.icon}</div>
              <div className="stat-value" style={{ fontSize: "1rem" }}>
                {n.label}
              </div>
              <div className="stat-label">Open tab →</div>
            </a>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}