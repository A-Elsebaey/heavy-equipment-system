import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "home", label: "Dashboard", href: "/technician", icon: "🏠" },
  { key: "equipment", label: "Equipment", href: "/technician/equipment", icon: "🚜" },
  { key: "orders", label: "Work orders", href: "/technician/orders", icon: "📋" },
  { key: "photos", label: "Inspections", href: "/technician/photos", icon: "📷" },
];

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "technician") redirect("/post-login");

  await logActivity(user, "view_work_orders", "Opened work orders", "technician/orders");

  const orders = [
    { id: "WO-1042", equipment: "EX-002", title: "Hydraulic leak repair", status: "Open" },
    { id: "WO-1043", equipment: "DT-007", title: "Track tension adjustment", status: "In progress" },
    { id: "WO-1044", equipment: "LD-014", title: "500-hour service", status: "Open" },
    { id: "WO-1040", equipment: "EX-001", title: "Filter replacement", status: "Closed" },
  ];

  return (
    <DashboardShell
      title="Work orders"
      subtitle="Active maintenance work orders"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📋 Work orders</h2>
          <span className="badge badge-info">{orders.length} orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Equipment</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <code>{o.id}</code>
                  </td>
                  <td>
                    <code>{o.equipment}</code>
                  </td>
                  <td>{o.title}</td>
                  <td>
                    {o.status === "Open" ? (
                      <span className="badge badge-warning">Open</span>
                    ) : o.status === "In progress" ? (
                      <span className="badge badge-info">In progress</span>
                    ) : (
                      <span className="badge badge-success">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}