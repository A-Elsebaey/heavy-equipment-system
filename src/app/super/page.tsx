import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function SuperHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/post-login");

  const nav = [
    { key: "what_can_i_do", label: "What can I do", href: "/super/what_can_i_do", icon: "📘" },
    { key: "admin_tracker", label: "Admin tracker", href: "/super/admin_tracker_tab", icon: "🛡️" },
    { key: "technician_tracker", label: "Technician tracker", href: "/super/technician_tracker_tab", icon: "🛠️" },
    { key: "accountant_tracker", label: "Accountant tracker", href: "/super/accountant_tracker_tab", icon: "📊" },
    { key: "fst_owner", label: "Owner 1 tracker", href: "/super/fst_owner_tracker_tab", icon: "👤" },
    { key: "scd_owner", label: "Owner 2 tracker", href: "/super/scd_owner_tracker_tab", icon: "👤" },
    { key: "trd_owner", label: "Owner 3 tracker", href: "/super/trd_owner_tracker_tab", icon: "👤" },
  ];

  return (
    <DashboardShell
      title="Super Admin Dashboard"
      subtitle="Full system oversight & analytics"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={nav}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Welcome, {user.username}</h2>
          <span className="badge badge-warning">Super Admin</span>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          You have full visibility across the workshop. Use the side panel to
          navigate between tracker tabs and review every account activity.
        </p>
        <div className="grid-cards" style={{ marginTop: 12 }}>
          {nav.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="stat-card"
              style={{ display: "block" }}
            >
              <div style={{ fontSize: 22 }}>{item.icon}</div>
              <div className="stat-value" style={{ fontSize: "1rem" }}>
                {item.label}
              </div>
              <div className="stat-label">Open tab</div>
            </a>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}