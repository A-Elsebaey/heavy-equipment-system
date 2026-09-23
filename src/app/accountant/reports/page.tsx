import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "home", label: "Dashboard", href: "/accountant", icon: "🏠" },
  { key: "invoices", label: "Invoices", href: "/accountant/invoices", icon: "📄" },
  { key: "reports", label: "Reports", href: "/accountant/reports", icon: "📊" },
  { key: "payments", label: "Payments", href: "/accountant/payments", icon: "💳" },
];

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "accountant") redirect("/post-login");

  await logActivity(user, "view_reports", "Opened financial reports", "accountant/reports");

  return (
    <DashboardShell
      title="Reports"
      subtitle="Financial performance"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📊 Financial reports</h2>
        </div>
        <div className="grid-cards">
          <div className="stat-card">
            <div className="stat-label">Revenue this month</div>
            <div className="stat-value">$59,690</div>
            <div style={{ fontSize: "0.85rem", color: "#4ade80", marginTop: 4 }}>
              ↑ 12% vs last month
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Outstanding invoices</div>
            <div className="stat-value">$34,240</div>
            <div style={{ fontSize: "0.85rem", color: "#fbbf24", marginTop: 4 }}>
              Across 6 clients
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Expenses this month</div>
            <div className="stat-value">$28,140</div>
            <div style={{ fontSize: "0.85rem", color: "#f87171", marginTop: 4 }}>
              ↓ 4% vs last month
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net profit</div>
            <div className="stat-value">$31,550</div>
            <div style={{ fontSize: "0.85rem", color: "#4ade80", marginTop: 4 }}>
              Margin: 53%
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}