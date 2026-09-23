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

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "accountant") redirect("/post-login");

  await logActivity(user, "view_payments", "Opened payments", "accountant/payments");

  return (
    <DashboardShell
      title="Payments"
      subtitle="Pending and approved payments"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">💳 Payments queue</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>PAY-5012</code>
                </td>
                <td>Caterpillar Parts</td>
                <td>$8,420</td>
                <td>
                  <span className="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>
                  <code>PAY-5013</code>
                </td>
                <td>Hydraulics Wholesale</td>
                <td>$3,150</td>
                <td>
                  <span className="badge badge-success">Approved</span>
                </td>
              </tr>
              <tr>
                <td>
                  <code>PAY-5014</code>
                </td>
                <td>Fuel Suppliers Co.</td>
                <td>$2,300</td>
                <td>
                  <span className="badge badge-warning">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}