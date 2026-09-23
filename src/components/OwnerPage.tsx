import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface OwnerPageConfig {
  role: "fst_owner" | "scd_owner" | "trd_owner";
  title: string;
  subtitle: string;
  navLabel: string;
}

export default async function OwnerPage({
  config,
}: {
  config: OwnerPageConfig;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== config.role) redirect("/post-login");

  await logActivity(
    user,
    "view_dashboard",
    `Opened ${config.navLabel} dashboard`,
    config.role
  );

  const countsRows = await db
    .select({ role: users.role, count: sql<number>`count(*)::int` })
    .from(users)
    .groupBy(users.role);
  const byRole: Record<string, number> = {};
  for (const r of countsRows) byRole[r.role] = r.count;
  const totalAccounts = Object.values(byRole).reduce((s, v) => s + v, 0);

  const NAV = [
    { key: "home", label: "Dashboard", href: `/owner/${slugFor(config.role)}`, icon: "🏠" },
    { key: "kpis", label: "KPIs", href: `/owner/${slugFor(config.role)}/kpis`, icon: "📈" },
    { key: "activity", label: "Activity", href: `/owner/${slugFor(config.role)}/activity`, icon: "📜" },
  ];

  return (
    <DashboardShell
      title={config.title}
      subtitle={config.subtitle}
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            Welcome, {user.displayName ?? user.username}
          </h2>
          <span className="badge badge-info">{ROLE_LABELS[user.role]}</span>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          As {ROLE_LABELS[user.role]}, you have a high-level view of the
          workshop. Use the side panel to navigate between KPIs and recent
          activity.
        </p>
        <div className="grid-cards" style={{ marginTop: 14 }}>
          <div className="stat-card">
            <div className="stat-label">Total system accounts</div>
            <div className="stat-value">{totalAccounts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Technicians</div>
            <div className="stat-value">{byRole["technician"] ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Accountants</div>
            <div className="stat-value">{byRole["accountant"] ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Owners</div>
            <div className="stat-value">
              {(byRole["fst_owner"] ?? 0) +
                (byRole["scd_owner"] ?? 0) +
                (byRole["trd_owner"] ?? 0)}
            </div>
          </div>
        </div>
        <div
          className="grid-cards"
          style={{
            marginTop: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {NAV.map((n) => (
            <a
              key={n.key}
              href={n.href}
              className="stat-card"
              style={{ display: "block" }}
            >
              <div style={{ fontSize: 22 }}>{n.icon}</div>
              <div className="stat-value" style={{ fontSize: "1rem" }}>
                {n.label}
              </div>
              <div className="stat-label">Open →</div>
            </a>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

function slugFor(role: "fst_owner" | "scd_owner" | "trd_owner") {
  if (role === "fst_owner") return "first";
  if (role === "scd_owner") return "second";
  return "third";
}