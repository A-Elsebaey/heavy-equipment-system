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

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "accountant") redirect("/post-login");

  await logActivity(user, "view_invoices", "Opened invoices list", "accountant/invoices");

  const invoices = [
    { id: "INV-2031", client: "Al-Masra Heavy Haulage", total: 18450, status: "Paid" },
    { id: "INV-2032", client: "Gulf Construction Co.", total: 9620, status: "Pending" },
    { id: "INV-2033", client: "Delta Logistics", total: 24500, status: "Overdue" },
    { id: "INV-2034", client: "Northern Quarries LLC", total: 7120, status: "Pending" },
  ];

  return (
    <DashboardShell
      title="Invoices"
      subtitle="Customer and supplier invoices"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📄 Invoices</h2>
          <span className="badge badge-info">{invoices.length} total</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount (USD)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td>
                    <code>{i.id}</code>
                  </td>
                  <td>{i.client}</td>
                  <td>${i.total.toLocaleString()}</td>
                  <td>
                    {i.status === "Paid" ? (
                      <span className="badge badge-success">Paid</span>
                    ) : i.status === "Pending" ? (
                      <span className="badge badge-warning">Pending</span>
                    ) : (
                      <span className="badge badge-danger">Overdue</span>
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