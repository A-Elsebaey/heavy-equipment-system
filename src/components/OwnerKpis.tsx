import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { db } from "@/db";
import { activityLogs, loginLogs } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function OwnerKpis({
  role,
  slug,
}: {
  role: "fst_owner" | "scd_owner" | "trd_owner";
  slug: string;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/post-login");

  await logActivity(user, "view_kpis", "Opened KPIs", `owner/${slug}/kpis`);

  const totalActivity = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityLogs);
  const totalLogins = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginLogs)
    .where(sql`${loginLogs.success} = true`);

  const NAV = [
    { key: "home", label: "Dashboard", href: `/owner/${slug}`, icon: "🏠" },
    { key: "kpis", label: "KPIs", href: `/owner/${slug}/kpis`, icon: "📈" },
    { key: "activity", label: "Activity", href: `/owner/${slug}/activity`, icon: "📜" },
  ];

  return (
    <DashboardShell
      title="KPIs"
      subtitle="Key performance indicators"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📈 Key indicators</h2>
        </div>
        <div className="grid-cards">
          <div className="stat-card">
            <div className="stat-label">Successful logins (all time)</div>
            <div className="stat-value">{totalLogins[0]?.count ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Activity events (all time)</div>
            <div className="stat-value">{totalActivity[0]?.count ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Equipment availability</div>
            <div className="stat-value">82%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average repair time</div>
            <div className="stat-value">3.4 days</div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}