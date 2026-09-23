import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function OwnerActivity({
  role,
  slug,
}: {
  role: "fst_owner" | "scd_owner" | "trd_owner";
  slug: string;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/post-login");

  await logActivity(user, "view_activity", "Opened activity feed", `owner/${slug}/activity`);

  const rows = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.occurredAt))
    .limit(40);

  const NAV = [
    { key: "home", label: "Dashboard", href: `/owner/${slug}`, icon: "🏠" },
    { key: "kpis", label: "KPIs", href: `/owner/${slug}/kpis`, icon: "📈" },
    { key: "activity", label: "Activity", href: `/owner/${slug}/activity`, icon: "📜" },
  ];

  return (
    <DashboardShell
      title="Activity feed"
      subtitle="Recent activity across the workshop"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📜 Recent activity</h2>
          <span className="badge badge-info">Latest 40</span>
        </div>
        {rows.length === 0 ? (
          <p style={{ color: "#8a96b6", margin: 0 }}>
            No activity recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Page</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.occurredAt).toLocaleString()}</td>
                    <td>
                      <code>{r.username}</code>
                    </td>
                    <td>
                      <span className="badge badge-info">{r.role}</span>
                    </td>
                    <td>
                      <span className="badge badge-warning">{r.action}</span>
                    </td>
                    <td style={{ color: "#8a96b6" }}>{r.page ?? "—"}</td>
                    <td>{r.description ?? "—"}</td>
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