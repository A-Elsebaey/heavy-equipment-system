import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { loginLogs, activityLogs, users } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "what_can_i_do", label: "What can I do", href: "/super/what_can_i_do", icon: "📘" },
  { key: "admin_tracker", label: "Admin tracker", href: "/super/admin_tracker_tab", icon: "🛡️" },
  { key: "technician_tracker", label: "Technician tracker", href: "/super/technician_tracker_tab", icon: "🛠️" },
  { key: "accountant_tracker", label: "Accountant tracker", href: "/super/accountant_tracker_tab", icon: "📊" },
  { key: "fst_owner", label: "Owner 1 tracker", href: "/super/fst_owner_tracker_tab", icon: "👤" },
  { key: "scd_owner", label: "Owner 2 tracker", href: "/super/scd_owner_tracker_tab", icon: "👤" },
  { key: "trd_owner", label: "Owner 3 tracker", href: "/super/trd_owner_tracker_tab", icon: "👤" },
];

export interface TrackerTabProps {
  title: string;
  subtitle: string;
  roleFilter:
    | "admin"
    | "technician"
    | "accountant"
    | "fst_owner"
    | "scd_owner"
    | "trd_owner";
}

export default async function TrackerTab({
  title,
  subtitle,
  roleFilter,
}: TrackerTabProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/post-login");

  // Count accounts of this role
  const accountCountRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, roleFilter));
  const accountCount = accountCountRows[0]?.count ?? 0;

  // Login stats for this role
  const loginStatsRows = await db
    .select({
      total: sql<number>`count(*)::int`,
      successful: sql<number>`count(*) filter (where ${loginLogs.success} = true)::int`,
      failed: sql<number>`count(*) filter (where ${loginLogs.success} = false)::int`,
    })
    .from(loginLogs)
    .where(eq(loginLogs.role, roleFilter));
  const loginStats = loginStatsRows[0] ?? { total: 0, successful: 0, failed: 0 };

  // Activity stats for this role
  const activityStatsRows = await db
    .select({
      total: sql<number>`count(*)::int`,
      last24: sql<number>`count(*) filter (where ${activityLogs.occurredAt} > now() - interval '1 day')::int`,
      last7: sql<number>`count(*) filter (where ${activityLogs.occurredAt} > now() - interval '7 days')::int`,
    })
    .from(activityLogs)
    .where(eq(activityLogs.role, roleFilter));
  const activityStats = activityStatsRows[0] ?? { total: 0, last24: 0, last7: 0 };

  // Recent login attempts
  const recentLogins = await db
    .select()
    .from(loginLogs)
    .where(eq(loginLogs.role, roleFilter))
    .orderBy(sql`${loginLogs.attemptedAt} desc`)
    .limit(15);

  // Recent activity
  const recentActivity = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.role, roleFilter))
    .orderBy(sql`${activityLogs.occurredAt} desc`)
    .limit(20);

  // Account list
  const accounts = await db
    .select()
    .from(users)
    .where(eq(users.role, roleFilter))
    .orderBy(sql`${users.createdAt} desc`);

  return (
    <DashboardShell
      title={title}
      subtitle={subtitle}
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      {/* Stat cards */}
      <div className="grid-cards" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-label">Accounts in role</div>
          <div className="stat-value">{accountCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total login attempts</div>
          <div className="stat-value">{loginStats.total}</div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: 4 }}>
            ✓ {loginStats.successful} succeeded
          </div>
          <div style={{ fontSize: "0.8rem", color: "#f87171" }}>
            ✗ {loginStats.failed} failed
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activity events</div>
          <div className="stat-value">{activityStats.total}</div>
          <div style={{ fontSize: "0.8rem", color: "#8a96b6", marginTop: 4 }}>
            {activityStats.last24} in last 24h
          </div>
          <div style={{ fontSize: "0.8rem", color: "#8a96b6" }}>
            {activityStats.last7} in last 7 days
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active accounts</div>
          <div className="stat-value">
            {accounts.filter((a) => a.isActive).length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#8a96b6", marginTop: 4 }}>
            of {accounts.length} total
          </div>
        </div>
      </div>

      {/* Account list */}
      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h2 className="panel-title">👥 Accounts on this role</h2>
        </div>
        {accounts.length === 0 ? (
          <p style={{ color: "#8a96b6", margin: 0 }}>
            No accounts exist for this role yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Display name</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <code>{a.username}</code>
                    </td>
                    <td>{a.displayName ?? "—"}</td>
                    <td>
                      {a.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Disabled</span>
                      )}
                    </td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Login attempts */}
      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h2 className="panel-title">🔐 Recent login attempts</h2>
          <span className="badge badge-info">Latest 15</span>
        </div>
        {recentLogins.length === 0 ? (
          <p style={{ color: "#8a96b6", margin: 0 }}>No login attempts yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Status</th>
                  <th>IP</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <code>{l.username}</code>
                    </td>
                    <td>
                      {l.success ? (
                        <span className="badge badge-success">Success</span>
                      ) : (
                        <span className="badge badge-danger">Failed</span>
                      )}
                    </td>
                    <td style={{ color: "#8a96b6" }}>{l.ipAddress ?? "—"}</td>
                    <td>{new Date(l.attemptedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity */}
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📝 Recent activity events</h2>
          <span className="badge badge-info">Latest 20</span>
        </div>
        {recentActivity.length === 0 ? (
          <p style={{ color: "#8a96b6", margin: 0 }}>No activity recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Page</th>
                  <th>Description</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <code>{a.username}</code>
                    </td>
                    <td>
                      <span className="badge badge-info">{a.action}</span>
                    </td>
                    <td style={{ color: "#8a96b6" }}>{a.page ?? "—"}</td>
                    <td>{a.description ?? "—"}</td>
                    <td>{new Date(a.occurredAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}